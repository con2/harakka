import { useState, useEffect, useCallback } from "react";
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

type BanCategoryOption = "application" | "organization" | "role";

const mapCategoryToBanType = (category: BanCategoryOption): BanType => {
  switch (category) {
    case "application":
      return "banForApp";
    case "organization":
      return "banForOrg";
    case "role":
    default:
      return "banForRole";
  }
};

const mapBanTypeToCategory = (banType: string): BanCategoryOption | null => {
  switch (banType) {
    case "banForApp":
      return "application";
    case "banForOrg":
      return "organization";
    case "banForRole":
      return "role";
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
  const canUnbanFromRole = isSuper || isTenantAdmin;

  const [banType, setBanType] = useState<BanCategoryOption>("role");
  const [notes, setNotes] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [activeBans, setActiveBans] = useState<SimpleBanHistoryItem[]>([]);
  const [bansLoading, setBansLoading] = useState(false);

  const getOrganizationsWithActiveBans = (): TargetUserOrganization[] => {
    const orgMap = new Map<string, TargetUserOrganization>();
    activeBans.forEach((ban) => {
      const matchesBanType =
        (banType === "organization" && ban.ban_type === "banForOrg") ||
        (banType === "role" && ban.ban_type === "banForRole") ||
        (banType === "application" && ban.ban_type === "banForApp");

      if (
        !ban.unbanned_at &&
        ban.organization_id &&
        ban.action === "banned" &&
        matchesBanType
      ) {
        const userRole = allUserRoles.find(
          (role) => role.organization_id === ban.organization_id,
        );
        if (userRole && !orgMap.has(ban.organization_id)) {
          const org = {
            organization_id: ban.organization_id,
            organization_name:
              userRole.organization_name ?? "Unknown Organization",
          };
          orgMap.set(ban.organization_id, org);
        }
      }
    });
    return Array.from(orgMap.values());
  };

  const getRolesWithActiveBansForOrg = (orgId: string) => {
    const activeRoleBans = activeBans.filter(
      (ban) =>
        !ban.unbanned_at &&
        ban.action === "banned" &&
        ban.ban_type === "banForRole" &&
        ban.organization_id === orgId,
    );

    const rolesWithBans = new Map();
    activeRoleBans.forEach((ban) => {
      if (ban.role_assignment_id) {
        const userRole = allUserRoles.find(
          (role) =>
            role.organization_id === orgId &&
            role.user_id === user.id &&
            (role.id === ban.role_assignment_id || role.role_id),
        );
        if (userRole && userRole.role_id) {
          const roleInfo = {
            role_id: userRole.role_id,
            role_name: userRole.role_name,
          };
          rolesWithBans.set(userRole.role_id, roleInfo);
        }
      }
    });

    return Array.from(rolesWithBans.values());
  };

  const getActiveBanTypes = useCallback((): BanCategoryOption[] => {
    const activeBanTypes = new Set<BanCategoryOption>();

    activeBans.forEach((ban) => {
      if (!ban.unbanned_at && ban.action === "banned") {
        const category = mapBanTypeToCategory(ban.ban_type);
        if (category) {
          activeBanTypes.add(category);
        }
      }
    });

    return Array.from(activeBanTypes);
  }, [activeBans]);

  const hasActiveApplicationBan = () =>
    activeBans.some(
      (ban) =>
        !ban.unbanned_at &&
        ban.action === "banned" &&
        ban.ban_type === "banForApp",
    );
  const hasActiveOrganizationBans = () =>
    activeBans.some(
      (ban) =>
        !ban.unbanned_at &&
        ban.action === "banned" &&
        ban.ban_type === "banForOrg" &&
        ban.organization_id,
    );
  const hasActiveRoleBans = () =>
    activeBans.some(
      (ban) =>
        !ban.unbanned_at &&
        ban.action === "banned" &&
        ban.ban_type === "banForRole" &&
        ban.organization_id,
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
    if (banType === "role" && organizationId) setRoleId("");
  }, [organizationId, banType]);

  useEffect(() => {
    setOrganizationId("");
    setRoleId("");
  }, [banType]);

  useEffect(() => {
    if (activeBans.length > 0) {
      const activeBanTypes = getActiveBanTypes();
      if (activeBanTypes.length > 0 && !activeBanTypes.includes(banType)) {
        setBanType(activeBanTypes[0]);
        setOrganizationId("");
        setRoleId("");
      }
    } else {
      setBanType("role");
    }
  }, [activeBans, banType, getActiveBanTypes]);

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
    if (banType === "role" && !canUnbanFromRole) {
      toast.error(t.unbanUser.messages.noPermissionUnbanRole[lang]);
      return;
    }

    if (banType === "role" && (!organizationId || !roleId)) {
      toast.error(t.unbanUser.messages.missingFields[lang]);
      return;
    }

    if (banType === "organization" && !organizationId) {
      toast.error(t.unbanUser.messages.missingFields[lang]);
      return;
    }

    if (
      (banType === "organization" || banType === "role") &&
      isTenantAdmin &&
      !isSuper
    ) {
      if (activeOrgId && organizationId !== activeOrgId) {
        toast.error(t.unbanUser.messages.onlyUnbanActiveOrg[lang]);
        return;
      }
    }

    try {
      const result = await dispatch(
        unbanUser({
          userId: user.id,
          banType: mapCategoryToBanType(banType),
          organizationId: organizationId || undefined,
          roleId: roleId || undefined,
          notes: notes.trim() || undefined,
        }),
      ).unwrap();

      if (result.success) {
        toast.success(t.unbanUser.toast.unbanSuccess[lang]);
        await syncSessionAndRoles();
        await loadActiveBans();
        setOrganizationId("");
        setRoleId("");
        setNotes("");
        if (onSuccess) await onSuccess();
      } else {
        toast.error(result.message || t.unbanUser.toast.unbanError[lang]);
      }
    } catch {
      toast.error(t.unbanUser.toast.unbanError[lang]);
    }
  };

  return (
    <div className="space-y-3">
      {bansLoading ? (
        <div className="text-center py-4 text-muted-foreground">
          {t.unbanUser.messages.loadingBanInfo[lang]}
        </div>
      ) : activeBans.some(
          (ban) => !ban.unbanned_at && ban.action === "banned",
        ) ? (
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
                {hasActiveApplicationBan() && canUnbanFromApp && (
                  <SelectItem value="application">
                    {t.unbanUser.unban.fields.selectTypes.application[lang]}
                  </SelectItem>
                )}
                {hasActiveOrganizationBans() && canUnbanFromOrg && (
                  <SelectItem value="organization">
                    {t.unbanUser.unban.fields.selectTypes.organization[lang]}
                  </SelectItem>
                )}
                {hasActiveRoleBans() && canUnbanFromRole && (
                  <SelectItem value="role">
                    {t.unbanUser.unban.fields.selectTypes.role[lang]}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {(banType === "organization" || banType === "role") && (
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
                  {getOrganizationsWithActiveBans().map((org) => (
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

          {banType === "role" && organizationId && (
            <div className="space-y-2">
              <Label>{t.unbanUser.fields.role.label[lang]}</Label>
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t.unbanUser.unban.fields.rolePlaceholder[lang]}
                  />
                </SelectTrigger>
                <SelectContent>
                  {getRolesWithActiveBansForOrg(organizationId).map((role) => (
                    <SelectItem key={role.role_id} value={role.role_id}>
                      {role.role_name}
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
              disabled={
                loading ||
                bansLoading ||
                !activeBans.some(
                  (ban) => !ban.unbanned_at && ban.action === "banned",
                )
              }
            >
              {loading
                ? t.unbanUser.toast.loading[lang]
                : t.unbanUser.actions.unban[lang]}
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
