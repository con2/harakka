import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getItemById,
  selectSelectedItem,
  deleteItem,
} from "@/store/slices/itemsSlice";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Edit, Trash2 } from "lucide-react";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import Spinner from "@/components/Spinner";
import { toast } from "sonner";
import { toastConfirm } from "@/components/ui/toastConfirm";
import { Item } from "@/types/item";
import UpdateItemForm from "@/components/Admin/Items/UpdateItemForm";
import { fetchTagsForItem } from "@/store/slices/tagSlice";
import { selectActiveOrganizationId } from "@/store/slices/rolesSlice";
import { Separator } from "@/components/ui/separator";

const ItemDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();
  const selectedItem = useAppSelector(selectSelectedItem);
  const activeOrgId = useAppSelector(selectActiveOrganizationId);
  const [loading, setLoading] = useState(true);
  const [updateOpen, setUpdateOpen] = useState(false);
  // Form state for inline editing
  const [formData, setFormData] = useState<Item | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        await dispatch(getItemById(id)).unwrap();
        await dispatch(fetchTagsForItem(id)).unwrap();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [dispatch, id]);

  // Initialize form state once selectedItem is loaded
  useEffect(() => {
    if (!selectedItem) return;
    setFormData(selectedItem as Item);
  }, [selectedItem]);

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
    <div className="mx-8 mt-6">
      <div className="mb-4">
        {/*/ Back button */}
        <Button
          onClick={() => {
            window.location.href = "/admin/items";
          }}
          className="text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
        >
          <ChevronLeft /> {t.itemDetailsPage.buttons.back[lang]}
        </Button>
      </div>
      {/*/ Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl">
          {formData?.translations[lang]?.item_name ||
            formData?.translations.fi.item_name}
        </h2>
        <div className="flex gap-2">
          <Button
            variant={"outline"}
            size="sm"
            onClick={() => {
              if (updateOpen) {
                // Cancel: revert parent-local form state and close edit mode
                setFormData(selectedItem as Item);
                setUpdateOpen(false);
              } else {
                setUpdateOpen(true);
              }
            }}
          >
            <Edit className="h-4 w-4 mr-2" />{" "}
            {updateOpen
              ? t.itemDetailsPage.messages.deletion.cancel[lang]
              : t.itemDetailsPage.buttons.edit[lang]}
          </Button>
        </div>
      </div>

      {/* Edit item fields */}
      <div className="mt-2">
        {formData && (
          <UpdateItemForm
            initialData={formData}
            editable={updateOpen}
            onActiveTabChange={() => {}}
            onSaved={() => {
              void dispatch(getItemById(String(formData?.id ?? id)));
              void dispatch(fetchTagsForItem(String(formData?.id ?? id)));
              setUpdateOpen(false);
            }}
          />
        )}
      </div>
      <Separator className="my-2 mt-10" />
      {/* Delete item */}
      <Button size="sm" variant="destructive" onClick={handleDelete}>
        <Trash2 className="h-4 w-4 mr-2" /> {""}
        {t.itemDetailsPage.buttons.delete[lang]}
      </Button>
    </div>
  );
};

export default ItemDetailsPage;
