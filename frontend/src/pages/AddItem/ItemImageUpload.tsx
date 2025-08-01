import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectUploadUrls,
  setUploadImageType,
  uploadToBucket,
} from "@/store/slices/itemImagesSlice";
import { CreateItemType } from "@/store/utils/validate";
import { DetailImageData, FileWithMetadata, MainImageData } from "@/types";
import { Info, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { UseFormSetValue } from "react-hook-form";
import { toast } from "sonner";

type ItemImageUploadProps = {
  item_id: string;
  updateForm: UseFormSetValue<CreateItemType>;
};
const getDefaultMeta = (imageType: "main" | "detail") => ({
  image_type: imageType,
  display_order: 0,
  alt_text: "",
  is_active: false,
});

function ItemImageUpload(props: ItemImageUploadProps) {
  const { item_id, updateForm } = props;
  const dispatch = useAppDispatch();
  const uploadedImages = useAppSelector(selectUploadUrls);
  const [mainImageData, setMainImageData] = useState<MainImageData>({
    image: {
      file: null,
      metadata: {
        image_type: "main",
        display_order: 0,
        alt_text: "",
        is_active: false,
      },
    },
    preview: null,
    loading: false,
  });
  const [detailData, setDetailData] = useState<DetailImageData>({
    images: [],
    previews: [],
    loading: false,
  });

  const submitMain = () => {
    console.log("Submitting image! ...");
    try {
      void dispatch(setUploadImageType("main"));
      void dispatch(
        uploadToBucket({
          files: [mainImageData.image as FileWithMetadata],
          bucket: "item-images-drafts",
          uuid: item_id,
        }),
      );
      console.log("uploadedImages: ", uploadedImages);
      updateForm("mainImage", uploadedImages.urls[0]);
    } catch (error) {
      console.log(error);
      toast.error("File upload failed. Reach out to us if the issue persists");
    }
  };

  const submitDetail = () => {
    console.log("Submitting images! ...");
    try {
      void dispatch(setUploadImageType("detail"));
      void dispatch(
        uploadToBucket({
          files: detailData.images,
          bucket: "item-images-drafts",
          uuid: item_id,
        }),
      );
      console.log("image urls: ", uploadedImages);
    } catch (error) {
      console.log(error);
      toast.error("File upload failed. Reach out to us if the issue persists");
    }
  };

  const handleMainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    const { image } = mainImageData;
    setMainImageData({
      ...mainImageData,
      image: {
        file: image?.file,
        metadata: {
          ...image?.metadata,
          [name]: value,
        },
      },
    });
  };
  const handleDetailChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const { name, value } = e.currentTarget;
    if (name !== "alt_text" || isNaN(index)) return;

    setDetailData((prev) => {
      if (!prev || !prev.images[index]) return prev;

      const updatedImages = [...prev.images];
      const currentImage = updatedImages[index];

      updatedImages[index] = {
        ...currentImage,
        metadata: {
          ...currentImage.metadata,
          alt_text: value,
        },
      };

      return {
        ...prev,
        images: updatedImages,
      };
    });
  };

  const validateImageFile = (file: File) => {
    const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
    const isImage = file.type.startsWith("image/");
    if (!isValidSize) throw new Error(`${file.name} is too large`);
    if (!isImage) throw new Error(`${file.name} is not an image`);
    return isValidSize && isImage;
  };

  const handleDelete = (
    e: React.MouseEvent<HTMLButtonElement>,
    index: number,
  ) => {
    e.preventDefault();
    setDetailData({
      ...detailData,
      images: detailData.images.filter((_, idx) => idx !== index),
      previews: detailData.previews.filter((_, idx) => idx !== index),
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.currentTarget;
    if (!e.target.files) return;

    try {
      if (name === "detail") {
        if (
          e.target.files.length > 5 ||
          detailData.previews.length + e.target.files.length > 5
        )
          throw new Error("Only 5 images allowed");

        const newImages: FileWithMetadata[] = [];
        const newPreviews: string[] = [];

        for (const image of e.target.files) {
          validateImageFile(image);
          const objectUrl = URL.createObjectURL(image);
          newPreviews.push(objectUrl);
          newImages.push({
            file: image,
            metadata: getDefaultMeta("detail"),
          });
        }

        setDetailData({
          ...detailData,
          images: [...detailData.images, ...newImages],
          previews: [...detailData.previews, ...newPreviews],
        });

        return;
      }
      if (e.target.files.length > 1)
        throw new Error(`Only 1 image allowed for ${name} type`);
      const newImg = e.target.files[0];
      validateImageFile(newImg);
      const objectUrl = URL.createObjectURL(newImg);
      const { metadata } = mainImageData.image;
      setMainImageData({
        ...mainImageData,
        image: { file: newImg, metadata },
        preview: objectUrl,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(message);
    }
  };

  /*-------------------side effects------------------------------------------*/

  /* Update form when dispatch has completed */
  useEffect(() => {
    if (uploadedImages) {
      const { imageType, urls } = uploadedImages;
      if (imageType === "main") updateForm("mainImage", urls[0]);
      else updateForm("detailImages", urls);
    }
  }, [uploadedImages, updateForm]);

  return (
    <>
      <div className="mb-8">
        <div>
          <p className="scroll-m-20 text-base font-semibold tracking-tight w-full mb-1">
            Main image
          </p>
          <p className="text-sm leading-none font-medium mb-4">
            The main image is the first thing a user sees on the storage page
            and in the detailed view.
          </p>
        </div>
        <div className="mb-3">
          <Button
            type="button"
            className="flex flex-1 border-1 border-dashed w-full min-h-[200px] flex-col"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("main-image")?.click();
            }}
          >
            {mainImageData.preview && (
              <img src={mainImageData.preview} className="w-30 h-30 rounded" />
            )}
            {mainImageData.preview ? "" : "Choose an image"}
          </Button>
          <input
            id="main-image"
            name="alt_text"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
        <div className="flex justify-between items-end">
          <div className="max-w-[400px]">
            <div className="flex gap-2 w-fit items-center mb-2">
              <Label className="mb-0">Alt text</Label>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px]">
                  <p>
                    Alt text is important for accessibility. Describe the image
                    as you would to a friend who couldn't see it.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>

            <Input
              name="alt_text"
              placeholder="Describe the image"
              className="w-[280px] border shadow-none border-grey"
              onChange={handleMainChange}
            />
          </div>
          <Button
            variant="outline"
            type="button"
            onClick={submitMain}
            size="lg"
          >
            Upload
          </Button>
        </div>
      </div>

      {/* Detailed images */}
      <div>
        <div>
          <p className="scroll-m-20 text-base font-semibold tracking-tight w-full mb-1">
            Details
          </p>
          <p className="text-sm leading-none font-medium mb-4">
            Show your item in more detail. Select up to 5 images.
          </p>
        </div>
        <div className="mb-6">
          <Button
            type="button"
            className="flex flex-1 border-1 border-dashed w-full min-h-[200px] flex-col"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("detail-image")?.click();
            }}
          >
            Choose up to 5 images
          </Button>
          <input
            id="detail-image"
            name="detail"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
        {detailData.previews.length > 0 && (
          <div className="flex flex-col gap-4">
            {detailData.previews.length > 0 &&
              detailData.previews?.map((image, idx) => (
                <div key={image} className="flex gap-4">
                  <img src={image} className="w-20 rounded" />
                  <div className="flex justify-between w-full">
                    <div>
                      <div className="flex gap-2 w-fit items-center mb-2">
                        <Label className="mb-0">Alt text</Label>
                      </div>

                      <Input
                        name="alt_text"
                        type="text"
                        placeholder="Describe the image"
                        className="w-[250px] border shadow-none border-grey"
                        onChange={(e) => handleDetailChange(e, idx)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      className="self-center"
                      type="button"
                      onClick={(e) => handleDelete(e, idx)}
                    >
                      <Trash />
                    </Button>
                  </div>
                </div>
              ))}
            <Button
              variant="outline"
              type="button"
              className="w-fit self-end"
              onClick={submitDetail}
              size="lg"
            >
              Upload
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

export default ItemImageUpload;
