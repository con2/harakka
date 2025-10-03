import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createOrgLocationWithStorage,
  fetchAllOrgLocations,
} from "@/store/slices/organizationLocationsSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateOrgLocationWithStorage } from "@/types/organizationLocation";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { isValidCityName, normalizeCityName } from "@/utils/locationValidation";
import { selectActiveRoleContext } from "@/store/slices/rolesSlice";
import { ChevronLeft } from "lucide-react";

interface StorageLocationFormData {
  name: string;
  street: string;
  city: string;
  postcode: string;
  description: string;
  image_url?: string;
  is_active: boolean;
}

const AddLocationPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { organizationId } = useAppSelector(selectActiveRoleContext);

  const [formData, setFormData] = useState<StorageLocationFormData>({
    name: "",
    street: "",
    city: "",
    postcode: "",
    description: "",
    image_url: "",
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!organizationId) {
      toast.error("No organization selected");
      return;
    }

    if (
      !formData.name.trim() ||
      !formData.street.trim() ||
      !formData.city.trim() ||
      !formData.postcode.trim()
    ) {
      toast.error(t.addLocationPage.validation.requiredFields[lang]);
      return;
    }

    if (!isValidCityName(formData.city)) {
      toast.error(t.addLocationPage.validation.invalidCityName[lang]);
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
          image_url: formData.image_url,
          is_active: formData.is_active,
        },
      };

      await dispatch(createOrgLocationWithStorage(locationData)).unwrap();

      await dispatch(
        fetchAllOrgLocations({
          orgId: organizationId,
          pageSize: 100,
          currentPage: 1,
        }),
      );

      toast.success(t.addLocationPage.messages.success[lang]);
      void navigate("/admin/locations");
    } catch (error) {
      toast.error(t.addLocationPage.messages.error[lang]);
      console.error("Error creating location:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify between">
        <Button
          className="text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
          size="sm"
          onClick={() => navigate("/admin/locations")}
          aria-label={t.addLocationPage.ariaLabels.backButton[lang]}
        >
          <ChevronLeft className="h-5 w-5" />
          {t.addLocationPage.buttons.back[lang]}
        </Button>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader className="space-y-1 text-center mb-2">
          <CardTitle className="font-semibold">
            {t.addLocationPage.title[lang]}
          </CardTitle>
          <p className="text-sm italic text-muted-foreground">
            {t.addLocationPage.fields.name.notVisibleToUsers[lang]}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  {t.addLocationPage.fields.name.label[lang]} *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder={t.addLocationPage.fields.name.placeholder[lang]}
                  required
                />
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <Label htmlFor="image_url" className="text-sm font-medium">
                  {t.addLocationPage.fields.imageUrl.label[lang]}
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
                    t.addLocationPage.fields.imageUrl.placeholder[lang]
                  }
                />
              </div>
            </div>

            {/* Address Fields */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">
                {t.addLocationPage.labels.address[lang]} *
              </Label>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="street"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    {t.addLocationPage.fields.street.label[lang]}
                  </Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        street: e.target.value,
                      }))
                    }
                    placeholder={
                      t.addLocationPage.fields.street.placeholder[lang]
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
                      {t.addLocationPage.fields.city.label[lang]}
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      placeholder={
                        t.addLocationPage.fields.city.placeholder[lang]
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="postcode"
                      className="text-sm font-medium text-muted-foreground"
                    >
                      {t.addLocationPage.fields.postcode.label[lang]}
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
                        t.addLocationPage.fields.postcode.placeholder[lang]
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
                {t.addLocationPage.fields.description.label[lang]}
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
                  t.addLocationPage.fields.description.placeholder[lang]
                }
                rows={3}
              />
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
                {t.addLocationPage.fields.isActive.label[lang]}
              </Label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/locations")}
              >
                {t.addLocationPage.buttons.cancel[lang]}
              </Button>
              <Button variant="secondary" type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? t.addLocationPage.buttons.creating[lang]
                  : t.addLocationPage.buttons.create[lang]}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddLocationPage;
