import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { softDeleteOrganization } from "@/store/slices/organizationSlice";
import { Trash2 } from "lucide-react";
import { toastConfirm } from "@/components/ui/toastConfirm";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

const OrganizationDelete = ({
  id,
  closeModal,
  onDeleted,
}: {
  id: string;
  closeModal?: () => void;
  onDeleted?: () => void;
}) => {
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();

  const handleDelete = () => {
    if (!id) {
      toast.error(t.organizationDelete.messages.invalidId[lang]);
      return;
    }

    toastConfirm({
      title: t.organizationDelete.confirmation.title[lang],
      description: t.organizationDelete.confirmation.description[lang],
      confirmText: t.organizationDelete.confirmation.confirmText[lang],
      cancelText: t.organizationDelete.confirmation.cancelText[lang],
      onConfirm: async () => {
        try {
          await toast.promise(dispatch(softDeleteOrganization(id)).unwrap(), {
            loading: t.organizationDelete.toast.loading[lang],
            success: t.organizationDelete.toast.success[lang],
            error: t.organizationDelete.toast.error[lang],
          });
          onDeleted?.();
          closeModal?.();
        } catch {
          toast.error(t.organizationDelete.messages.generalError[lang]);
        }
      },
    });
  };

  return (
    <Button
      onClick={handleDelete}
      size="sm"
      title={t.organizationDelete.button.title[lang]}
      className="text-red-600 hover:text-red-800 hover:bg-red-100 gap-2"
    >
      {t.organizationDetailsPage.buttons.deleteOrg[lang]}
      <Trash2 className="h-4 w-4" />
    </Button>
  );
};

export default OrganizationDelete;

// TODO: add hardDelete functionality
// const OrganizationsHardDelete = () => {};
