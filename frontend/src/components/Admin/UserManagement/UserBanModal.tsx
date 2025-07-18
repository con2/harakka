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
import { COMMON_BAN_REASONS, CUSTOM_BAN_REASON } from "@/config/constants";

interface TargetUserOrganization {
  organization_id: string;
  organization_name: string;
}

interface UserBanModalProps {
  user: UserProfile;
  initialOpen?: boolean;
}

const UserBanModal = ({ user, initialOpen = false }: UserBanModalProps) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectUserBanningLoading);
  const banningError = useAppSelector(selectUserBanningError);
  const { lang } = useLanguage();
  const { allUserRoles, refreshAllUserRoles } = useRoles();

  const [isOpen, setIsOpen] = useState(initialOpen);
  const [banType, setBanType] = useState<BanType>("role");
  const [selectedBanReason, setSelectedBanReason] = useState<string>("");
  const [customBanReason, setCustomBanReason] = useState("");
  const [banReason, setBanReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isPermanent, setIsPermanent] = useState(false);
  const [organizationId, setOrganizationId] = useState("");
  const [roleId, setRoleId] = useState("");

  // Get organizations where the target user has roles (these are what we can ban them from)
  const getTargetUserOrganizations = (): TargetUserOrganization[] => {
    console.log("All user roles:", allUserRoles);
    console.log("Target user ID:", user.id);
    const userRoles = allUserRoles.filter(
      (role) => role.user_id === user.id && role.is_active,
    );
    console.log("Filtered user roles for target user:", userRoles);
    const orgMap = new Map<string, TargetUserOrganization>();
    userRoles.forEach((role) => {
      if (role.organization_id && !orgMap.has(role.organization_id)) {
        orgMap.set(role.organization_id, {
          organization_id: role.organization_id,
          organization_name: role.organization_name ?? "",
        });
      }
    });
    const organizations = Array.from(orgMap.values());
    console.log("Available organizations:", organizations);
    return organizations;
  };
  // Get the target user's roles in a specific organization for banning
  const getTargetUserRolesForOrg = (orgId: string) => {
    return allUserRoles.filter(
      (role) =>
        role.user_id === user.id &&
        role.organization_id === orgId &&
        role.is_active,
    );
  };

  // Reset role when organization changes
  useEffect(() => {
    if (banType === "role" && organizationId) {
      setRoleId("");
    }
  }, [organizationId, banType]);

  // Load all user roles when modal opens
  useEffect(() => {
    if (isOpen && (!allUserRoles || allUserRoles.length === 0)) {
      refreshAllUserRoles();
    }
  }, [isOpen, allUserRoles, refreshAllUserRoles]);

  // Update final ban reason based on selection
  useEffect(() => {
    if (selectedBanReason === CUSTOM_BAN_REASON) {
      setBanReason(customBanReason);
    } else {
      setBanReason(selectedBanReason);
    }
  }, [selectedBanReason, customBanReason]);

  const handleSubmit = async () => {
    if (!user.id) {
      toast.error(t.userBanning.messages.invalidUserId[lang]);
      return;
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
    if (banType === "role" && (!organizationId || !roleId)) {
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
        case "role":
          result = await dispatch(
            banUserForRole({
              userId: user.id,
              organizationId,
              roleId,
              banReason: banReason.trim(),
              isPermanent,
              notes: notes.trim() || undefined,
            }),
          ).unwrap();
          break;
        case "organization":
          result = await dispatch(
            banUserForOrg({
              userId: user.id,
              organizationId,
              banReason: banReason.trim(),
              isPermanent,
              notes: notes.trim() || undefined,
            }),
          ).unwrap();
          break;
        case "application":
          result = await dispatch(
            banUserForApp({
              userId: user.id,
              banReason: banReason.trim(),
              isPermanent,
              notes: notes.trim() || undefined,
            }),
          ).unwrap();
          break;
      }

      if (result.success) {
        toast.success(t.userBanning.toast.success[lang]);
        handleClose();
      } else {
        toast.error(result.message || t.userBanning.toast.error[lang]);
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
    setRoleId("");
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
                <SelectItem value="application">
                  {t.userBanning.fields.banType.options.application[lang]}
                </SelectItem>
                <SelectItem value="organization">
                  {t.userBanning.fields.banType.options.organization[lang]}
                </SelectItem>
                <SelectItem value="role">
                  {t.userBanning.fields.banType.options.role[lang]}
                </SelectItem>
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
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t.userBanning.fields.role.placeholder[lang]}
                  />
                </SelectTrigger>
                <SelectContent>
                  {getTargetUserRolesForOrg(organizationId)
                    .filter((userRole) => userRole.role_id) // Filter out null role_ids
                    .map((userRole) => (
                      <SelectItem
                        key={userRole.role_id}
                        value={userRole.role_id!}
                      >
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
                <SelectValue placeholder="Select a reason..." />
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
              <Label htmlFor="customBanReason">Custom Ban Reason</Label>
              <Textarea
                id="customBanReason"
                value={customBanReason}
                onChange={(e) => setCustomBanReason(e.target.value)}
                placeholder="Please specify the reason for banning..."
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
            className="bg-orange-600 hover:bg-orange-700"
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
