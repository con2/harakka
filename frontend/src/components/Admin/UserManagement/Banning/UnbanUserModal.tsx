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
import { BanType, UserBanHistoryDto } from "@/types/userBanning";
import { useRoles } from "@/hooks/useRoles";
import { userBanningApi } from "@/api/services/userBanning";

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
  const { lang } = useLanguage();
  const { allUserRoles, refreshAllUserRoles } = useRoles();

  const [isOpen, setIsOpen] = useState(initialOpen);
  const [banType, setBanType] = useState<BanType>("application");
  const [notes, setNotes] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [activeBans, setActiveBans] = useState<UserBanHistoryDto[]>([]);
  const [bansLoading, setBansLoading] = useState(false);

  // Get organizations where the user has active bans (these are what we can unban them from)
  const getOrganizationsWithActiveBans = (): TargetUserOrganization[] => {
    const orgMap = new Map<string, TargetUserOrganization>();
    activeBans.forEach((ban) => {
      // Only include bans that are still active (no unbannedAt date) and match the selected ban type
      if (
        !ban.unbanned_at &&
        ban.organization_id &&
        ban.action === "banned" &&
        ban.ban_type === banType
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
        ban.ban_type === "role" &&
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
        activeBanTypes.add(ban.ban_type as BanType);
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
        ban.ban_type === "application",
    );
  };

  // Check if user has active organization bans
  const hasActiveOrganizationBans = (): boolean => {
    return activeBans.some(
      (ban) =>
        !ban.unbanned_at &&
        ban.action === "banned" &&
        ban.ban_type === "organization" &&
        ban.organization_id,
    );
  };

  // Check if user has active role bans
  const hasActiveRoleBans = (): boolean => {
    return activeBans.some(
      (ban) =>
        !ban.unbanned_at &&
        ban.action === "banned" &&
        ban.ban_type === "role" &&
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
          toast.error("Failed to load ban history");
        } finally {
          setBansLoading(false);
        }
      };
      loadActiveBans();
      if (!allUserRoles || allUserRoles.length === 0) {
        refreshAllUserRoles();
      }
    }
  }, [isOpen, user.id, allUserRoles, refreshAllUserRoles]);

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

    // Validate required fields based on ban type
    if (banType === "role" && (!organizationId || !roleId)) {
      toast.error(t.userBanning.messages.missingFields[lang]);
      return;
    }

    if (banType === "organization" && !organizationId) {
      toast.error(t.userBanning.messages.missingFields[lang]);
      return;
    }

    try {
      const result = await dispatch(
        unbanUser({
          userId: user.id,
          banType,
          organizationId: organizationId || undefined,
          roleId: roleId || undefined,
          notes: notes.trim() || undefined,
        }),
      ).unwrap();

      if (result.success) {
        toast.success("User unbanned successfully");
        handleClose();
      } else {
        toast.error(result.message || "Error unbanning user");
      }
    } catch {
      toast.error(banningError || "Error unbanning user");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setBanType("application");
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
            title="Unban User"
          >
            <UserCheck className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Unban User</DialogTitle>
          <p className="text-sm text-muted-foreground">Remove ban for user</p>
          <p className="text-sm font-medium">
            {user.full_name} ({user.email})
          </p>
        </DialogHeader>
        <div className="space-y-4">
          {bansLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              Loading ban information...
            </div>
          ) : activeBans.some(
              (ban) => !ban.unbanned_at && ban.action === "banned",
            ) ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="banType">Ban Type to Remove</Label>
                <Select
                  value={banType}
                  onValueChange={(value: BanType) => setBanType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {hasActiveApplicationBan() && (
                      <SelectItem value="application">
                        Application Ban
                      </SelectItem>
                    )}
                    {hasActiveOrganizationBans() && (
                      <SelectItem value="organization">
                        Organization Ban
                      </SelectItem>
                    )}
                    {hasActiveRoleBans() && (
                      <SelectItem value="role">Role Ban</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {(banType === "organization" || banType === "role") && (
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Select
                    value={organizationId}
                    onValueChange={setOrganizationId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization to unban from..." />
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
                  <Label htmlFor="role">Role</Label>
                  <Select value={roleId} onValueChange={setRoleId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role to unban from..." />
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
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reason for unbanning..."
                  rows={2}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              This user has no active bans to remove.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
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
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? "Unbanning..." : "Unban User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UnbanUserModal;
