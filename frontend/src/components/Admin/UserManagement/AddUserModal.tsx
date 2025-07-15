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
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createUser,
  selectError,
  selectErrorContext,
  selectLoading,
} from "@/store/slices/usersSlice";
import { t } from "@/translations";
import { CreateUserDto } from "@common/user.types";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Label } from "../../ui/label";
import { useAuth } from "@/hooks/useAuth";

const initialFormState: Omit<CreateUserDto, "password"> = {
  id: "",
  full_name: "",
  visible_name: "",
  email: "",
  phone: "",
  role: "user",
  preferences: {},
};

const AddUserModal = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const errorContext = useAppSelector(selectErrorContext);
  // Translation
  const { lang } = useLanguage();

  const [formData, setFormData] =
    useState<Omit<CreateUserDto, "password">>(initialFormState);
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);

  // Display errors when they occur
  useEffect(() => {
    if (error && errorContext === "create") {
      toast.error(error);
    }
  }, [error, errorContext]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (newRole: "user" | "admin" | "superVera") => {
    setFormData({ ...formData, role: newRole });
  };

  const isValidEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setPassword("");
  };

  const handleSubmit = async () => {
    if (!password) {
      toast.error(t.addUserModal.messages.passwordRequired[lang]);
      return;
    }
    if (!isValidEmail(formData.email ?? "")) {
      toast.error(t.addUserModal.messages.invalidEmail[lang]);
      return;
    }
    try {
      const payload: CreateUserDto = { ...formData, password };
      await dispatch(createUser(payload)).unwrap();

      toast.success(
        t.addUserModal.messages.success[lang].replace(
          "{email}",
          payload.email ?? "",
        ),
      );
      resetForm();
      setOpen(false);
    } catch {
      // Error is already handled by the redux slice and displayed via useEffect
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center mb-4">
            {t.addUserModal.title[lang]}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="full_name">
              {t.addUserModal.labels.fullName[lang]}
            </Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name ?? ""}
              onChange={handleChange}
              placeholder={t.addUserModal.placeholders.fullName[lang]}
            />
          </div>

          <div>
            <Label htmlFor="visible_name">
              {t.addUserModal.labels.visibleName[lang]}
            </Label>
            <Input
              id="visible_name"
              name="visible_name"
              value={formData.visible_name ?? ""}
              onChange={handleChange}
              placeholder={t.addUserModal.placeholders.visibleName[lang]}
            />
          </div>

          <div>
            <Label htmlFor="email">{t.addUserModal.labels.email[lang]}</Label>
            <Input
              id="email"
              name="email"
              value={formData.email ?? ""}
              onChange={handleChange}
              placeholder={t.addUserModal.placeholders.email[lang]}
            />
          </div>

          <div>
            <Label htmlFor="phone">{t.addUserModal.labels.phone[lang]}</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone ?? ""}
              onChange={handleChange}
              placeholder={t.addUserModal.placeholders.phone[lang]}
              autoComplete="new-phone"
            />
          </div>

          <div>
            <Label htmlFor="password">
              {t.addUserModal.labels.password[lang]}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password ?? ""}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.addUserModal.placeholders.password[lang]}
              autoComplete="new-password"
            />
          </div>

          {user?.role === "superVera" && (
            <div>
              <Label htmlFor="role">{t.addUserModal.labels.role[lang]}</Label>
              <Select
                value={formData.role ?? ""}
                onValueChange={handleRoleChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={t.addUserModal.placeholders.selectRole[lang]}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    {t.addUserModal.roles.user[lang]}
                  </SelectItem>
                  <SelectItem value="admin">
                    {t.addUserModal.roles.admin[lang]}
                  </SelectItem>
                  <SelectItem value="superVera">
                    {t.addUserModal.roles.superVera[lang]}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            className="w-full bg-background rounded-2xl text-secondary border-secondary border hover:text-background hover:bg-secondary"
            onClick={handleSubmit}
            disabled={loading}
            size={"sm"}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.addUserModal.buttons.creating[lang]}
              </>
            ) : (
              t.addUserModal.buttons.create[lang]
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserModal;
