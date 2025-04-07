import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/store/hooks";
import { createUser } from "@/store/slices/usersSlice";
import { toast } from "sonner";
import { UserProfile } from "@/types/user";
import { Label } from "../ui/label";

const AddUserModal = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<UserProfile>({
    full_name: "",
    visible_name: "",
    email: "",
    phone: "",
    role: "user",
    saved_lists: [],
    preferences: [],
    createdAt: "",
  });

  const [password, setPassword] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.name === "role" ? (e.target.value as "user" | "admin" | "superVera") : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const isValidEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };

  const handleSave = async () => {
    try {
      if (!password) {
        toast.error("Password is required.");
        return;
      }
      if (!isValidEmail(formData.email)) {
        toast.error("Invalid email address.");
        return;
      }
      const userWithPassword = { ...formData, password };
      await dispatch(createUser(userWithPassword));
      toast.success("User added successfully!");
    } catch (error) {
      toast.error("Failed to add user.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
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
              placeholder="Phone"
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
        </div>
        <DialogFooter>
          <Button className="text-white px-6 rounded-2xl bg-highlight2 hover:bg-white hover:text-highlight2" onClick={handleSave}>
            Save User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserModal;