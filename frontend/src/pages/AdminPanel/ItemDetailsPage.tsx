import AddItemForm from "@/components/Admin/Items/AddItem/Steps/AddItemForm";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { toastConfirm } from "@/components/ui/toastConfirm";
import { useLanguage } from "@/context/LanguageContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getItemImages,
  selectItemImages,
} from "@/store/slices/itemImagesSlice";
import {
  deleteItem,
  getItemById,
  selectSelectedItem,
  updateItem,
} from "@/store/slices/itemsSlice";
import { fetchOrgLocationByOrgId } from "@/store/slices/organizationLocationsSlice";
import { selectActiveOrganizationId } from "@/store/slices/rolesSlice";
import { fetchTagsForItem, selectSelectedTags } from "@/store/slices/tagSlice";
import { t } from "@/translations";
import { Item } from "@/types";
import { CreateItemType } from "@common/items/form.types";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

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
  const mainImg = selectedImages.find((img) => img.image_type === "main");
  const detailImgs = selectedImages.filter(
    (img) => img.image_type === "detail",
  );
  const formattedItem = {
    ...(selectedItem as Item),
    location: {
      id: (selectedItem as Item)?.location_details.id,
      name: (selectedItem as Item)?.location_details.name,
      address: (selectedItem as Item)?.location_details.address,
    },
    quantity: (selectedItem as Item)?.quantity,
    category_id: "",
    tags: selectedTags?.map((tag) => tag.id),
    images: {
      main: mainImg
        ? {
            url: mainImg.image_url,
            metadata: {
              image_type: mainImg.image_type,
              display_order: mainImg.display_order,
              alt_text: mainImg.alt_text,
              is_active: mainImg.is_active,
            },
          }
        : {},
      details: detailImgs.map((img) => {
        const { image_url, image_type, display_order, is_active, alt_text } =
          img;
        return {
          url: image_url,
          metadata: {
            image_type: image_type,
            display_order: display_order,
            alt_text: alt_text,
            is_active: is_active,
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
  }, [dispatch, id]);

  const update = () => {
    if (!selectedItem) return;
    toast.promise(
      dispatch(
        updateItem({
          item_id: selectedItem.id,
          data: {
            ...selectedItem,
            location: {
              id: (selectedItem as Item).location_details.id,
              name: (selectedItem as Item).location_details.name,
              address: (selectedItem as Item).location_details.address,
            },
          } as CreateItemType,
          orgId: activeOrgId!,
        }),
      ).unwrap(),
      {
        loading: "Updating item...",
        success: "Item was successfully updated!",
        error: "Failed to update item",
      },
    );
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
            window.location.href = "/admin/items";
          }}
          className="text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
        >
          <ChevronLeft /> {t.itemDetailsPage.buttons.back[lang]}
        </Button>
        <div className="gap-2 flex">
          <Button variant="destructive" onClick={handleDelete}>
            Delete Item
          </Button>
          <Button variant="outline">Save Changes</Button>
        </div>
      </div>
      <AddItemForm onUpdate={update} initialData={formattedItem} />
    </div>
  );
};

export default ItemDetailsPage;
