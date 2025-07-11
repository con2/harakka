import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch } from "@/store/hooks";
import { createUser, updateUser } from "@/store/slices/usersSlice";
import { CreateUserDto, UpdateUserDto, UserProfile } from "@common/user.types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

type UserRole =
  | "user"
  | "admin"
  | "main_admin"
  | "super_admin"
  | "superVera"
  | "storage_manager"
  | "requester";

type TeamMemberFormProps = {
  onClose: () => void;
  initialData?: UserProfile;
};

const AddTeamMemberModal = ({ onClose, initialData }: TeamMemberFormProps) => {
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState<Partial<UserProfile>>(() => ({
    full_name: initialData?.full_name ?? "",
    visible_name: initialData?.visible_name ?? "",
    email: initialData?.email ?? "",
    phone: initialData?.phone ?? "",
    role: initialData?.role ?? "user",
    preferences: initialData?.preferences ?? {},
    saved_lists: initialData?.saved_lists as string[] | undefined,
  }));

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        full_name: initialData.full_name ?? "",
        visible_name: initialData.visible_name ?? "",
        email: initialData.email ?? "",
        phone: initialData.phone ?? "",
        role: (initialData.role as UserRole) ?? "user",
        preferences: initialData.preferences ?? {},
        saved_lists: initialData.saved_lists as string[] | undefined,
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "role" ? (value as "user" | "admin" | "superVera") : value,
    }));
  };

  const handlePreferencesChange = (key: string, value: string) => {
    setFormData({
      ...formData,
      preferences:
        typeof formData.preferences === "object" &&
        !Array.isArray(formData.preferences)
          ? {
              ...(formData.preferences as Record<string, string>),
              [key]: value,
            }
          : { [key]: value },
    });
  };

  const addPreference = () => {
    const newPreferenceKey = `new_key_${Date.now()}`;
    setFormData({
      ...formData,
      preferences:
        typeof formData.preferences === "object" &&
        !Array.isArray(formData.preferences)
          ? {
              ...(formData.preferences as Record<string, string>),
              [newPreferenceKey]: "",
            }
          : { [newPreferenceKey]: "" },
    });
  };

  const removePreference = (key: string) => {
    const newPreferences = {
      ...(formData.preferences as Record<string, string>),
    };
    delete newPreferences[key];
    setFormData({ ...formData, preferences: newPreferences });
  };

  const isValidEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.full_name ||
      !formData.email ||
      !formData.phone ||
      !formData.role
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!isValidEmail(formData.email)) {
      toast.error("Invalid email address.");
      return;
    }

    if (!initialData && !password) {
      toast.error("Password is required when creating a new member.");
      return;
    }

    setLoading(true);

    try {
      if (initialData) {
        // For updates, use the UserFormData directly
        if (!initialData?.id) {
          toast.error("User ID is missing.");
          return;
        }
        await dispatch(
          updateUser({ id: initialData.id, data: formData as UpdateUserDto }),
        ).unwrap();
        toast.success("User updated successfully!");
      } else {
        // For new users, create a proper CreateUserDto with password
        const createPayload = {
          ...(formData as CreateUserDto),
          password,
        };

        await dispatch(createUser(createPayload)).unwrap();
        toast.success("User added successfully!");
      }
      onClose();
    } catch (error: unknown) {
      toast.error(typeof error === "string" ? error : "Failed to save user.");
      console.error("User save error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Team Member" : "Add Team Member"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update the user's details below."
              : "Enter information to create a new team member."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              name="full_name"
              placeholder="Full Name"
              value={formData.full_name ?? ""}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email ?? ""}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="Phone"
              value={formData.phone ?? ""}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role ?? ""}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  role: value as UserRole,
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="main_admin">Main Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="superVera">SuperVera</SelectItem>
                <SelectItem value="storage_manager">Storage Manager</SelectItem>
                <SelectItem value="requester">Requester</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="visible_name">Visible Name</Label>
            <Input
              id="visible_name"
              name="visible_name"
              placeholder="Visible Name"
              value={formData.visible_name ?? ""}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Preferences</Label>
            {Object.keys(formData.preferences || {}).map((key) => (
              <div key={key} className="flex space-x-2">
                <Input
                  className="mb-2"
                  name={`preference_${key}`}
                  value={
                    (formData.preferences as Record<string, string>)?.[key] ??
                    ""
                  }
                  onChange={(e) => handlePreferencesChange(key, e.target.value)}
                  placeholder="Enter a new preference"
                />
                <Button
                  type="button"
                  className="bg-background rounded-2xl px-6 text-destructive border-destructive border hover:text-background"
                  onClick={() => removePreference(key)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              className="bg-background rounded-2xl text-secondary border-secondary border-1 hover:text-background hover:bg-secondary"
              type="button"
              onClick={addPreference}
            >
              Add Preference
            </Button>
          </div>

          {!initialData && (
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
            disabled={loading}
          >
            {loading
              ? initialData
                ? "Updating..."
                : "Creating..."
              : initialData
                ? "Update Member"
                : "Add Member"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTeamMemberModal;
