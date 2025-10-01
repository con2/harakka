import { useState, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
  updateOrgLocationWithStorage,
  fetchAllOrgLocations,
} from "@/store/slices/organizationLocationsSlice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  OrgLocationWithNames,
  UpdateOrgLocationWithStorage,
} from "@/types/organizationLocation";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { isValidCityName, normalizeCityName } from "@/utils/locationValidation";

interface EditLocationModalProps {
  location: OrgLocationWithNames | null;
  isOpen: boolean;
  onClose: () => void;
}

type FormData = {
  name: string;
  street: string;
  city: string;
  postcode: string;
  description: string;
  latitude?: number;
  longitude?: number;
  image_url: string;
  is_active: boolean;
};

// Reusable field component for all fields
const FormField = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  rows,
}: {
  id: string;
  label: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  rows?: number;
}) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-sm font-medium">
      {label} {required && "*"}
    </Label>
    {rows ? (
      <Textarea
        id={id}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
    ) : (
      <Input
        id={id}
        type={type}
        step={type === "number" ? "any" : undefined}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    )}
  </div>
);

const EditLocationModal = ({
  location,
  isOpen,
  onClose,
}: EditLocationModalProps) => {
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    street: "",
    city: "",
    postcode: "",
    description: "",
    latitude: undefined,
    longitude: undefined,
    image_url: "",
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to update form fields
  const updateField = (field: keyof FormData) => (value: string) => {
    if (field === "latitude" || field === "longitude") {
      const numValue = value === "" ? undefined : parseFloat(value);
      setFormData((prev) => ({ ...prev, [field]: numValue }));
    } else if (field === "is_active") {
      setFormData((prev) => ({ ...prev, [field]: value === "true" }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  // Populate form when location changes
  useEffect(() => {
    if (location) {
      // Parse the address if it exists
      const address = location.storage_locations?.address || "";
      const addressParts = address.split(", ");
      const street = addressParts[0] || "";
      const addressCity = addressParts[1] || "";
      const postcode = addressParts[2] || "";

      // Parse the location name to extract location name and city
      // format: "Location Name - City"
      const fullLocationName = location.storage_locations?.name || "";
      const dashIndex = fullLocationName.lastIndexOf(" - ");

      let locationName = fullLocationName;
      let cityName = addressCity; // fallback to address city

      if (dashIndex > 0) {
        locationName = fullLocationName.substring(0, dashIndex);
        cityName = fullLocationName.substring(dashIndex + 3);
      }

      setFormData({
        name: locationName,
        street,
        city: cityName,
        postcode,
        description: location.storage_locations?.description || "",
        latitude: undefined, // We don't have these from the current relation?
        longitude: undefined,
        image_url: "",
        is_active: location.is_active ?? true,
      });
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location) return;

    if (
      !formData.name.trim() ||
      !formData.street.trim() ||
      !formData.city.trim() ||
      !formData.postcode.trim()
    ) {
      toast.error(t.editLocationModal.validation.requiredFields[lang]);
      return;
    }

    // Validate city name format (from the city field, not location name)
    if (!isValidCityName(formData.city)) {
      toast.error(t.editLocationModal.validation.invalidCityName[lang]);
      return;
    }

    setIsSubmitting(true);

    try {
      const combinedAddress = `${formData.street}, ${formData.city}, ${formData.postcode}`;

      const updateData: UpdateOrgLocationWithStorage = {
        organization_location: {
          is_active: formData.is_active,
        },
        storage_location: {
          name: `${formData.name} - ${normalizeCityName(formData.city)}`,
          address: combinedAddress,
          description: formData.description,
          latitude: formData.latitude,
          longitude: formData.longitude,
          image_url: formData.image_url,
          is_active: formData.is_active,
        },
      };

      await dispatch(
        updateOrgLocationWithStorage({
          id: location.id,
          data: updateData,
        }),
      ).unwrap();

      // Refresh the organization locations list
      await dispatch(
        fetchAllOrgLocations({
          orgId: location.organization_id,
          pageSize: 100,
          currentPage: 1,
        }),
      );

      toast.success(t.editLocationModal.messages.success[lang]);
      onClose();
    } catch (error) {
      toast.error(t.editLocationModal.messages.error[lang]);
      console.error("Error updating location:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      street: "",
      city: "",
      postcode: "",
      description: "",
      latitude: undefined,
      longitude: undefined,
      image_url: "",
      is_active: true,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!location) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.editLocationModal.title[lang]}</DialogTitle>
          <DialogDescription>
            {t.editLocationModal.description[lang]}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              {t.editLocationModal.fields.name.label[lang]} *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField("name")(e.target.value)}
              placeholder={t.editLocationModal.fields.name.placeholder[lang]}
              required
            />
            <p className="text-xs italic text-muted-foreground">
              {t.editLocationModal.fields.name.notVisibleToUsers[lang]}
            </p>
          </div>

          {/* Address Fields */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">
              {t.editLocationModal.labels.address[lang]} *
            </Label>
            <div className="space-y-3">
              <FormField
                id="street"
                label={t.editLocationModal.fields.street.label[lang]}
                value={formData.street}
                onChange={updateField("street")}
                placeholder={
                  t.editLocationModal.fields.street.placeholder[lang]
                }
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  id="city"
                  label={t.editLocationModal.fields.city.label[lang]}
                  value={formData.city}
                  onChange={updateField("city")}
                  placeholder={
                    t.editLocationModal.fields.city.placeholder[lang]
                  }
                  required
                />
                <FormField
                  id="postcode"
                  label={t.editLocationModal.fields.postcode.label[lang]}
                  value={formData.postcode}
                  onChange={updateField("postcode")}
                  placeholder={
                    t.editLocationModal.fields.postcode.placeholder[lang]
                  }
                  required
                />
              </div>
            </div>
          </div>

          <FormField
            id="description"
            label={t.editLocationModal.fields.description.label[lang]}
            value={formData.description}
            onChange={updateField("description")}
            placeholder={
              t.editLocationModal.fields.description.placeholder[lang]
            }
            rows={3}
          />

          {/* Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="latitude"
              label={t.editLocationModal.fields.latitude.label[lang]}
              value={formData.latitude}
              onChange={updateField("latitude")}
              placeholder={
                t.editLocationModal.fields.latitude.placeholder[lang]
              }
              type="number"
            />
            <FormField
              id="longitude"
              label={t.editLocationModal.fields.longitude.label[lang]}
              value={formData.longitude}
              onChange={updateField("longitude")}
              placeholder={
                t.editLocationModal.fields.longitude.placeholder[lang]
              }
              type="number"
            />
          </div>

          <FormField
            id="image_url"
            label={t.editLocationModal.fields.imageUrl.label[lang]}
            value={formData.image_url}
            onChange={updateField("image_url")}
            placeholder={t.editLocationModal.fields.imageUrl.placeholder[lang]}
          />

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_active: checked }))
              }
            />
            <Label htmlFor="is_active" className="text-sm font-medium">
              {t.editLocationModal.labels.activeLocation[lang]}
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              {t.editLocationModal.buttons.cancel[lang]}
            </Button>
            <Button type="submit" disabled={isSubmitting} variant="secondary">
              {isSubmitting
                ? t.editLocationModal.buttons.saving[lang]
                : t.editLocationModal.buttons.save[lang]}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditLocationModal;
