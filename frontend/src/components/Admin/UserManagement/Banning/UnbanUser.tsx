import { useState, useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  unbanUser,
  selectUserBanningLoading,
  fetchAllUserBanStatuses,
  checkUserBanStatus,
} from "@/store/slices/userBanningSlice";
import { UserProfile } from "@common/user.types";
import { BanType, SimpleBanHistoryItem } from "@/types/userBanning";
import { useRoles } from "@/hooks/useRoles";
import { userBanningApi } from "@/api/services/userBanning";
import { selectActiveOrganizationId } from "@/store/slices/rolesSlice";

interface TargetUserOrganization {
  organization_id: string;
  organization_name: string;
}

interface Props {
  user: UserProfile;
  refreshKey?: number;
  onSuccess?: () => Promise<void> | void;
}

type BanCategoryOption = "application" | "organization";

const mapCategoryToBanType = (category: BanCategoryOption): BanType =>
  category === "application" ? "banForApp" : "banForOrg";

const mapBanTypeToCategory = (banType: string): BanCategoryOption | null => {
  switch (banType) {
    case "banForApp":
      return "application";
    case "banForOrg":
    case "banForRole":
      return "organization";
    default:
      return null;
  }
};

const UnbanUser = ({ user, onSuccess, refreshKey = 0 }: Props) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectUserBanningLoading);
  const activeOrgId = useAppSelector(selectActiveOrganizationId);
  const { lang } = useLanguage();
  const { allUserRoles, refreshAllUserRoles, hasRole, syncSessionAndRoles } =
    useRoles();

  const isSuper = hasRole("super_admin");
  const isTenantAdmin = hasRole("tenant_admin");

  const canUnbanFromApp = isSuper;
  const canUnbanFromOrg = isSuper || isTenantAdmin;

  const extractRoleIdFromBan = useCallback(
    (ban: SimpleBanHistoryItem): string | undefined => {
      const payload = ban.affected_assignments as
        | { assignments?: Array<Record<string, unknown>> }
        | null
        | undefined;

      const assignments =
        payload &&
        typeof payload === "object" &&
        Array.isArray(payload.assignments)
          ? payload.assignments
          : [];

      const primary = assignments.find(
        (assignment) => typeof assignment?.role_id === "string",
      );
      if (primary && typeof primary.role_id === "string") {
        return primary.role_id;
      }

      const assignmentMatch = assignments.find(
        (assignment) => typeof assignment?.role_assignment_id === "string",
      );
      if (
        assignmentMatch &&
        typeof assignmentMatch.role_assignment_id === "string"
      ) {
        const role = allUserRoles.find(
          (r) => r.id === assignmentMatch.role_assignment_id,
        );
        return role?.role_id ?? undefined;
      }

      return undefined;
    },
    [allUserRoles],
  );

  const [banType, setBanType] = useState<BanCategoryOption>("organization");
  const [notes, setNotes] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [activeBans, setActiveBans] = useState<SimpleBanHistoryItem[]>([]);
  const [bansLoading, setBansLoading] = useState(false);

  const organizationsWithBans = useMemo((): TargetUserOrganization[] => {
    const map = new Map<string, TargetUserOrganization>();
    activeBans.forEach((ban) => {
      if (ban.action === "banned" && !ban.unbanned_at && ban.organization_id) {
        const category = mapBanTypeToCategory(ban.ban_type);
        if (category !== "organization") return;

        const userRole = allUserRoles.find(
          (role) => role.organization_id === ban.organization_id,
        );
        const name = userRole?.organization_name ?? ban.organization_id ?? "-";
        if (!map.has(ban.organization_id)) {
          map.set(ban.organization_id, {
            organization_id: ban.organization_id,
            organization_name: name,
          });
        }
      }
    });
    return Array.from(map.values());
  }, [activeBans, allUserRoles]);

  const hasActiveApplicationBan = useMemo(
    () =>
      activeBans.some(
        (ban) =>
          ban.action === "banned" &&
          !ban.unbanned_at &&
          ban.ban_type === "banForApp",
      ),
    [activeBans],
  );

  const loadActiveBans = useCallback(async () => {
    setBansLoading(true);
    try {
      const bans = await userBanningApi.getUserBanHistory(user.id);
      setActiveBans(bans);
    } catch (error) {
      console.error("Failed to load user ban history:", error);
      toast.error(t.unbanUser.messages.failedLoadBanHistory[lang]);
    } finally {
      setBansLoading(false);
    }
  }, [lang, user.id]);

  useEffect(() => {
    void loadActiveBans();
    if (!allUserRoles || allUserRoles.length === 0) {
      void refreshAllUserRoles();
    }
  }, [user.id, allUserRoles, refreshAllUserRoles, loadActiveBans, refreshKey]);

  useEffect(() => {
    if (activeBans.length > 0) {
      const categories = activeBans
        .map((ban) => mapBanTypeToCategory(ban.ban_type))
        .filter((ban): ban is BanCategoryOption => ban !== null);
      if (categories.length > 0 && !categories.includes(banType)) {
        setBanType(
          categories.includes("organization") ? "organization" : "application",
        );
        setOrganizationId("");
      }
    } else {
      setBanType("organization");
      setOrganizationId("");
    }
  }, [activeBans, banType]);

  const handleSubmit = async () => {
    if (!user.id) return;

    if (banType === "application" && !canUnbanFromApp) {
      toast.error(t.unbanUser.messages.noPermissionUnbanApp[lang]);
      return;
    }
    if (banType === "organization" && !canUnbanFromOrg) {
      toast.error(t.unbanUser.messages.noPermissionUnbanOrg[lang]);
      return;
    }

    if (
      banType === "organization" &&
      isTenantAdmin &&
      !isSuper &&
      activeOrgId &&
      organizationId !== activeOrgId
    ) {
      toast.error(t.unbanUser.messages.onlyUnbanActiveOrg[lang]);
      return;
    }

    if (banType === "organization" && !organizationId) {
      toast.error(t.unbanUser.messages.missingFields[lang]);
      return;
    }

    try {
      let banTypeForRpc: BanType = mapCategoryToBanType(banType);
      let roleIdForRpc: string | undefined;
      if (banType === "organization") {
        const matchingLegacyRoleBan = activeBans.find(
          (ban) =>
            !ban.unbanned_at &&
            ban.action === "banned" &&
            ban.organization_id === organizationId &&
            ban.ban_type === "banForRole",
        );

        if (matchingLegacyRoleBan) {
          const extractedRoleId = extractRoleIdFromBan(matchingLegacyRoleBan);
          if (extractedRoleId) {
            banTypeForRpc = "banForRole";
            roleIdForRpc = extractedRoleId;
          }
        }
      }

      const result = await dispatch(
        unbanUser({
          userId: user.id,
          banType: banTypeForRpc,
          organizationId: organizationId || undefined,
          roleId: roleIdForRpc,
          notes: notes.trim() || undefined,
        }),
      ).unwrap();

      if (result.success) {
        toast.success(t.unbanUser.toast.unbanSuccess[lang]);
        await syncSessionAndRoles();
        await loadActiveBans();
        // Sync state after successful unban operation
        await dispatch(fetchAllUserBanStatuses());
        await dispatch(checkUserBanStatus(user.id));
        setOrganizationId("");
        setNotes("");
        if (onSuccess) await onSuccess();
      } else {
        toast.error(result.message || t.unbanUser.toast.unbanError[lang]);
      }
    } catch {
      toast.error(t.unbanUser.toast.unbanError[lang]);
    }
  };

  const hasAnyActiveBan = activeBans.some(
    (ban) => ban.action === "banned" && !ban.unbanned_at,
  );

  return (
    <div className="space-y-3">
      {bansLoading ? (
        <div className="text-center py-4 text-muted-foreground">
          {t.unbanUser.messages.loadingBanInfo[lang]}
        </div>
      ) : hasAnyActiveBan ? (
        <>
          <div className="space-y-2">
            <Label>{t.unbanUser.unban.fields.banTypeToRemove[lang]}</Label>
            <Select
              value={banType}
              onValueChange={(value: BanCategoryOption) => setBanType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {hasActiveApplicationBan && canUnbanFromApp && (
                  <SelectItem value="application">
                    {t.unbanUser.unban.fields.selectTypes.application[lang]}
                  </SelectItem>
                )}
                {canUnbanFromOrg && organizationsWithBans.length > 0 && (
                  <SelectItem value="organization">
                    {t.unbanUser.unban.fields.selectTypes.organization[lang]}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {banType === "organization" && (
            <div className="space-y-2">
              <Label>{t.unbanUser.fields.organization.label[lang]}</Label>
              <Select value={organizationId} onValueChange={setOrganizationId}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      t.unbanUser.unban.fields.organizationPlaceholder[lang]
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {organizationsWithBans.map((org) => (
                    <SelectItem
                      key={org.organization_id}
                      value={org.organization_id}
                    >
                      {org.organization_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>{t.unbanUser.fields.notes.label[lang]}</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder={t.unbanUser.unban.fields.reasonPlaceholder[lang]}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={loading || bansLoading || !hasAnyActiveBan}
            >
              {t.unbanUser.actions.unban[lang]}
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          {t.unbanUser.messages.noActiveBans[lang]}
        </div>
      )}
    </div>
  );
};

export default UnbanUser;
