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
import { useIsMobile } from "@/hooks/use-mobile";
import { ColumnDef, Row } from "@tanstack/react-table";
import { SimpleBanHistoryItem } from "@/types";
import MobileTable from "@/components/ui/MobileTable";

interface Props {
  user: UserProfile;
  refreshKey?: number;
}

// isMobile/md size is too small for this component
// The table will not fit properly unless a slightly bigger size is used
const LOCAL_IS_MOBILE = 950;

const UserBanHistory = ({ user, refreshKey = 0 }: Props) => {
  const dispatch = useAppDispatch();
  const banHistory = useAppSelector(selectBanHistory);
  const loading = useAppSelector(selectUserBanningLoading);
  const { lang } = useLanguage();
  const { allUserRoles, refreshAllUserRoles } = useRoles();

  // Responsive sizing
  const { width } = useIsMobile();
  const isMobile = width <= LOCAL_IS_MOBILE;

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

  const columns: ColumnDef<SimpleBanHistoryItem>[] = [
    {
      header: t.userBanHistory.status.action[lang],
      cell: ({ row }: { row: Row<SimpleBanHistoryItem> }) => {
        const { action } = row.original;

        return (
          <span
            className={
              action === "banned"
                ? "text-red-600 font-medium"
                : "text-green-600 font-medium"
            }
          >
            {action === "banned"
              ? t.userBanHistory.status.banned[lang]
              : t.userBanHistory.status.unbanned[lang]}
          </span>
        );
      },
    },
    {
      header: t.userBanHistory.status.status[lang],
      cell: ({ row }: { row: Row<SimpleBanHistoryItem> }) => {
        const { unbanned_at, action } = row.original;
        return (
          <span
            className={
              unbanned_at
                ? "text-green-600"
                : action === "banned"
                  ? "text-red-600"
                  : "text-gray-500"
            }
          >
            {unbanned_at
              ? t.userBanHistory.status.lifted[lang]
              : action === "banned"
                ? t.userBanHistory.status.active[lang]
                : "N/A"}
          </span>
        );
      },
    },
    {
      header: t.userBanHistory.columns.banType[lang],
      cell: ({ row }: { row: Row<SimpleBanHistoryItem> }) =>
        row.original.ban_type,
    },
    {
      header: t.userBanHistory.columns.orgName[lang],
      cell: ({ row }: { row: Row<SimpleBanHistoryItem> }) =>
        getOrganizationName(row.original.organization_id),
    },
    {
      header: t.userBanHistory.columns.reason[lang],
      cell: ({ row }: { row: Row<SimpleBanHistoryItem> }) =>
        row.original.ban_reason || "-",
    },
    {
      header: t.userBanHistory.status.date[lang],
      cell: ({ row }: { row: Row<SimpleBanHistoryItem> }) => {
        const { action, created_at, unbanned_at } = row.original;

        return action === "banned"
          ? created_at
            ? new Date(created_at).toLocaleDateString()
            : "-"
          : unbanned_at
            ? new Date(unbanned_at).toLocaleDateString()
            : "-";
      },
    },
    {
      header: t.userBanHistory.columns.isPermanent[lang],
      cell: ({ row }: { row: Row<SimpleBanHistoryItem> }) =>
        row.original.is_permanent
          ? t.userBanHistory.columns.permanent[lang]
          : t.userBanHistory.columns.notPermanent[lang],
    },
  ];

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

  if (isMobile) return <MobileTable columns={columns} data={banHistory} />;

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
                  ? t.userBanHistory.status.lifted[lang]
                  : ban.action === "banned"
                    ? t.userBanHistory.status.active[lang]
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
