import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { toast } from "sonner";
import { Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
  selectUserBanningError,
} from "@/store/slices/userBanningSlice";
import { UserProfile } from "@common/user.types";
import { BanType } from "@/types/userBanning";
import { useRoles } from "@/hooks/useRoles";
import { useBanPermissions } from "@/hooks/useBanPermissions";
import { COMMON_BAN_REASONS, CUSTOM_BAN_REASON } from "@/config/constants";
import { selectActiveOrganizationId } from "@/store/slices/rolesSlice";

interface TargetUserOrganization {
  organization_id: string;
  organization_name: string;
}

interface UserBanModalProps {
  user: UserProfile;
  initialOpen?: boolean;
  onClose?: () => void;
}

const UserBanModal = ({
  user,
  initialOpen = false,
  onClose,
}: UserBanModalProps) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectUserBanningLoading);
  const banningError = useAppSelector(selectUserBanningError);
  const activeOrgId = useAppSelector(selectActiveOrganizationId);
  const { lang } = useLanguage();
  const {
    allUserRoles,
    refreshAllUserRoles,
    adminLoading,
    hasAnyRole,
    hasRole,
  } = useRoles();
  const { getBanPermissions } = useBanPermissions();

  // Permission checks for different ban types
  const isSuper = hasAnyRole(["super_admin", "superVera"]);
  const isMainAdmin = hasRole("main_admin");

  // Get ban permissions for this specific user
  const { canBanFromApp, canBanFromOrg, canBanFromRole } = getBanPermissions(
    user.id,
  );

  // Get default ban type based on permissions (prioritize from most restrictive to least)
  const getDefaultBanType = (): BanType => {
    if (canBanFromRole) return "role";
    if (canBanFromOrg) return "organization";
    if (canBanFromApp) return "application";
    return "role"; // fallback
  };

  const [isOpen, setIsOpen] = useState(initialOpen);
  const [banType, setBanType] = useState<BanType>(getDefaultBanType());
  const [selectedBanReason, setSelectedBanReason] = useState<string>("");
  const [customBanReason, setCustomBanReason] = useState("");
  const [banReason, setBanReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isPermanent, setIsPermanent] = useState(false);
  const [organizationId, setOrganizationId] = useState("");
  const [roleAssignmentId, setRoleAssignmentId] = useState("");

  // Get organizations where the target user has roles (these are what we can ban them from)
  const getTargetUserOrganizations = (): TargetUserOrganization[] => {
    const userRoles = allUserRoles.filter(
      (role) => role.user_id === user.id && role.is_active,
    );
    const orgMap = new Map<string, TargetUserOrganization>();
    userRoles.forEach((role) => {
      if (role.organization_id && !orgMap.has(role.organization_id)) {
        // For main_admin, only show organizations they have access to (activeOrgId)
        // For super admins, show all organizations
        if (isSuper || !activeOrgId || role.organization_id === activeOrgId) {
          orgMap.set(role.organization_id, {
            organization_id: role.organization_id,
            organization_name: role.organization_name ?? "",
          });
        }
      }
    });
    const organizations = Array.from(orgMap.values());
    return organizations;
  };
  // Get the target user's roles in a specific organization for banning
  const getTargetUserRolesForOrg = (orgId: string) => {
    const roles = allUserRoles.filter(
      (role) =>
        role.user_id === user.id &&
        role.organization_id === orgId &&
        role.is_active,
    );
    return roles;
  };

  // Reset role when organization changes
  useEffect(() => {
    if (banType === "role" && organizationId) {
      setRoleAssignmentId("");
    }
  }, [organizationId, banType]);

  // Load all user roles when modal opens
  useEffect(() => {
    if (isOpen && (!allUserRoles || allUserRoles.length === 0)) {
      void refreshAllUserRoles();
    }
  }, [isOpen, allUserRoles, refreshAllUserRoles, adminLoading]);

  // Update final ban reason based on selection
  useEffect(() => {
    if (selectedBanReason === CUSTOM_BAN_REASON) {
      setBanReason(customBanReason);
    } else {
      setBanReason(selectedBanReason);
    }
  }, [selectedBanReason, customBanReason]);

  // If user has no permission to ban this target user, don't render the modal
  if (!canBanFromApp && !canBanFromOrg && !canBanFromRole) {
    return null;
  }

  const handleSubmit = async () => {
    if (!user.id) {
      toast.error(t.userBanning.messages.invalidUserId[lang]);
      return;
    }

    // Check permissions for the selected ban type
    if (banType === "application" && !canBanFromApp) {
      toast.error(
        "You don't have permission to ban users from the application",
      );
      return;
    }
    if (banType === "organization" && !canBanFromOrg) {
      toast.error("You don't have permission to ban users from organizations");
      return;
    }
    if (banType === "role" && !canBanFromRole) {
      toast.error("You don't have permission to ban users from roles");
      return;
    }

    // Additional validation for main_admin: they can only ban "admin" or "user" roles
    if (banType === "role" && isMainAdmin && !isSuper) {
      const selectedRole = getTargetUserRolesForOrg(organizationId).find(
        (role) => role.id === roleAssignmentId,
      );
      if (
        selectedRole &&
        !["admin", "user"].includes(selectedRole.role_name || "")
      ) {
        toast.error("You can only ban users from 'admin' or 'user' roles");
        return;
      }
    }

    // Organization validation for main_admin: they can only ban from their active org
    if (
      (banType === "organization" || banType === "role") &&
      isMainAdmin &&
      !isSuper
    ) {
      if (activeOrgId && organizationId !== activeOrgId) {
        toast.error("You can only ban users from your active organization");
        return;
      }
    }

    if (!banReason.trim()) {
      toast.error(t.userBanning.messages.missingFields[lang]);
      return;
    }

    // Additional validation for custom reason
    if (selectedBanReason === CUSTOM_BAN_REASON && !customBanReason.trim()) {
      toast.error("Please provide a custom ban reason");
      return;
    }

    // Validate required fields based on ban type
    if (banType === "role" && (!organizationId || !roleAssignmentId)) {
      toast.error(t.userBanning.messages.missingFields[lang]);
      return;
    }

    if (banType === "organization" && !organizationId) {
      toast.error(t.userBanning.messages.missingFields[lang]);
      return;
    }

    try {
      let result;

      switch (banType) {
        case "role": {
          // Get the selected role assignment to extract the actual role_id
          const selectedRole = getTargetUserRolesForOrg(organizationId).find(
            (role) => role.id === roleAssignmentId,
          );
          result = await dispatch(
            banUserForRole({
              userId: user.id,
              organizationId: organizationId,
              roleId: selectedRole?.role_id || roleAssignmentId, // Use role_id if available
              banReason: banReason.trim(),
              isPermanent: isPermanent,
              notes: notes.trim() || undefined,
            }),
          ).unwrap();
          break;
        }
        case "organization":
          result = await dispatch(
            banUserForOrg({
              userId: user.id,
              organizationId: organizationId,
              banReason: banReason.trim(),
              isPermanent: isPermanent,
              notes: notes.trim() || undefined,
            }),
          ).unwrap();
          break;
        case "application":
          result = await dispatch(
            banUserForApp({
              userId: user.id,
              banReason: banReason.trim(),
              isPermanent: isPermanent,
              notes: notes.trim() || undefined,
            }),
          ).unwrap();
          break;
        default:
          throw new Error("Invalid ban type");
      }

      if (result?.success) {
        toast.success(t.userBanning.toast.success[lang]);
        handleClose();
      } else {
        toast.error(result?.message || t.userBanning.toast.error[lang]);
      }
    } catch {
      toast.error(banningError || t.userBanning.toast.error[lang]);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setBanType("application");
    setSelectedBanReason("");
    setCustomBanReason("");
    setBanReason("");
    setNotes("");
    setIsPermanent(false);
    setOrganizationId("");
    setRoleAssignmentId("");
    if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!initialOpen && (
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-orange-600 border-orange-300 hover:bg-orange-50 hover:text-orange-700"
            title={t.userBanning.button.title[lang]}
          >
            <Ban className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.userBanning.modal.title[lang]}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {t.userBanning.modal.subtitle[lang]}
          </p>
          <p className="text-sm font-medium">
            {user.full_name} ({user.email})
          </p>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="banType">
              {t.userBanning.fields.banType.label[lang]}
            </Label>
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
                    {t.userBanning.fields.banType.options.application[lang]}
                  </SelectItem>
                )}
                {canBanFromOrg && (
                  <SelectItem value="organization">
                    {t.userBanning.fields.banType.options.organization[lang]}
                  </SelectItem>
                )}
                {canBanFromRole && (
                  <SelectItem value="role">
                    {t.userBanning.fields.banType.options.role[lang]}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {(banType === "organization" || banType === "role") && (
            <div className="space-y-2">
              <Label htmlFor="organization">
                {t.userBanning.fields.organization.label[lang]}
              </Label>
              <Select value={organizationId} onValueChange={setOrganizationId}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      t.userBanning.fields.organization.placeholder[lang]
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {getTargetUserOrganizations().map(
                    (org: TargetUserOrganization) => (
                      <SelectItem
                        key={org.organization_id}
                        value={org.organization_id}
                      >
                        {org.organization_name}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {banType === "role" && organizationId && (
            <div className="space-y-2">
              <Label htmlFor="role">
                {t.userBanning.fields.role.label[lang]}
              </Label>
              <Select
                value={roleAssignmentId}
                onValueChange={setRoleAssignmentId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t.userBanning.fields.role.placeholder[lang]}
                  />
                </SelectTrigger>
                <SelectContent>
                  {getTargetUserRolesForOrg(organizationId)
                    .filter((userRole) => userRole.role_id) // Filter out null role_ids
                    .map((userRole) => (
                      <SelectItem key={userRole.id} value={userRole.id!}>
                        {userRole.role_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="banReason">
              {t.userBanning.fields.banReason.label[lang]}
            </Label>
            <Select
              value={selectedBanReason}
              onValueChange={setSelectedBanReason}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    t.userBanning.fields.banReason.selectPlaceholder[lang]
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {COMMON_BAN_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedBanReason === CUSTOM_BAN_REASON && (
            <div className="space-y-2">
              <Label htmlFor="customBanReason">
                {t.userBanning.fields.banReason.custom[lang]}
              </Label>
              <Textarea
                id="customBanReason"
                value={customBanReason}
                onChange={(e) => setCustomBanReason(e.target.value)}
                placeholder={
                  t.userBanning.fields.banReason.customPlaceholder[lang]
                }
                rows={3}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">
              {t.userBanning.fields.notes.label[lang]}
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.userBanning.fields.notes.placeholder[lang]}
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
              {t.userBanning.fields.isPermanent.label[lang]}
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t.userBanning.actions.cancel[lang]}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              loading ||
              !banReason.trim() ||
              (selectedBanReason === CUSTOM_BAN_REASON &&
                !customBanReason.trim())
            }
            variant="secondary"
          >
            {loading
              ? t.userBanning.toast.loading[lang]
              : t.userBanning.actions.ban[lang]}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserBanModal;
