import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  unbanUser,
  selectUserBanningLoading,
  selectUserBanningError,
} from "@/store/slices/userBanningSlice";
import { UserProfile } from "@common/user.types";
import { BanType } from "@/types/userBanning";

interface UnbanUserModalProps {
  user: UserProfile;
  initialOpen?: boolean;
}

const UnbanUserModal = ({ user, initialOpen = false }: UnbanUserModalProps) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectUserBanningLoading);
  const banningError = useAppSelector(selectUserBanningError);
  const { lang } = useLanguage();

  const [isOpen, setIsOpen] = useState(initialOpen);
  const [banType, setBanType] = useState<BanType>("application");
  const [notes, setNotes] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [roleId, setRoleId] = useState("");

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
                <SelectItem value="application">Application Ban</SelectItem>
                <SelectItem value="organization">Organization Ban</SelectItem>
                <SelectItem value="role">Role Ban</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(banType === "organization" || banType === "role") && (
            <div className="space-y-2">
              <Label htmlFor="organization">Organization ID</Label>
              <Input
                id="organization"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                placeholder="Enter organization ID"
              />
            </div>
          )}

          {banType === "role" && (
            <div className="space-y-2">
              <Label htmlFor="role">Role ID</Label>
              <Input
                id="role"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                placeholder="Enter role ID"
              />
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
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
