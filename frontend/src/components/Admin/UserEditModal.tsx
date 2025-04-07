import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useAppDispatch } from "@/store/hooks";
import { updateUser } from "@/store/slices/usersSlice";
import { Label } from "../ui/label";

const UserEditModal = ({ user }: { user: any }) => {
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    full_name: user.full_name || "",
    email: user.email || "",
    role: user.role || "user",
    phone: user.phone || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (newRole: "user" | "admin" | "superVera") => {
    setFormData({ ...formData, role: newRole });
  };

  const handleSave = async () => {
    try {
      await dispatch(updateUser({ id: user.id, data: formData })).unwrap();
      toast.success("User updated successfully!");
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      toast.error("Failed to update user. Please try again.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-background rounded-2xl px-6 text-highlight2 border-highlight2 border-1 hover:text-background hover:bg-highlight2">Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-4 text-center">Edit User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Full Name" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select onValueChange={handleRoleChange} defaultValue={formData.role}>
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
        </div>

        <DialogFooter>
          <Button className="bg-background rounded-2xl text-secondary border-secondary border-1 hover:text-background hover:bg-secondary" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserEditModal;
