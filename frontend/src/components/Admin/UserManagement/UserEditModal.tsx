import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/context/LanguageContext";
import { useAppDispatch } from "@/store/hooks";
import { updateUser } from "@/store/slices/usersSlice";
import { t } from "@/translations";
import { UserFormData } from "@/types";
import { Edit } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Label } from "../../ui/label";
import { MultiSelect } from "../../ui/multi-select";
import { UserProfile } from "@common/user.types";

const UserEditModal = ({ user }: { user: UserProfile }) => {
  const dispatch = useAppDispatch();
  // Translation
  const { lang } = useLanguage();

  const [formData, setFormData] = useState<UserFormData>({
    full_name: user.full_name || "",
    email: user.email || "",
    roles: [(user.role as "user" | "admin" | "superVera") || "user"], // Should be fixed when we setup new roles
    phone: user.phone || "",
    visible_name: user.visible_name || "",
    preferences:
      user.preferences &&
      typeof user.preferences === "object" &&
      !Array.isArray(user.preferences)
        ? (Object.fromEntries(
            Object.entries(user.preferences).filter(
              ([_, v]) => typeof v === "string",
            ),
          ) as Record<string, string>)
        : {},
    saved_lists:
      Array.isArray(user.saved_lists) &&
      user.saved_lists.every((item: unknown) => typeof item === "string")
        ? (user.saved_lists as string[])
        : [],
  });

  // Handle changes for normal input fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle changes for preferences input (key-value pairs)
  const handlePreferencesChange = (key: string, value: string) => {
    setFormData({
      ...formData,
      preferences: { ...formData.preferences, [key]: value },
    });
  };

  // Add a new preference field
  const addPreference = () => {
    const newPreferenceKey = `new_key_${Date.now()}`;
    setFormData({
      ...formData,
      preferences: { ...formData.preferences, [newPreferenceKey]: "" },
    });
  };

  // Remove a preference field by its key
  const removePreference = (key: string) => {
    const newPreferences = { ...formData.preferences };
    delete newPreferences[key];
    setFormData({ ...formData, preferences: newPreferences });
  };

  // Handle changes for saved lists (multi-select)
  const handleSavedListsChange = (newSavedLists: string[]) => {
    setFormData({ ...formData, saved_lists: newSavedLists });
  };

  // Handle changes for role
  const handleRoleChange = (newRole: "user" | "admin" | "superVera") => {
    setFormData({ ...formData, roles: [newRole] });
  };

  const handleSave = async () => {
    try {
      await dispatch(
        updateUser({ id: user.id, data: { ...formData, id: user.id } }),
      ).unwrap();
      toast.success(t.userEditModal.messages.success[lang]);
    } catch {
      toast.error(t.userEditModal.messages.error[lang]);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size={"sm"}
          title={t.userEditModal.title[lang]}
          className="text-highlight2/80 hover:text-highlight2 hover:bg-highlight2/20"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-4 text-center">
            {t.userEditModal.title[lang]}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="full_name">
              {t.userEditModal.labels.fullName[lang]}
            </Label>
            <Input
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder={t.userEditModal.placeholders.fullName[lang]}
            />
          </div>
          <div>
            <Label htmlFor="email">{t.userEditModal.labels.email[lang]}</Label>
            <Input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t.userEditModal.placeholders.email[lang]}
            />
          </div>
          <div>
            <Label htmlFor="phone">{t.userEditModal.labels.phone[lang]}</Label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={t.userEditModal.placeholders.phone[lang]}
            />
          </div>
          <div>
            <Label htmlFor="role">{t.userEditModal.labels.role[lang]}</Label>
            <Select
              onValueChange={handleRoleChange}
              defaultValue={formData.roles?.[0]}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue
                  placeholder={t.userEditModal.placeholders.selectRole[lang]}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  {t.userEditModal.roles.admin[lang]}
                </SelectItem>
                <SelectItem value="user">
                  {t.userEditModal.roles.user[lang]}
                </SelectItem>
                <SelectItem value="superVera">
                  {t.userEditModal.roles.superVera[lang]}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="visible_name">
              {t.userEditModal.labels.visibleName[lang]}
            </Label>
            <Input
              name="visible_name"
              value={formData.visible_name}
              onChange={handleChange}
              placeholder={t.userEditModal.placeholders.visibleName[lang]}
            />
          </div>

          <div>
            <Label>{t.userEditModal.labels.preferences[lang]}</Label>
            {Object.keys(formData.preferences).map((key) => (
              <div key={key} className="flex space-x-2">
                <Input
                  className="mb-2"
                  name={`preference_${key}`}
                  value={formData.preferences[key]}
                  onChange={(e) => handlePreferencesChange(key, e.target.value)}
                  placeholder={t.userEditModal.placeholders.preference[lang]}
                />
                <Button
                  type="button"
                  className="deleteBtn"
                  onClick={() => removePreference(key)}
                  size={"sm"}
                >
                  {t.userEditModal.buttons.remove[lang]}
                </Button>
              </div>
            ))}
            <Button
              className="bg-background rounded-2xl text-secondary border-secondary border-1 hover:text-background hover:bg-secondary"
              type="button"
              onClick={addPreference}
              size={"sm"}
            >
              {t.userEditModal.buttons.addPreference[lang]}
            </Button>
          </div>

          <div>
            <Label>{t.userEditModal.labels.savedLists[lang]}</Label>
            <MultiSelect
              selected={formData.saved_lists || []}
              options={["List 1", "List 2", "List 3", "List 4"]} // Replace with actual saved list options
              onChange={handleSavedListsChange}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            className="w-full bg-background rounded-2xl text-secondary border-secondary border-1 hover:text-background hover:bg-secondary"
            onClick={handleSave}
            size={"sm"}
          >
            {t.userEditModal.buttons.save[lang]}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserEditModal;
