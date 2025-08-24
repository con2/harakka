import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchUserBanHistory,
  selectBanHistory,
  selectUserBanningLoading,
} from "@/store/slices/userBanningSlice";
import { UserProfile } from "@common/user.types";
import { useRoles } from "@/hooks/useRoles";

interface UserBanHistoryModalProps {
  user: UserProfile;
  initialOpen?: boolean;
  onClose?: () => void;
}

const UserBanHistoryModal = ({
  user,
  initialOpen = false,
  onClose,
}: UserBanHistoryModalProps) => {
  const dispatch = useAppDispatch();
  const banHistory = useAppSelector(selectBanHistory);
  const loading = useAppSelector(selectUserBanningLoading);
  const { lang } = useLanguage();
  const { allUserRoles, refreshAllUserRoles } = useRoles();
  const [isOpen, setIsOpen] = useState(initialOpen);

  useEffect(() => {
    if (isOpen && user.id) {
      void dispatch(fetchUserBanHistory(user.id));
      // Also refresh roles data to get organization names
      if (!allUserRoles || allUserRoles.length === 0) {
        void refreshAllUserRoles();
      }
    }
  }, [dispatch, isOpen, user.id, allUserRoles, refreshAllUserRoles]);

  // Helper function to get organization name from organization ID
  const getOrganizationName = (
    organizationId: string | null | undefined,
  ): string => {
    if (!organizationId) return "-";

    const userRole = allUserRoles.find(
      (role) => role.organization_id === organizationId,
    );

    return userRole?.organization_name || organizationId;
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {!initialOpen && (
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-blue-600 border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            title={t.userBanning.history.title[lang]}
          >
            <History className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t.userBanning.history.title[lang]}</DialogTitle>
          <p className="text-sm text-muted-foreground text-center">
            {user.full_name} ({user.email})
          </p>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-4">
              <span>{t.userBanning.status.loading[lang]}</span>
            </div>
          ) : banHistory.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              {t.userBanning.history.noBans[lang]}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.userBanning.status.action[lang]}</TableHead>
                  <TableHead>{t.userBanning.status.status[lang]}</TableHead>
                  <TableHead>
                    {t.userBanning.history.columns.banType[lang]}
                  </TableHead>
                  <TableHead>
                    {t.userBanning.history.columns.orgName[lang]}
                  </TableHead>
                  <TableHead>
                    {t.userBanning.history.columns.reason[lang]}
                  </TableHead>
                  <TableHead>{t.userBanning.status.date[lang]}</TableHead>
                  <TableHead>
                    {t.userBanning.history.columns.isPermanent[lang]}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banHistory.map((ban) => (
                  <TableRow key={ban.id}>
                    <TableCell>
                      <span
                        className={
                          ban.action === "banned"
                            ? "text-red-600 font-medium"
                            : "text-green-600 font-medium"
                        }
                      >
                        {ban.action === "banned"
                          ? t.userBanning.status.banned[lang]
                          : t.userBanning.status.unbanned[lang]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          ban.unbanned_at
                            ? "text-green-600"
                            : ban.action === "banned"
                              ? "text-red-600"
                              : "text-gray-500"
                        }
                      >
                        {ban.unbanned_at
                          ? "Lifted"
                          : ban.action === "banned"
                            ? "Active"
                            : "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>{ban.ban_type}</TableCell>
                    <TableCell>
                      {getOrganizationName(ban.organization_id)}
                    </TableCell>
                    <TableCell>{ban.ban_reason || "-"}</TableCell>
                    <TableCell>
                      {ban.action === "banned"
                        ? ban.created_at
                          ? new Date(ban.created_at).toLocaleDateString()
                          : "-"
                        : ban.unbanned_at
                          ? new Date(ban.unbanned_at).toLocaleDateString()
                          : "-"}
                    </TableCell>
                    <TableCell>
                      {ban.is_permanent
                        ? t.userBanning.history.columns.permanent[lang]
                        : t.userBanning.history.columns.notPermanent[lang]}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <DialogClose />
      </DialogContent>
    </Dialog>
  );
};

export default UserBanHistoryModal;
