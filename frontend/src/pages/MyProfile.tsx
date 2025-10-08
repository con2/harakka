import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addAddress,
  deleteAddress,
  deleteUser,
  getUserAddresses,
  selectSelectedUser,
  selectUserAddresses,
  updateAddress,
  updateUser,
} from "@/store/slices/usersSlice";
import { t } from "@/translations";
import { Address, AddressForm } from "@/types/address";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toastConfirm } from "../components/ui/toastConfirm";
import { CurrentUserRoles } from "@/components/Admin/Roles/CurrentUserRoles";
import ProfilePictureUploader from "@/components/ProfilePictureUploader";
import Spinner from "@/components/Spinner";

const MyProfile = () => {
  const dispatch = useAppDispatch();
  const selectedUser = useAppSelector(selectSelectedUser);
  const userAddresses = useAppSelector(selectUserAddresses);
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [name, setName] = useState(selectedUser?.full_name || "");
  const [email, setEmail] = useState(selectedUser?.email || "");
  const [phone, setPhone] = useState(selectedUser?.phone || "");
  const [visibleName, setVisibleName] = useState(
    selectedUser?.visible_name || "",
  );
  const [addresses, setAddresses] = useState<AddressForm[]>(
    userAddresses || [],
  );
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      setName(selectedUser.full_name || "");
      setEmail(selectedUser.email || "");
      setPhone(selectedUser.phone || "");
      setVisibleName(selectedUser.visible_name || "");
      if (addresses.length === 0)
        void dispatch(getUserAddresses(selectedUser.id));
    }
  }, [selectedUser, dispatch, addresses.length]);

  useEffect(() => {
    setAddresses(userAddresses || []);
  }, [userAddresses]);

  const [newAddress, setNewAddress] = useState<AddressForm>({
    user_id: selectedUser?.id || "",
    address_type: "both",
    street_address: "",
    city: "",
    postal_code: "",
    country: "",
    is_default: false,
  });

  const handleSaveChanges = () => {
    if (selectedUser) {
      const updatedUserData = {
        id: selectedUser.id,
        full_name: name,
        email,
        phone,
        visible_name: visibleName,
      };
      try {
        void dispatch(
          updateUser({ id: selectedUser.id, data: updatedUserData }),
        ).unwrap();

        // Loop through addresses and update or add them
        for (const addr of addresses) {
          // Convert AddressForm to CreateAddressInput by excluding user_id and id
          const addressInput = {
            address_type: addr.address_type,
            street_address: addr.street_address,
            city: addr.city,
            postal_code: addr.postal_code,
            country: addr.country,
            is_default: addr.is_default,
          };

          if (addr.id) {
            void dispatch(
              updateAddress({
                id: selectedUser.id,
                addressId: addr.id,
                address: addressInput,
              }),
            ).unwrap();
          } else {
            void dispatch(
              addAddress({ id: selectedUser.id, address: addressInput }),
            ).unwrap();
          }
        }
        void dispatch(getUserAddresses(selectedUser.id));
        toast.success(t.myProfile.toast.updateSuccess[lang]);
      } catch {
        toast.error(t.myProfile.toast.updateError[lang]);
      }
    }
  };

  const handleAddressChange = (
    index: number,
    field: keyof Address,
    value: string | boolean,
  ) => {
    const updatedAddresses = [...addresses];
    updatedAddresses[index] = { ...updatedAddresses[index], [field]: value };
    setAddresses(updatedAddresses);
  };

  const handleDeleteAddress = (index: number) => {
    const address = addresses[index];
    toastConfirm({
      title: t.myProfile.addresses.remove[lang],
      description: t.common.delete[lang] + "?",
      confirmText: t.common.delete[lang],
      cancelText: t.common.cancel[lang],
      onConfirm: async () => {
        try {
          const updatedAddresses = [...addresses];
          updatedAddresses.splice(index, 1);
          setAddresses(updatedAddresses);

          if (address.id) {
            await dispatch(
              deleteAddress({
                id: selectedUser?.id || "",
                addressId: address.id,
              }),
            ).unwrap();
          }
          await dispatch(getUserAddresses(selectedUser!.id)).unwrap();
          toast.success(t.myProfile.toast.addressRemoved[lang]);
        } catch {
          toast.error(t.myProfile.toast.addressRemovalError[lang]);
        }
      },
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSaveChanges();
  };

  const handleDeleteUser = () => {
    toastConfirm({
      title: t.myProfile.deleteUser.title[lang],
      description: t.myProfile.deleteUser.description[lang],
      confirmText: t.myProfile.deleteUser.confirmText[lang],
      cancelText: t.myProfile.deleteUser.cancelText[lang],
      onConfirm: async () => {
        try {
          if (selectedUser?.id) {
            await dispatch(deleteUser(selectedUser.id)).unwrap();
          } else {
            toast.error(t.myProfile.deleteUser.missingId[lang]);
          }
          toast.success(t.myProfile.deleteUser.success[lang]);
          void navigate("/");
        } catch {
          toast.error(t.myProfile.deleteUser.error[lang]);
        }
      },
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-2 md:px-8 m-10 gap-20 box-shadow-lg rounded-lg bg-white min-h-[250px]">
      <div className="w-full bg-slate-50 p-4 rounded-lg mb-10 min-h-[250px]">
        {selectedUser ? (
          <div className="flex flex-col md:flex-row items-start">
            {/* Profile Picture Uploader */}
            <div className="flex md:w-1/4 justify-center p-2">
              <ProfilePictureUploader />
            </div>

            {/* user details */}
            <form onSubmit={handleSubmit} className="w-full">
              <div className="flex flex-col md:flex-1 p-2 w-full gap-12">
                {/* Editable Fields for Details */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-700">
                    {t.myProfile.personalDetails.title[lang]}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-xs font-medium text-gray-700"
                      >
                        {t.myProfile.personalDetails.fullName.label[lang]}
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="p-3 w-full border border-gray-300 rounded-md text-sm text-gray-600 focus:ring-2 focus:ring-secondary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-xs font-medium text-gray-700"
                      >
                        {t.myProfile.personalDetails.email.label[lang]}
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="p-3 w-full border border-gray-300 rounded-md text-sm text-gray-600 focus:ring-2 focus:ring-secondary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-xs font-medium text-gray-700"
                      >
                        {t.myProfile.personalDetails.phone.label[lang]}
                      </label>
                      <input
                        id="phone"
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="p-3 w-full border border-gray-300 rounded-md text-sm text-gray-600 focus:ring-2 focus:ring-secondary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="visibleName"
                        className="block text-xs font-medium text-gray-700"
                      >
                        {t.myProfile.personalDetails.visibleName.label[lang]}
                      </label>
                      <input
                        id="visibleName"
                        type="text"
                        value={visibleName}
                        onChange={(e) => setVisibleName(e.target.value)}
                        className="p-3 w-full border border-gray-300 rounded-md text-sm text-gray-600 focus:ring-2 focus:ring-secondary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Roles */}
                <CurrentUserRoles />

                {/* Addresses */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-700">
                    {t.myProfile.addresses.title[lang]}
                  </h3>

                  {userAddresses && userAddresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {addresses.map((address, index) => (
                        <div
                          key={index}
                          className="border p-4 rounded-md bg-slate-50"
                        >
                          <div className="mb-4">
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                className="accent-secondary"
                                type="checkbox"
                                checked={address.is_default}
                                onChange={(e) =>
                                  handleAddressChange(
                                    index,
                                    "is_default",
                                    e.target.checked,
                                  )
                                }
                              />
                              {t.myProfile.addresses.defaultAddress[lang]}
                            </label>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-700">
                                {
                                  t.myProfile.addresses.streetAddress.label[
                                    lang
                                  ]
                                }
                              </label>
                              <input
                                type="text"
                                value={address.street_address}
                                onChange={(e) =>
                                  handleAddressChange(
                                    index,
                                    "street_address",
                                    e.target.value,
                                  )
                                }
                                className="p-2 w-full border border-gray-300 rounded-md text-sm text-gray-600 focus:ring-2 focus:ring-secondary focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700">
                                {t.myProfile.addresses.city.label[lang]}
                              </label>
                              <input
                                type="text"
                                value={address.city}
                                onChange={(e) =>
                                  handleAddressChange(
                                    index,
                                    "city",
                                    e.target.value,
                                  )
                                }
                                className="p-2 w-full border border-gray-300 rounded-md text-sm text-gray-600 focus:ring-2 focus:ring-secondary focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700">
                                {t.myProfile.addresses.postalCode.label[lang]}
                              </label>
                              <input
                                type="text"
                                value={address.postal_code}
                                onChange={(e) =>
                                  handleAddressChange(
                                    index,
                                    "postal_code",
                                    e.target.value,
                                  )
                                }
                                className="p-2 w-full border border-gray-300 rounded-md text-sm text-gray-600 focus:ring-2 focus:ring-secondary focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700">
                                {t.myProfile.addresses.country.label[lang]}
                              </label>
                              <input
                                type="text"
                                value={address.country}
                                onChange={(e) =>
                                  handleAddressChange(
                                    index,
                                    "country",
                                    e.target.value,
                                  )
                                }
                                className="p-2 w-full border border-gray-300 rounded-md text-sm text-gray-600 focus:ring-2 focus:ring-secondary focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700">
                                {t.myProfile.addresses.type.label[lang]}
                              </label>
                              <select
                                value={address.address_type}
                                onChange={(e) =>
                                  handleAddressChange(
                                    index,
                                    "address_type",
                                    e.target.value,
                                  )
                                }
                                className="border p-2 rounded text-sm w-full bg-white text-gray-600"
                              >
                                <option value="both">
                                  {
                                    t.myProfile.addresses.type.options.both[
                                      lang
                                    ]
                                  }
                                </option>
                                <option value="billing">
                                  {
                                    t.myProfile.addresses.type.options.billing[
                                      lang
                                    ]
                                  }
                                </option>
                                <option value="shipping">
                                  {
                                    t.myProfile.addresses.type.options.shipping[
                                      lang
                                    ]
                                  }
                                </option>
                              </select>
                            </div>

                            <div className="flex justify-end mt-4">
                              <Button
                                size="sm"
                                variant="destructive"
                                type="button"
                                className="text-xs"
                                onClick={() => handleDeleteAddress(index)}
                              >
                                <Trash2 aria-hidden className="mr-1" />
                                {t.myProfile.addresses.remove[lang]}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 mt-4">
                      {t.myProfile.addresses.noAddresses[lang]}
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex justify-between items-center mt-6 gap-3">
                  {/* Delete Account */}
                  <div className="flex justify-start items-center p-4 rounded-md bg-slate-50 mb-0">
                    <Accordion type="single" collapsible>
                      <AccordionItem value="danger-zone" className="mb-0">
                        <AccordionTrigger className="text-red-200 mb-0">
                          {t.myProfile.dangerZone.title[lang]}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">
                          <p className="mb-4">
                            {t.myProfile.dangerZone.description[lang]}
                          </p>
                          <Button
                            size={"sm"}
                            type="button"
                            variant="destructive"
                            onClick={handleDeleteUser}
                          >
                            {t.myProfile.dangerZone.deleteAccount[lang]}
                          </Button>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                  <div className="items-center flex flex-col md:flex-row md:justify-end gap-4">
                    <Button
                      onClick={() => setShowAddAddressForm(true)}
                      size="sm"
                      type="button"
                      className="editBtn"
                    >
                      {t.myProfile.buttons.addNewAddress[lang]}
                    </Button>
                    <Button type="submit" size="sm" variant="outline">
                      {t.myProfile.buttons.saveChanges[lang]}
                    </Button>
                  </div>
                </div>
              </div>
            </form>

            {showAddAddressForm && (
              <Dialog
                open={showAddAddressForm}
                onOpenChange={setShowAddAddressForm}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {t.myProfile.newAddress.title[lang]}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>{t.myProfile.addresses.type.label[lang]}</Label>
                      <Select
                        value={newAddress.address_type}
                        onValueChange={(value) =>
                          setNewAddress({
                            ...newAddress,
                            address_type: value as Address["address_type"],
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              t.myProfile.newAddress.selectType[lang]
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="both">
                            {t.myProfile.addresses.type.options.both[lang]}
                          </SelectItem>
                          <SelectItem value="billing">
                            {t.myProfile.addresses.type.options.billing[lang]}
                          </SelectItem>
                          <SelectItem value="shipping">
                            {t.myProfile.addresses.type.options.shipping[lang]}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label>
                        {t.myProfile.addresses.streetAddress.label[lang]}
                      </Label>
                      <Input
                        value={newAddress.street_address}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            street_address: e.target.value,
                          })
                        }
                        placeholder={
                          t.myProfile.addresses.streetAddress.placeholder[lang]
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>{t.myProfile.addresses.city.label[lang]}</Label>
                      <Input
                        value={newAddress.city}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            city: e.target.value,
                          })
                        }
                        placeholder={
                          t.myProfile.addresses.city.placeholder[lang]
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>
                        {t.myProfile.addresses.postalCode.label[lang]}
                      </Label>
                      <Input
                        value={newAddress.postal_code}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            postal_code: e.target.value,
                          })
                        }
                        placeholder={
                          t.myProfile.addresses.postalCode.placeholder[lang]
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>{t.myProfile.addresses.country.label[lang]}</Label>
                      <Input
                        value={newAddress.country}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            country: e.target.value,
                          })
                        }
                        placeholder={
                          t.myProfile.addresses.country.placeholder[lang]
                        }
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      size={"sm"}
                      onClick={() => {
                        if (!newAddress.street_address || !newAddress.city) {
                          toast.error(
                            t.myProfile.toast.fillAllRequiredFields[lang],
                          );
                          return;
                        }

                        // Convert AddressForm to CreateAddressInput by excluding user_id
                        const addressInput = {
                          address_type: newAddress.address_type,
                          street_address: newAddress.street_address,
                          city: newAddress.city,
                          postal_code: newAddress.postal_code,
                          country: newAddress.country,
                          is_default: newAddress.is_default,
                        };

                        dispatch(
                          addAddress({
                            id: selectedUser?.id || "",
                            address: addressInput,
                          }),
                        )
                          .unwrap()
                          .then(() => {
                            void dispatch(
                              getUserAddresses(selectedUser?.id || ""),
                            );
                            setNewAddress({
                              user_id: selectedUser?.id || "",
                              address_type: "both",
                              street_address: "",
                              city: "",
                              postal_code: "",
                              country: "",
                              is_default: false,
                            });
                            toast.success(
                              t.myProfile.toast.addressAddSuccess[lang],
                            );
                          })
                          .catch(() => {
                            toast.error(
                              t.myProfile.toast.addressAddError[lang],
                            );
                          });

                        setShowAddAddressForm(false);
                      }}
                    >
                      {t.myProfile.newAddress.save[lang]}
                    </Button>
                    <Button
                      variant="destructive"
                      size={"sm"}
                      onClick={() => setShowAddAddressForm(false)}
                    >
                      {t.myProfile.newAddress.cancel[lang]}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        ) : (
          <Spinner
            loaderClasses="text-secondary w-8 h-8"
            containerClasses="flex-1"
          />
        )}
      </div>
    </div>
  );
};

export default MyProfile;
