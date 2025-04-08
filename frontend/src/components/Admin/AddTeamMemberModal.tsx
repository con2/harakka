import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAppDispatch } from "@/store/hooks";
import { createUser, updateUser } from "@/store/slices/usersSlice";
import { UserProfile } from "@/types/user";
import { toast } from "sonner";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Label } from "@/components/ui/label";

type TeamMemberFormProps = {
  onClose: () => void;
  initialData?: UserProfile;
};

const AddTeamMemberModal = ({ onClose, initialData }: TeamMemberFormProps) => {
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState<UserProfile>({
    full_name: "",
    visible_name: "",
    email: "",
    phone: "",
    role: "user", // tried with admin and superVera, but it didn't work
    saved_lists: [],
    preferences: [],
    createdAt: "",
    ...(initialData || {}),
  });

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "role" ? (value as "user" | "admin" | "superVera") : value,
    }));
  };

  const isValidEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Form Data before sending:", formData);
    console.log("Password:", password);
  
    if (!formData.full_name || !formData.email || !formData.phone || !formData.role) {
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
  
    if (!["admin", "superVera", "user"].includes(formData.role)) {
      toast.error("Invalid role.");
      return;
    }
  
    const payload = { ...formData };
  
    if (!initialData) {
      (payload as any).password = password;
    }

    console.log("Payload being sent:", payload);
  
    setLoading(true);
  
    try {
      if (initialData) {
        if (!initialData?.id) {
          toast.error("User ID is missing.");
          return;
        }
        await dispatch(updateUser({ id: initialData.id, data: payload })).unwrap();
        toast.success("User updated successfully!");
      } else {
        await dispatch(createUser(payload)).unwrap();
        toast.success("User added successfully!");
      }
  
      onClose(); // Close the modal after the action completes
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save user.");
      console.error("User save error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
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
              value={formData.full_name}
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
              value={formData.email}
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
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, role: value as "admin" | "superVera" | "user" }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="superVera">SuperVera</SelectItem>
              </SelectContent>
            </Select>
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