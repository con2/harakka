import { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { toast } from "sonner";
import { UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
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
import {
  unbanUser,
  selectUserBanningLoading,
  selectUserBanningError,
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

interface UnbanUserModalProps {
  user: UserProfile;
  initialOpen?: boolean;
  onClose?: () => void;
}

const UnbanUserModal = ({
  user,
  initialOpen = false,
  onClose,
}: UnbanUserModalProps) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectUserBanningLoading);
  const banningError = useAppSelector(selectUserBanningError);
  const activeOrgId = useAppSelector(selectActiveOrganizationId);
  const { lang } = useLanguage();
  const { allUserRoles, refreshAllUserRoles, hasAnyRole, hasRole } = useRoles();

  // Permission checks for different unban types (same as ban permissions)
  const isSuper = hasAnyRole(["super_admin", "superVera"]);
  const isTenantAdmin = hasRole("tenant_admin");

  const canUnbanFromApp = isSuper; // Only super admins can unban from application
  const canUnbanFromOrg = isSuper || isTenantAdmin; // Super admins and tenant admins can unban from org
  const canUnbanFromRole = isSuper || isTenantAdmin; // Super admins and tenant admins can unban from role

  const [isOpen, setIsOpen] = useState(initialOpen);
  const [banType, setBanType] = useState<BanType>("role");
  const [notes, setNotes] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [activeBans, setActiveBans] = useState<SimpleBanHistoryItem[]>([]);
  const [bansLoading, setBansLoading] = useState(false);

  // Get organizations where the user has active bans (these are what we can unban them from)
  const getOrganizationsWithActiveBans = (): TargetUserOrganization[] => {
    const orgMap = new Map<string, TargetUserOrganization>();
    activeBans.forEach((ban) => {
      // Only include bans that are still active (no unbannedAt date) and match the selected ban type
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

  // Get the target user's roles that have active role bans in a specific organization
  const getRolesWithActiveBansForOrg = (orgId: string) => {
    // Get active role bans for this organization
    const activeRoleBans = activeBans.filter(
      (ban) =>
        !ban.unbanned_at &&
        ban.action === "banned" &&
        ban.ban_type === "banForRole" &&
        ban.organization_id === orgId,
    );

    // Get the user's roles in this organization that have active bans
    const rolesWithBans = new Map();
    activeRoleBans.forEach((ban) => {
      if (ban.role_assignment_id) {
        const userRole = allUserRoles.find(
          (role) =>
            role.organization_id === orgId &&
            role.user_id === user.id &&
            // Match by role assignment ID if available, otherwise by role_id
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

  // Check what types of bans are currently active for the user
  const getActiveBanTypes = useCallback((): BanType[] => {
    const activeBanTypes = new Set<BanType>();

    activeBans.forEach((ban) => {
      if (!ban.unbanned_at && ban.action === "banned") {
        // Convert database ban_type values to frontend BanType
        if (ban.ban_type === "banForApp") {
          activeBanTypes.add("application");
        } else if (ban.ban_type === "banForOrg") {
          activeBanTypes.add("organization");
        } else if (ban.ban_type === "banForRole") {
          activeBanTypes.add("role");
        }
      }
    });

    return Array.from(activeBanTypes);
  }, [activeBans]);

  // Check if user has active application ban
  const hasActiveApplicationBan = (): boolean => {
    return activeBans.some(
      (ban) =>
        !ban.unbanned_at &&
        ban.action === "banned" &&
        ban.ban_type === "banForApp",
    );
  };

  // Check if user has active organization bans
  const hasActiveOrganizationBans = (): boolean => {
    return activeBans.some(
      (ban) =>
        !ban.unbanned_at &&
        ban.action === "banned" &&
        ban.ban_type === "banForOrg" &&
        ban.organization_id,
    );
  };

  // Check if user has active role bans
  const hasActiveRoleBans = (): boolean => {
    return activeBans.some(
      (ban) =>
        !ban.unbanned_at &&
        ban.action === "banned" &&
        ban.ban_type === "banForRole" &&
        ban.organization_id,
    );
  };

  // Load active bans when modal opens
  useEffect(() => {
    if (isOpen && user.id) {
      const loadActiveBans = async () => {
        setBansLoading(true);
        try {
          const bans = await userBanningApi.getUserBanHistory(user.id);
          setActiveBans(bans);
        } catch (error) {
          console.error("Failed to load user ban history:", error);
          toast.error(t.userBanning.messages.failedLoadBanHistory[lang]);
        } finally {
          setBansLoading(false);
        }
      };
      void loadActiveBans();
      if (!allUserRoles || allUserRoles.length === 0) {
        void refreshAllUserRoles();
      }
    }
  }, [isOpen, user.id, allUserRoles, refreshAllUserRoles, lang]);

  // Reset role when organization changes
  useEffect(() => {
    if (banType === "role" && organizationId) {
      setRoleId("");
    }
  }, [organizationId, banType]);

  // Reset organization and role when banType changes
  useEffect(() => {
    setOrganizationId("");
    setRoleId("");
  }, [banType]);

  // Reset banType if it's no longer valid based on active bans
  useEffect(() => {
    if (activeBans.length > 0) {
      const activeBanTypes = getActiveBanTypes();
      if (activeBanTypes.length > 0 && !activeBanTypes.includes(banType)) {
        setBanType(activeBanTypes[0]); // Set to first available ban type
        setOrganizationId("");
        setRoleId("");
      }
    }
  }, [activeBans, banType, getActiveBanTypes]);

  const handleSubmit = async () => {
    if (!user.id) {
      toast.error(t.userBanning.messages.invalidUserId[lang]);
      return;
    }

    // Check permissions for the selected unban type
    if (banType === "application" && !canUnbanFromApp) {
      toast.error(t.userBanning.messages.noPermissionUnbanApp[lang]);
      return;
    }
    if (banType === "organization" && !canUnbanFromOrg) {
      toast.error(t.userBanning.messages.noPermissionUnbanOrg[lang]);
      return;
    }
    if (banType === "role" && !canUnbanFromRole) {
      toast.error(t.userBanning.messages.noPermissionUnbanRole[lang]);
      return;
    }

    // Validate required fields based on ban type
    if (banType === "role" && (!organizationId || !roleId)) {
      toast.error(t.userBanning.messages.missingFields[lang]);
      return;
    }

    if (banType === "organization" && !organizationId) {
      toast.error(t.userBanning.messages.missingFields[lang]);
      return;
    }

    // Organization validation for tenant_admin: they can only unban from their active org
    if (
      (banType === "organization" || banType === "role") &&
      isTenantAdmin &&
      !isSuper
    ) {
      if (activeOrgId && organizationId !== activeOrgId) {
        toast.error(t.userBanning.messages.onlyUnbanActiveOrg[lang]);
        return;
      }
    }

    try {
      const result = await dispatch(
        unbanUser({
          userId: user.id,
          banType: banType,
          organizationId: organizationId || undefined,
          roleId: roleId || undefined,
          notes: notes.trim() || undefined,
        }),
      ).unwrap();

      if (result.success) {
        toast.success(t.userBanning.toast.unbanSuccess[lang]);
        handleClose();
      } else {
        toast.error(result.message || t.userBanning.toast.unbanError[lang]);
      }
    } catch {
      toast.error(banningError || t.userBanning.toast.unbanError[lang]);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setBanType("role");
    setNotes("");
    setOrganizationId("");
    setRoleId("");
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
            className="text-green-600 border-green-300 hover:bg-green-50 hover:text-green-700"
            title={t.userBanning.unban.modal.title[lang]}
          >
            <UserCheck className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.userBanning.unban.modal.title[lang]}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {t.userBanning.unban.modal.subtitle[lang]}
          </p>
          <p className="text-sm font-medium">
            {user.full_name} ({user.email})
          </p>
        </DialogHeader>
        <div className="space-y-4">
          {bansLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              {t.userBanning.messages.loadingBanInfo[lang]}
            </div>
          ) : activeBans.some(
              (ban) => !ban.unbanned_at && ban.action === "banned",
            ) ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="banType">
                  {t.userBanning.unban.fields.banTypeToRemove[lang]}
                </Label>
                <Select
                  value={banType}
                  onValueChange={(value: BanType) => setBanType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {hasActiveApplicationBan() && canUnbanFromApp && (
                      <SelectItem value="application">
                        {
                          t.userBanning.unban.fields.selectTypes.application[
                            lang
                          ]
                        }
                      </SelectItem>
                    )}
                    {hasActiveOrganizationBans() && canUnbanFromOrg && (
                      <SelectItem value="organization">
                        {
                          t.userBanning.unban.fields.selectTypes.organization[
                            lang
                          ]
                        }
                      </SelectItem>
                    )}
                    {hasActiveRoleBans() && canUnbanFromRole && (
                      <SelectItem value="role">
                        {t.userBanning.unban.fields.selectTypes.role[lang]}
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
                  <Select
                    value={organizationId}
                    onValueChange={setOrganizationId}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          t.userBanning.unban.fields.organizationPlaceholder[
                            lang
                          ]
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {getOrganizationsWithActiveBans().map(
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
                  <Select value={roleId} onValueChange={setRoleId}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          t.userBanning.unban.fields.rolePlaceholder[lang]
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {getRolesWithActiveBansForOrg(organizationId).map(
                        (role) => (
                          <SelectItem key={role.role_id} value={role.role_id}>
                            {role.role_name}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
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
                  placeholder={
                    t.userBanning.unban.fields.reasonPlaceholder[lang]
                  }
                  rows={2}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              {t.userBanning.messages.noActiveBans[lang]}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t.userBanning.actions.cancel[lang]}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              loading ||
              bansLoading ||
              !activeBans.some(
                (ban) => !ban.unbanned_at && ban.action === "banned",
              )
            }
            variant="secondary"
          >
            {loading ? "Unbanning..." : "Unban User"}
          </Button>
        </DialogFooter>
        <DialogClose />
      </DialogContent>
    </Dialog>
  );
};

export default UnbanUserModal;
