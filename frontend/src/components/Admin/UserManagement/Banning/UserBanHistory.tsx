import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
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

interface Props {
  user: UserProfile;
  refreshKey?: number;
}

const UserBanHistory = ({ user, refreshKey = 0 }: Props) => {
  const dispatch = useAppDispatch();
  const banHistory = useAppSelector(selectBanHistory);
  const loading = useAppSelector(selectUserBanningLoading);
  const { lang } = useLanguage();
  const { allUserRoles, refreshAllUserRoles } = useRoles();

  useEffect(() => {
    if (user?.id) {
      void dispatch(fetchUserBanHistory(user.id));
      if (!allUserRoles || allUserRoles.length === 0) {
        void refreshAllUserRoles();
      }
    }
  }, [dispatch, user?.id, allUserRoles, refreshAllUserRoles, refreshKey]);

  const getOrganizationName = (organizationId?: string | null) => {
    if (!organizationId) return "-";
    const userRole = allUserRoles.find(
      (role) => role.organization_id === organizationId,
    );
    return userRole?.organization_name || organizationId;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        {t.userBanHistory.status.loading[lang]}
      </div>
    );
  }

  if (!banHistory || banHistory.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        {t.userBanHistory.noBans[lang]}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t.userBanHistory.status.action[lang]}</TableHead>
          <TableHead>{t.userBanHistory.status.status[lang]}</TableHead>
          <TableHead>{t.userBanHistory.columns.banType[lang]}</TableHead>
          <TableHead>{t.userBanHistory.columns.orgName[lang]}</TableHead>
          <TableHead>{t.userBanHistory.columns.reason[lang]}</TableHead>
          <TableHead>{t.userBanHistory.status.date[lang]}</TableHead>
          <TableHead>{t.userBanHistory.columns.isPermanent[lang]}</TableHead>
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
                  ? t.userBanHistory.status.banned[lang]
                  : t.userBanHistory.status.unbanned[lang]}
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
            <TableCell>{getOrganizationName(ban.organization_id)}</TableCell>
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
                ? t.userBanHistory.columns.permanent[lang]
                : t.userBanHistory.columns.notPermanent[lang]}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserBanHistory;
