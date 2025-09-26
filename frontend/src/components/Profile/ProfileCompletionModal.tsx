// Only the editable address fields in this modal
type AddressFormKeys = "street_address" | "city" | "postal_code" | "country";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, User, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import type { AddressForm } from "@/types/address";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

export interface ProfileCompletionData {
  full_name: string;
  phone?: string;
}

export interface CompleteProfileData {
  profile: ProfileCompletionData;
  address?: Partial<AddressForm>;
}

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: CompleteProfileData) => Promise<boolean>;
  missingFields?: string[];
  hasPhone?: boolean;
}

export const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  missingFields = ["full_name"],
  hasPhone = false,
}) => {
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileCompletionData>({
    full_name: "",
    phone: "",
  });
  const [addressData, setAddressData] = useState<Partial<AddressForm>>({
    street_address: "",
    city: "",
    postal_code: "",
    country: "",
  });
  const [errors, setErrors] = useState<{
    full_name?: string;
    phone?: string;
    street_address?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  }>({});

  const needsFullName = missingFields.includes("full_name");
  const recommendPhone = !hasPhone;

  const validateForm = (): boolean => {
    const newErrors: {
      full_name?: string;
      phone?: string;
      street_address?: string;
      city?: string;
      postal_code?: string;
      country?: string;
    } = {};

    if (needsFullName && !profileData.full_name.trim()) {
      newErrors.full_name =
        t.cart.profileCompletion.fields.fullName.required[lang];
    }

    // Basic address validation - only if any address field is filled
    const hasAnyAddressData =
      (addressData.street_address ?? "").trim() ||
      (addressData.city ?? "").trim() ||
      (addressData.postal_code ?? "").trim() ||
      (addressData.country ?? "").trim();

    if (hasAnyAddressData) {
      if (!(addressData.street_address ?? "").trim()) {
        newErrors.street_address =
          t.cart.profileCompletion.fields.address.streetAddress.required[lang];
      }
      if (!(addressData.city ?? "").trim()) {
        newErrors.city =
          t.cart.profileCompletion.fields.address.city.required[lang];
      }
      if (!(addressData.postal_code ?? "").trim()) {
        newErrors.postal_code =
          t.cart.profileCompletion.fields.address.postalCode.required[lang];
      }
      if (!(addressData.country ?? "").trim()) {
        newErrors.country =
          t.cart.profileCompletion.fields.address.country.required[lang];
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const hasAddressData =
        (addressData.street_address ?? "").trim() ||
        (addressData.city ?? "").trim() ||
        (addressData.postal_code ?? "").trim() ||
        (addressData.country ?? "").trim();

      const completeData: CompleteProfileData = {
        profile: profileData,
        ...(hasAddressData && { address: addressData }),
      };

      const success = await onComplete(completeData);
      if (success) {
        onClose();
      } else {
        toast.error(t.cart.profileCompletion.errors.updateFailed[lang]);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(t.cart.profileCompletion.errors.updateFailed[lang]);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (
    field: keyof ProfileCompletionData,
    value: string,
  ) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAddressChange = (field: AddressFormKeys, value: string) => {
    setAddressData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing (narrowed to AddressFormKeys)
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCancel = () => {
    setProfileData({ full_name: "", phone: "" });
    setAddressData({
      street_address: "",
      city: "",
      postal_code: "",
      country: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t.cart.profileCompletion.title[lang]}
          </DialogTitle>
          <DialogDescription>
            {t.cart.profileCompletion.description[lang]}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {needsFullName && (
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-sm font-medium">
                {t.cart.profileCompletion.fields.fullName.label[lang]} *
              </Label>
              <Input
                id="full_name"
                type="text"
                value={profileData.full_name}
                onChange={(e) =>
                  handleProfileChange("full_name", e.target.value)
                }
                placeholder={
                  t.cart.profileCompletion.fields.fullName.placeholder[lang]
                }
                disabled={loading}
                className={errors.full_name ? "border-red-500" : ""}
              />
              {errors.full_name && (
                <p className="text-sm text-red-500">{errors.full_name}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Phone className="h-4 w-4" />
              {t.cart.profileCompletion.fields.phone.label[lang]}
              {recommendPhone && (
                <span className="text-muted-foreground text-xs">
                  {t.cart.profileCompletion.fields.phone.recommended[lang]}
                </span>
              )}
            </Label>
            <Input
              id="phone"
              type="tel"
              value={profileData.phone || ""}
              onChange={(e) => handleProfileChange("phone", e.target.value)}
              placeholder={
                t.cart.profileCompletion.fields.phone.placeholder[lang]
              }
              disabled={loading}
            />
            {recommendPhone && (
              <p className="text-xs text-muted-foreground">
                {t.cart.profileCompletion.fields.phone.description[lang]}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t.cart.profileCompletion.fields.address.label[lang]}
              <span className="text-muted-foreground text-xs">
                {t.cart.profileCompletion.fields.address.optional[lang]}
              </span>
            </Label>
            <p className="text-xs text-muted-foreground">
              {t.cart.profileCompletion.fields.address.description[lang]}
            </p>

            <div className="space-y-3">
              <div>
                <Label htmlFor="street_address" className="text-xs">
                  {
                    t.cart.profileCompletion.fields.address.streetAddress.label[
                      lang
                    ]
                  }
                </Label>
                <Input
                  id="street_address"
                  type="text"
                  value={addressData.street_address ?? ""}
                  onChange={(e) =>
                    handleAddressChange("street_address", e.target.value)
                  }
                  placeholder={
                    t.cart.profileCompletion.fields.address.streetAddress
                      .placeholder[lang]
                  }
                  disabled={loading}
                  className={errors.street_address ? "border-red-500" : ""}
                />
                {errors.street_address && (
                  <p className="text-sm text-red-500">
                    {errors.street_address}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="city" className="text-xs">
                    {t.cart.profileCompletion.fields.address.city.label[lang]}
                  </Label>
                  <Input
                    id="city"
                    type="text"
                    value={addressData.city ?? ""}
                    onChange={(e) =>
                      handleAddressChange("city", e.target.value)
                    }
                    placeholder={
                      t.cart.profileCompletion.fields.address.city.placeholder[
                        lang
                      ]
                    }
                    disabled={loading}
                    className={errors.city ? "border-red-500" : ""}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-500">{errors.city}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="postal_code" className="text-xs">
                    {
                      t.cart.profileCompletion.fields.address.postalCode.label[
                        lang
                      ]
                    }
                  </Label>
                  <Input
                    id="postal_code"
                    type="text"
                    value={addressData.postal_code ?? ""}
                    onChange={(e) =>
                      handleAddressChange("postal_code", e.target.value)
                    }
                    placeholder={
                      t.cart.profileCompletion.fields.address.postalCode
                        .placeholder[lang]
                    }
                    disabled={loading}
                    className={errors.postal_code ? "border-red-500" : ""}
                  />
                  {errors.postal_code && (
                    <p className="text-sm text-red-500">{errors.postal_code}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="country" className="text-xs">
                  {t.cart.profileCompletion.fields.address.country.label[lang]}
                </Label>
                <Input
                  id="country"
                  type="text"
                  value={addressData.country ?? ""}
                  onChange={(e) =>
                    handleAddressChange("country", e.target.value)
                  }
                  placeholder={
                    t.cart.profileCompletion.fields.address.country.placeholder[
                      lang
                    ]
                  }
                  disabled={loading}
                  className={errors.country ? "border-red-500" : ""}
                />
                {errors.country && (
                  <p className="text-sm text-red-500">{errors.country}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              {t.cart.profileCompletion.buttons.cancel[lang]}
            </Button>
            <Button
              type="submit"
              variant="secondary"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.cart.profileCompletion.buttons.updating[lang]}
                </>
              ) : (
                t.cart.profileCompletion.buttons.complete[lang]
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
