import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/store/hooks";
import { createUser } from "@/store/slices/usersSlice";
import { toast } from "sonner";
import { UserProfile } from "@/types/user";
import { Label } from "../ui/label";
import { useAuth } from "@/context/AuthContext";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const initialFormState: UserProfile = {
  full_name: "",
  visible_name: "",
  email: "",
  phone: "",
  role: "user",
  saved_lists: [],
  preferences: [],
  createdAt: "",
};

const AddUserModal = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState<UserProfile>(initialFormState);
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false); // control modal state

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
      toast.error("Password is required.");
      return;
    }
    if (!isValidEmail(formData.email)) {
      toast.error("Invalid email address.");
      return;
    }
    try {
      const userWithPassword = { ...formData, password };
      await dispatch(createUser(userWithPassword)).unwrap();
      toast.success("User added successfully!");

      resetForm();
      setOpen(false); // close modal on success
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add user.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center mb-4">Add New User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Full Name"
            />
          </div>

          <div>
            <Label htmlFor="visible_name">Visible Name</Label>
            <Input
              id="visible_name"
              name="visible_name"
              value={formData.visible_name}
              onChange={handleChange}
              placeholder="Visible Name"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </div>

          {user?.role === "superVera" && (
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superVera">Super Vera</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            className="bg-background rounded-2xl text-secondary border-secondary border-1 hover:text-background hover:bg-secondary"
            onClick={handleSubmit}
          >
            Add User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserModal;