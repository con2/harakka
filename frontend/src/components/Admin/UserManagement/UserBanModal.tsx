import { useState } from "react";
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
import { Input } from "@/components/ui/input";
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

interface UserBanModalProps {
  user: UserProfile;
  initialOpen?: boolean;
}

const UserBanModal = ({ user, initialOpen = false }: UserBanModalProps) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectUserBanningLoading);
  const banningError = useAppSelector(selectUserBanningError);
  const { lang } = useLanguage();

  const [isOpen, setIsOpen] = useState(initialOpen);
  const [banType, setBanType] = useState<BanType>("role");
  const [banReason, setBanReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isPermanent, setIsPermanent] = useState(false);
  const [organizationId, setOrganizationId] = useState("");
  const [roleId, setRoleId] = useState("");

  const handleSubmit = async () => {
    if (!user.id) {
      toast.error(t.userBanning.messages.invalidUserId[lang]);
      return;
    }

    if (!banReason.trim()) {
      toast.error(t.userBanning.messages.missingFields[lang]);
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
              <Input
                id="organization"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                placeholder={
                  t.userBanning.fields.organization.placeholder[lang]
                }
              />
            </div>
          )}

          {banType === "role" && (
            <div className="space-y-2">
              <Label htmlFor="role">
                {t.userBanning.fields.role.label[lang]}
              </Label>
              <Input
                id="role"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                placeholder={t.userBanning.fields.role.placeholder[lang]}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="banReason">
              {t.userBanning.fields.banReason.label[lang]}
            </Label>
            <Textarea
              id="banReason"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder={t.userBanning.fields.banReason.placeholder[lang]}
              rows={3}
            />
          </div>

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
            disabled={loading || !banReason.trim()}
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
