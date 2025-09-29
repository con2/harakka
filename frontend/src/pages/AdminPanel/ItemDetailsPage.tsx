import AddItemForm from "@/components/Admin/Items/AddItem/Steps/AddItemForm";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getItemImages,
  selectItemImages,
} from "@/store/slices/itemImagesSlice";
import {
  clearSelectedItem,
  deleteItem,
  getItemById,
  selectSelectedItem,
  updateItem,
} from "@/store/slices/itemsSlice";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import Spinner from "@/components/Spinner";
import { toast } from "sonner";
import { toastConfirm } from "@/components/ui/toastConfirm";
import { Item } from "@/types/item";
import { fetchTagsForItem } from "@/store/slices/tagSlice";
import { selectActiveOrganizationId } from "@/store/slices/rolesSlice";
import { fetchOrgLocationByOrgId } from "@/store/slices/organizationLocationsSlice";
import { selectSelectedTags } from "@/store/slices/tagSlice";
import { createItemDto } from "@/store/utils/validate";
import { t } from "@/translations";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import z from "zod";
import { UpdateItem } from "@common/items/storage-items.types";

const ItemDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();
  const selectedItem = useAppSelector(selectSelectedItem);
  const selectedTags = useAppSelector(selectSelectedTags);
  const selectedImages = useAppSelector(selectItemImages);
  const activeOrgId = useAppSelector(selectActiveOrganizationId);
  const [loading, setLoading] = useState(true);

  // Form state for inline editing
  const mainImg = selectedImages.find(
    (img) => img.item_id === selectedItem?.id && img.image_type === "main",
  );
  const detailImgs = selectedImages.filter(
    (img) => img.item_id === selectedItem?.id && img.image_type === "detail",
  );

  // format selected item to fit the item form
  const formattedItem = {
    ...(selectedItem as Item),
    location: {
      id: (selectedItem as Item)?.location_details.id,
      name: (selectedItem as Item)?.location_details.name,
      address: (selectedItem as Item)?.location_details.address,
    },
    quantity: (selectedItem as Item)?.quantity ?? 1,
    category_id: selectedItem?.category_id ?? "",
    tags: (selectedTags ?? []).map((tag) => tag.id),
    images: {
      main: mainImg
        ? {
            id: mainImg.id ?? "",
            url: mainImg.image_url ?? "",
            full_path: mainImg.storage_path ?? "",
            path: mainImg.storage_path?.split("/")[1] ?? "",
            metadata: {
              image_type: mainImg.image_type ?? "",
              display_order: mainImg.display_order ?? 0,
              alt_text: mainImg.alt_text ?? "",
              is_active: mainImg.is_active ?? true,
              object_fit: mainImg.object_fit ?? "cover",
            },
          }
        : null,
      details: (detailImgs ?? []).map((img) => {
        const {
          image_url,
          id,
          image_type,
          display_order,
          is_active,
          storage_path,
          alt_text,
          object_fit,
        } = img;
        return {
          id,
          url: image_url,
          full_path: storage_path ?? "",
          path: storage_path?.split("/")[1] ?? "",
          metadata: {
            id: id,
            image_type: image_type,
            display_order: display_order,
            alt_text: alt_text,
            is_active: is_active,
            object_fit: object_fit,
          },
        };
      }),
    },
  };

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        await dispatch(getItemById(id)).unwrap();
        await dispatch(fetchTagsForItem(id)).unwrap();
        await dispatch(getItemImages(id)).unwrap();
        await dispatch(fetchOrgLocationByOrgId(activeOrgId!));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [activeOrgId, dispatch, id]);

  // Initialize form state once selectedItem is loaded
  useEffect(() => {
    if (!selectedItem) return;
  }, [selectedItem]);

  const update = (values: z.infer<typeof createItemDto>) => {
    if (!selectedItem) return;
    const { location_details, location, ...rest } =
      values as Partial<UpdateItem> & {
        location: { id: string; address: string; name: string };
      };
    try {
      toast.promise(
        dispatch(
          updateItem({
            data: {
              ...rest,
              org_id: activeOrgId!,
              location_details,
              location_id: location.id,
            },
            item_id: selectedItem.id,
            orgId: activeOrgId!,
          }),
        ).unwrap(),
        {
          loading: t.itemDetailsPage.messages.toast.update.loading[lang],
          success: t.itemDetailsPage.messages.toast.update.success[lang],
          error: t.itemDetailsPage.messages.toast.update.error[lang],
        },
      );
      void navigate("/admin/items", {
        state: {
          order: "updated_at",
          highlight: [0],
          ascending: false,
        },
      });
    } catch {
      // Do nothing on error — toast already shows the failure message
    }
  };

  const handleSubmit = () => {
    (
      document.querySelector("#add-item-form") as HTMLFormElement
    ).requestSubmit();
  };
  const handleDelete = () => {
    if (!selectedItem) return;
    const orgId = activeOrgId;
    if (!orgId)
      return toast.error(t.itemDetailsPage.messages.toast.noOrg[lang]);
    toastConfirm({
      title: t.itemDetailsPage.messages.deletion.title[lang],
      description: t.itemDetailsPage.messages.deletion.description[lang],
      confirmText: t.itemDetailsPage.messages.deletion.confirm[lang],
      cancelText: t.itemDetailsPage.messages.deletion.cancel[lang],
      onConfirm: async () => {
        try {
          // ensure we have an item id from either the loaded item or the route
          const rawId =
            (selectedItem as unknown as Record<string, unknown>).id ??
            id ??
            undefined;
          if (
            rawId === undefined ||
            (typeof rawId !== "string" && typeof rawId !== "number")
          ) {
            toast.error(t.itemDetailsPage.messages.toast.noItem[lang]);
            return;
          }
          const itemId = String(rawId);
          await dispatch(
            deleteItem({ org_id: orgId, item_id: itemId }),
          ).unwrap();
          toast.success(t.itemDetailsPage.messages.toast.deleteSuccess[lang]);
          void navigate(-1);
        } catch (err) {
          console.error(err);
          toast.error(t.itemDetailsPage.messages.toast.deleteFail[lang]);
        }
      },
    });
  };

  if (loading || !selectedItem) {
    return <Spinner containerClasses="py-10" />;
  }

  return (
    <div>
      {/*/ Back button */}
      <div className="flex justify-between max-w-[900px]">
        <Button
          onClick={() => {
            void navigate("/admin/items");
            dispatch(clearSelectedItem());
          }}
          className="text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
        >
          <ChevronLeft /> {t.itemDetailsPage.buttons.back[lang]}
        </Button>
        <div className="gap-2 flex">
          <Button variant="destructive" onClick={handleDelete}>
            {t.itemDetailsPage.buttons.delete[lang]}
          </Button>
          <Button variant="outline" onClick={handleSubmit}>
            {t.itemDetailsPage.buttons.save[lang]}
          </Button>
        </div>
      </div>
      <AddItemForm onUpdate={update} initialData={formattedItem} />
    </div>
  );
};

export default ItemDetailsPage;
