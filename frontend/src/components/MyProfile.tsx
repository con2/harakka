import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectSelectedUser, updateUser } from "@/store/slices/usersSlice";
import { Button } from "@/components/ui/button";
import MyOrders from './MyOrders'; 
import { useEffect, useState } from "react";
import { Avatar } from "./ui/avatar";
import profilePlaceholder from "../assets/profilePlaceholder.png";
import { toast } from "sonner";

const MyProfile = () => {
  const dispatch = useAppDispatch();
  const selectedUser = useAppSelector(selectSelectedUser);

  const [name, setName] = useState(selectedUser?.full_name || "");
  const [email, setEmail] = useState(selectedUser?.email || "");
  const [phone, setPhone] = useState(selectedUser?.phone || "");
  const [visibleName, setVisibleName] = useState(selectedUser?.visible_name || "");
  // const [preferences, setPreferences] = useState(selectedUser?.preferences || "");
  const profileImage = profilePlaceholder;

  useEffect(() => {
    if (selectedUser) {
      setName(selectedUser.full_name || "");
      setEmail(selectedUser.email || "");
      setPhone(selectedUser.phone || "");
      setVisibleName(selectedUser.visible_name || "");
      // setPreferences(selectedUser.preferences || "");
    }
  }, [selectedUser]);

  const handleSaveChanges = () => {
    if (selectedUser) {
      const updatedUserData = { 
        full_name: name, 
        email, 
        phone, 
        visible_name: visibleName, 
        // preferences: typeof preferences === "string" ? undefined : preferences 
      };
      
      // Dispatch the updateUser action
      dispatch(updateUser({ id: selectedUser.id, data: updatedUserData }))
        .unwrap()
        .then(() => {
          toast.success('Profile updated successfully!'); 
        })
        .catch(() => {
          toast.error('Failed to update profile.');
        });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 m-10 gap-20 box-shadow-lg rounded-lg bg-white">

      <Tabs defaultValue="user-details" className="w-full bg-slate-50 p-4 rounded-lg mb-10">
        <TabsList className="grid w-full grid-cols-2 mb-8 gap-4">
          <TabsTrigger
            value="user-details"
          >
            My Profile
          </TabsTrigger>
          <TabsTrigger
            value="orders"
          >
            My Orders
          </TabsTrigger>
        </TabsList>

        {/* User Details Tab */}
        <TabsContent value="user-details">
          <div className="space-y-4">
            {selectedUser ? (
              <div className="flex flex-row items-start">
                <div className="flex flex-1 items-center justify-left p-2 space-y-4">
                  <Avatar className="w-24 h-24 rounded-full border-1 border-secondary flex">
                    <img src={profileImage || ""} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  </Avatar>
                </div>
                
                {/* Editable Fields for Name, Email, and Phone */}
                <div className="flex flex-2 flex-col p-2 space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-medium text-gray-700">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 p-3 w-full border border-gray-300 rounded-md text-sm text-gray-600 focus:ring-2 focus:ring-secondary focus:outline-none"
                      style={{ fontSize: '0.875rem', height: '40px' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-gray-700">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 p-3 w-full border border-gray-300 rounded-md text-sm text-gray-600 focus:ring-2 focus:ring-secondary focus:outline-none"
                      style={{ fontSize: '0.875rem', height: '40px' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-xs font-medium text-gray-700">Phone</label>
                    <input
                      id="phone"
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1 p-3 w-full border border-gray-300 rounded-md text-sm text-gray-600 focus:ring-2 focus:ring-secondary focus:outline-none"
                      style={{ fontSize: '0.875rem', height: '40px' }}
                    />
                  </div>
                </div>

                {/* Placeholder div for spacing */}
                <div className="flex flex-2 flex-col p-2 space-y-4">
                  <div>
                    <label htmlFor="visibleName" className="block text-xs font-medium text-gray-700">Visible Name</label>
                    <input
                      id="visibleName"
                      type="text"
                      value={visibleName}
                      onChange={(e) => setVisibleName(e.target.value)}
                      className="mt-1 p-3 w-full border border-gray-300 rounded-md text-sm text-gray-600 focus:ring-2 focus:ring-secondary focus:outline-none"
                      style={{ fontSize: '0.875rem', height: '40px' }}
                    />
                  </div>
                  {/* <div>
                    <label htmlFor="preferences" className="block text-xs font-medium text-gray-700">Preferences</label>
                    <input
                      id="preferences"
                      type="text"
                      value={preferences}
                      onChange={(e) => setPreferences(e.target.value)}
                      className="mt-1 p-3 w-full border border-gray-300 rounded-md text-sm text-gray-600 focus:ring-2 focus:ring-secondary focus:outline-none"
                      style={{ fontSize: '0.875rem', height: '40px' }}
                    />
                  </div> */}
                </div>
              </div>
            ) : (
              <div className="animate-spin text-center">Loading...</div>
            )}
          </div>

          {/* Save Button */}
          <div className="mt-6 text-right">
            <Button
              onClick={handleSaveChanges}
              size={"sm"}
              className="bg-secondary text-white border-secondary border hover:bg-white hover:text-secondary"
            >
              Save Changes
            </Button>
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <MyOrders />  {/* Embedding your existing MyOrders component */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyProfile;