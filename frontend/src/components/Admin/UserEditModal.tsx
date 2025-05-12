import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useAppDispatch } from "@/store/hooks";
import { updateUser } from "@/store/slices/usersSlice";
import { Label } from "../ui/label";
import { MultiSelect } from "../ui/multi-select";
import { UserFormData, UserProfile } from "@/types";
import { Edit } from "lucide-react";

const UserEditModal = ({ user }: { user: UserProfile }) => {
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState<UserFormData>({
    full_name: user.full_name || "",
    email: user.email || "",
    role: user.role || "user",
    phone: user.phone || "",
    visible_name: user.visible_name || "",
    preferences: user.preferences || {},
    saved_lists: user.saved_lists || [],
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
    setFormData({ ...formData, role: newRole });
  };

  const handleSave = async () => {
    try {
      await dispatch(updateUser({ id: user.id, data: formData })).unwrap();
      toast.success("User updated successfully!");
    } catch {
      toast.error("Failed to update user. Please try again.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={"sm"}
          title="Edit User"
          className="text-highlight2/80 hover:text-highlight2 hover:bg-highlight2/20"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-4 text-center">Edit User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Full Name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              onValueChange={handleRoleChange}
              defaultValue={formData.role}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="superVera">Super Vera</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="visible_name">Visible Name</Label>
            <Input
              name="visible_name"
              value={formData.visible_name}
              onChange={handleChange}
              placeholder="Visible Name"
            />
          </div>

          <div>
            <Label>Preferences</Label>
            {Object.keys(formData.preferences).map((key) => (
              <div key={key} className="flex space-x-2">
                <Input
                  className="mb-2"
                  name={`preference_${key}`}
                  value={formData.preferences[key]}
                  onChange={(e) => handlePreferencesChange(key, e.target.value)}
                  placeholder={"Enter a new preference"}
                />
                <Button
                  type="button"
                  className="deleteBtn"
                  onClick={() => removePreference(key)}
                  size={"sm"}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              className="bg-background rounded-2xl text-secondary border-secondary border-1 hover:text-background hover:bg-secondary"
              type="button"
              onClick={addPreference}
              size={"sm"}
            >
              Add Preference
            </Button>
          </div>

          <div>
            <Label>Saved Lists</Label>
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
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserEditModal;
