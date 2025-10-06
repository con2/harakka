import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  banUserForRole,
  banUserForOrg,
  banUserForApp,
  selectUserBanningLoading,
} from "@/store/slices/userBanningSlice";
import { UserProfile } from "@common/user.types";
import { BanType } from "@/types/userBanning";
import { useRoles } from "@/hooks/useRoles";
import { useBanPermissions } from "@/hooks/useBanPermissions";
import { COMMON_BAN_REASONS, CUSTOM_BAN_REASON } from "@/config/constants";
import { selectActiveOrganizationId } from "@/store/slices/rolesSlice";

interface Props {
  user: UserProfile;
  onSuccess?: () => Promise<void> | void;
}

const UserBan = ({ user, onSuccess }: Props) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectUserBanningLoading);
  const activeOrgId = useAppSelector(selectActiveOrganizationId);
  const { lang } = useLanguage();
  const { allUserRoles, refreshAllUserRoles, hasRole, syncSessionAndRoles } =
    useRoles();
  const { getBanPermissions } = useBanPermissions();

  const isSuper = hasRole("super_admin");
  const isTenantAdmin = hasRole("tenant_admin");

  const { canBanFromApp, canBanFromOrg, canBanFromRole } = getBanPermissions(
    user.id,
  );

  const getDefaultBanType = (): BanType => {
    if (canBanFromRole) return "role";
    if (canBanFromOrg) return "organization";
    if (canBanFromApp) return "application";
    return "role";
  };

  const [banType, setBanType] = useState<BanType>(getDefaultBanType());
  const [selectedBanReason, setSelectedBanReason] = useState<string>("");
  const [customBanReason, setCustomBanReason] = useState("");
  const [banReason, setBanReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isPermanent, setIsPermanent] = useState(false);
  const [organizationId, setOrganizationId] = useState("");
  const [roleAssignmentId, setRoleAssignmentId] = useState("");

  const getTargetUserOrganizations = () => {
    const userRoles = allUserRoles.filter(
      (role) => role.user_id === user.id && role.is_active,
    );
    const orgMap = new Map<
      string,
      { organization_id: string; organization_name: string }
    >();
    userRoles.forEach((role) => {
      if (role.organization_id && !orgMap.has(role.organization_id)) {
        if (isSuper || !activeOrgId || role.organization_id === activeOrgId) {
          orgMap.set(role.organization_id, {
            organization_id: role.organization_id,
            organization_name: role.organization_name ?? "",
          });
        }
      }
    });
    return Array.from(orgMap.values());
  };

  const getTargetUserRolesForOrg = (orgId: string) => {
    const roles = allUserRoles.filter(
      (role) =>
        role.user_id === user.id &&
        role.organization_id === orgId &&
        role.is_active,
    );
    return roles;
  };

  useEffect(() => {
    if (banType === "role" && organizationId) {
      setRoleAssignmentId("");
    }
  }, [organizationId, banType]);

  useEffect(() => {
    if (!allUserRoles || allUserRoles.length === 0) {
      void refreshAllUserRoles();
    }
  }, [allUserRoles, refreshAllUserRoles]);

  useEffect(() => {
    if (selectedBanReason === CUSTOM_BAN_REASON) setBanReason(customBanReason);
    else setBanReason(selectedBanReason);
  }, [selectedBanReason, customBanReason]);

  // If user has no permission to ban this target user, don't render the component
  if (!canBanFromApp && !canBanFromOrg && !canBanFromRole) return null;

  const handleSubmit = async () => {
    if (!user.id) return;
    if (banType === "application" && !canBanFromApp) {
      toast.error(t.userBan.messages.noPermissionApp[lang]);
      return;
    }
    if (banType === "organization" && !canBanFromOrg) {
      toast.error(t.userBan.messages.noPermissionOrg[lang]);
      return;
    }
    if (banType === "role" && !canBanFromRole) {
      toast.error(t.userBan.messages.noPermissionRole[lang]);
      return;
    }

    if (banType === "role" && isTenantAdmin && !isSuper) {
      const selectedRole = getTargetUserRolesForOrg(organizationId).find(
        (role) => role.id === roleAssignmentId,
      );
      if (
        selectedRole &&
        !["storage_manager", "requester", "user"].includes(
          selectedRole.role_name || "",
        )
      ) {
        toast.error(t.userBan.messages.onlyAdminUserRoles[lang]);
        return;
      }
    }

    if (
      (banType === "organization" || banType === "role") &&
      isTenantAdmin &&
      !isSuper
    ) {
      if (activeOrgId && organizationId !== activeOrgId) {
        toast.error(t.userBan.messages.onlyActiveOrg[lang]);
        return;
      }
    }

    if (!banReason.trim()) {
      toast.error(t.userBan.messages.missingFields[lang]);
      return;
    }

    if (selectedBanReason === CUSTOM_BAN_REASON && !customBanReason.trim()) {
      toast.error(t.userBan.messages.provideCustomReason[lang]);
      return;
    }

    if (banType === "role" && (!organizationId || !roleAssignmentId)) {
      toast.error(t.userBan.messages.missingFields[lang]);
      return;
    }

    if (banType === "organization" && !organizationId) {
      toast.error(t.userBan.messages.missingFields[lang]);
      return;
    }

    try {
      type BanResult = { success: boolean; message?: string };
      let result: BanResult;
      if (banType === "role") {
        const selectedRole = getTargetUserRolesForOrg(organizationId).find(
          (role) => role.id === roleAssignmentId,
        );
        result = (await dispatch(
          banUserForRole({
            userId: user.id,
            organizationId,
            roleId: selectedRole?.role_id || roleAssignmentId,
            banReason: banReason.trim(),
            isPermanent,
            notes: notes.trim() || undefined,
          }),
        ).unwrap()) as BanResult;
      } else if (banType === "organization") {
        result = (await dispatch(
          banUserForOrg({
            userId: user.id,
            organizationId,
            banReason: banReason.trim(),
            isPermanent,
            notes: notes.trim() || undefined,
          }),
        ).unwrap()) as BanResult;
      } else {
        result = (await dispatch(
          banUserForApp({
            userId: user.id,
            banReason: banReason.trim(),
            isPermanent,
            notes: notes.trim() || undefined,
          }),
        ).unwrap()) as BanResult;
      }

      if (result?.success) {
        toast.success(t.userBan.toast.success[lang]);
        setOrganizationId("");
        setRoleAssignmentId("");
        setSelectedBanReason("");
        setCustomBanReason("");
        setBanReason("");
        setNotes("");
        setIsPermanent(false);
        setBanType(getDefaultBanType());
        await syncSessionAndRoles();
        if (onSuccess) await onSuccess();
      } else {
        toast.error(result?.message || t.userBan.toast.error[lang]);
      }
    } catch {
      toast.error(t.userBan.toast.error[lang]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t.userBan.fields.banType.label[lang]}</Label>
        <Select
          value={banType}
          onValueChange={(value: BanType) => setBanType(value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {canBanFromApp && (
              <SelectItem value="application">
                {t.userBan.fields.banType.options.application[lang]}
              </SelectItem>
            )}
            {canBanFromOrg && (
              <SelectItem value="organization">
                {t.userBan.fields.banType.options.organization[lang]}
              </SelectItem>
            )}
            {canBanFromRole && (
              <SelectItem value="role">
                {t.userBan.fields.banType.options.role[lang]}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {(banType === "organization" || banType === "role") && (
        <div className="space-y-2">
          <Label>{t.userBan.fields.organization.label[lang]}</Label>
          <Select value={organizationId} onValueChange={setOrganizationId}>
            <SelectTrigger>
              <SelectValue
                placeholder={t.userBan.fields.organization.placeholder[lang]}
              />
            </SelectTrigger>
            <SelectContent>
              {getTargetUserOrganizations().map((org) => (
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
          <Label>{t.userBan.fields.role.label[lang]}</Label>
          <Select value={roleAssignmentId} onValueChange={setRoleAssignmentId}>
            <SelectTrigger>
              <SelectValue
                placeholder={t.userBan.fields.role.placeholder[lang]}
              />
            </SelectTrigger>
            <SelectContent>
              {getTargetUserRolesForOrg(organizationId).map((rr) => (
                <SelectItem key={rr.id} value={rr.id!}>
                  {rr.role_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>{t.userBan.fields.banReason.label[lang]}</Label>
        <Select value={selectedBanReason} onValueChange={setSelectedBanReason}>
          <SelectTrigger>
            <SelectValue
              placeholder={t.userBan.fields.banReason.selectPlaceholder[lang]}
            />
          </SelectTrigger>
          <SelectContent>
            {COMMON_BAN_REASONS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
            <SelectItem value={CUSTOM_BAN_REASON}>
              {t.userBan.fields.banReason.custom[lang]}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedBanReason === CUSTOM_BAN_REASON && (
        <Textarea
          value={customBanReason}
          onChange={(e) => setCustomBanReason(e.target.value)}
          placeholder={t.userBan.fields.banReason.customPlaceholder[lang]}
        />
      )}

      <div className="space-y-2">
        <Label>{t.userBan.fields.notes.label[lang]}</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t.userBan.fields.notes.placeholder[lang]}
          rows={2}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isPermanent"
          checked={isPermanent}
          onCheckedChange={(checked) => setIsPermanent(checked as boolean)}
        />
        <Label htmlFor="isPermanent">
          {t.userBan.fields.isPermanent.label[lang]}
        </Label>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          variant={"secondary"}
          disabled={
            loading ||
            !banReason.trim() ||
            (selectedBanReason === CUSTOM_BAN_REASON && !customBanReason.trim())
          }
        >
          {loading
            ? t.userBan.toast.loading[lang]
            : t.userBan.actions.ban[lang]}
        </Button>
      </div>
    </div>
  );
};

export default UserBan;
