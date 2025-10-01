import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
  createOrgLocationWithStorage,
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
import { CreateOrgLocationWithStorage } from "@/types/organizationLocation";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { isValidCityName, normalizeCityName } from "@/utils/locationValidation";

interface AddLocationModalProps {
  organizationId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface StorageLocationFormData {
  name: string;
  street: string;
  city: string;
  postcode: string;
  description: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  is_active: boolean;
}

const AddLocationModal = ({
  organizationId,
  isOpen,
  onClose,
}: AddLocationModalProps) => {
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();
  const [formData, setFormData] = useState<StorageLocationFormData>({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.street.trim() ||
      !formData.city.trim() ||
      !formData.postcode.trim()
    ) {
      toast.error(t.addLocationModal.validation.requiredFields[lang]);
      return;
    }

    // Validate city name format (from the city field, not location name)
    if (!isValidCityName(formData.city)) {
      toast.error(t.addLocationModal.validation.invalidCityName[lang]);
      return;
    }

    setIsSubmitting(true);

    try {
      const combinedAddress = `${formData.street}, ${formData.city}, ${formData.postcode}`;

      const locationData: CreateOrgLocationWithStorage = {
        organization_id: organizationId,
        is_active: formData.is_active,
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

      await dispatch(createOrgLocationWithStorage(locationData)).unwrap();

      // Refresh the organization locations list
      await dispatch(
        fetchAllOrgLocations({
          orgId: organizationId,
          pageSize: 100,
          currentPage: 1,
        }),
      );

      toast.success(t.addLocationModal.messages.success[lang]);
      resetForm();
      onClose();
    } catch (error) {
      toast.error(t.addLocationModal.messages.error[lang]);
      console.error("Error creating location:", error);
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.addLocationModal.title[lang]}</DialogTitle>
          <DialogDescription>
            {t.addLocationModal.description[lang]}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                {t.addLocationModal.fields.name.label[lang]} *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder={t.addLocationModal.fields.name.placeholder[lang]}
                required
              />
              <p className="text-xs italic text-muted-foreground">
                {t.addLocationModal.fields.name.notVisibleToUsers[lang]}
              </p>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="image_url" className="text-sm font-medium">
                {t.addLocationModal.fields.imageUrl.label[lang]}
              </Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    image_url: e.target.value,
                  }))
                }
                placeholder={
                  t.addLocationModal.fields.imageUrl.placeholder[lang]
                }
              />
            </div>
          </div>

          {/* Address Fields */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">
              {t.addLocationModal.labels.address[lang]} *
            </Label>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label
                  htmlFor="street"
                  className="text-sm font-medium text-muted-foreground"
                >
                  {t.addLocationModal.fields.street.label[lang]}
                </Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, street: e.target.value }))
                  }
                  placeholder={
                    t.addLocationModal.fields.street.placeholder[lang]
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="city"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    {t.addLocationModal.fields.city.label[lang]}
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, city: e.target.value }))
                    }
                    placeholder={
                      t.addLocationModal.fields.city.placeholder[lang]
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="postcode"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    {t.addLocationModal.fields.postcode.label[lang]}
                  </Label>
                  <Input
                    id="postcode"
                    value={formData.postcode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        postcode: e.target.value,
                      }))
                    }
                    placeholder={
                      t.addLocationModal.fields.postcode.placeholder[lang]
                    }
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              {t.addLocationModal.fields.description.label[lang]}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder={
                t.addLocationModal.fields.description.placeholder[lang]
              }
              rows={3}
            />
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude" className="text-sm font-medium">
                {t.addLocationModal.fields.latitude.label[lang]}
              </Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    latitude: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  }))
                }
                placeholder={
                  t.addLocationModal.fields.latitude.placeholder[lang]
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude" className="text-sm font-medium">
                {t.addLocationModal.fields.longitude.label[lang]}
              </Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    longitude: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  }))
                }
                placeholder={
                  t.addLocationModal.fields.longitude.placeholder[lang]
                }
              />
            </div>
          </div>

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
              {t.addLocationModal.fields.isActive.label[lang]}
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleClose}>
              {t.addLocationModal.buttons.cancel[lang]}
            </Button>
            <Button type="submit" disabled={isSubmitting} variant="outline">
              {isSubmitting
                ? t.addLocationModal.buttons.creating[lang]
                : t.addLocationModal.buttons.create[lang]}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLocationModal;
