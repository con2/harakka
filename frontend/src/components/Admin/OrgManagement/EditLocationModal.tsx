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
      // Parse the address if it exists, assuming format "street, city, postcode"
      const address = location.storage_locations?.address || "";
      const addressParts = address.split(", ");
      const street = addressParts[0] || "";
      const city = addressParts[1] || "";
      const postcode = addressParts[2] || "";

      setFormData({
        name: location.storage_locations?.name || "",
        street,
        city,
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
      toast.error("Name, street, city, and postcode are required");
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
          name: formData.name,
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
          <FormField
            id="name"
            label={t.addLocationModal.fields.name.label[lang]}
            value={formData.name}
            onChange={updateField("name")}
            placeholder={t.addLocationModal.fields.name.placeholder[lang]}
            required
          />

          {/* Address Fields */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">
              {t.addLocationModal.labels.address[lang]} *
            </Label>
            <div className="space-y-3">
              <FormField
                id="street"
                label={t.addLocationModal.fields.street.label[lang]}
                value={formData.street}
                onChange={updateField("street")}
                placeholder={t.addLocationModal.fields.street.placeholder[lang]}
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  id="city"
                  label={t.addLocationModal.fields.city.label[lang]}
                  value={formData.city}
                  onChange={updateField("city")}
                  placeholder={t.addLocationModal.fields.city.placeholder[lang]}
                  required
                />
                <FormField
                  id="postcode"
                  label={t.addLocationModal.fields.postcode.label[lang]}
                  value={formData.postcode}
                  onChange={updateField("postcode")}
                  placeholder={
                    t.addLocationModal.fields.postcode.placeholder[lang]
                  }
                  required
                />
              </div>
            </div>
          </div>

          <FormField
            id="description"
            label={t.addLocationModal.fields.description.label[lang]}
            value={formData.description}
            onChange={updateField("description")}
            placeholder={
              t.addLocationModal.fields.description.placeholder[lang]
            }
            rows={3}
          />

          {/* Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="latitude"
              label={t.addLocationModal.fields.latitude.label[lang]}
              value={formData.latitude}
              onChange={updateField("latitude")}
              placeholder={t.addLocationModal.fields.latitude.placeholder[lang]}
              type="number"
            />
            <FormField
              id="longitude"
              label={t.addLocationModal.fields.longitude.label[lang]}
              value={formData.longitude}
              onChange={updateField("longitude")}
              placeholder={
                t.addLocationModal.fields.longitude.placeholder[lang]
              }
              type="number"
            />
          </div>

          <FormField
            id="image_url"
            label={t.addLocationModal.fields.imageUrl.label[lang]}
            value={formData.image_url}
            onChange={updateField("image_url")}
            placeholder={t.addLocationModal.fields.imageUrl.placeholder[lang]}
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
              {t.addLocationModal.labels.activeLocation[lang]}
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
