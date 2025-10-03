import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateOrgLocationWithStorage,
  fetchAllOrgLocations,
  selectOrgLocations,
  selectOrgLocationsLoading,
} from "@/store/slices/organizationLocationsSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UpdateOrgLocationWithStorage } from "@/types/organizationLocation";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { isValidCityName, normalizeCityName } from "@/utils/locationValidation";
import { selectActiveRoleContext } from "@/store/slices/rolesSlice";
import { ChevronLeft, LoaderCircle } from "lucide-react";
import DeleteLocationButton from "@/components/Admin/OrgManagement/DeleteLocationButton";

type FormData = {
  name: string;
  street: string;
  city: string;
  postcode: string;
  description: string;
  image_url: string;
  is_active: boolean;
};

const EditLocationPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const { organizationId } = useAppSelector(selectActiveRoleContext);

  const orgLocations = useAppSelector(selectOrgLocations);
  const loading = useAppSelector(selectOrgLocationsLoading);
  const location = orgLocations.find((loc) => loc.id === id);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    street: "",
    city: "",
    postcode: "",
    description: "",
    image_url: "",
    is_active: true,
  });
  const [originalFormData, setOriginalFormData] = useState<FormData>({
    name: "",
    street: "",
    city: "",
    postcode: "",
    description: "",
    image_url: "",
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when location changes
  useEffect(() => {
    if (location) {
      const address = location.storage_locations?.address || "";
      const addressParts = address.split(", ");
      const street = addressParts[0] || "";
      const addressCity = addressParts[1] || "";
      const postcode = addressParts[2] || "";

      const fullLocationName = location.storage_locations?.name || "";
      const dashIndex = fullLocationName.lastIndexOf(" - ");

      let locationName = fullLocationName;
      let cityName = addressCity;

      if (dashIndex > 0) {
        locationName = fullLocationName.substring(0, dashIndex);
        cityName = fullLocationName.substring(dashIndex + 3);
      }

      const initialData = {
        name: locationName,
        street,
        city: cityName,
        postcode,
        description: location.storage_locations?.description || "",
        image_url: location.storage_locations?.image_url || "",
        is_active: location.is_active ?? true,
      };

      setFormData(initialData);
      setOriginalFormData(initialData);
    }
  }, [location]);

  // Fetch locations if not already loaded
  useEffect(() => {
    if (organizationId && !location && !loading) {
      void dispatch(
        fetchAllOrgLocations({
          orgId: organizationId,
          pageSize: 100,
          currentPage: 1,
        }),
      );
    }
  }, [dispatch, organizationId, location, loading]);

  // Check if form has been modified
  const hasChanges = () => {
    return (
      formData.name !== originalFormData.name ||
      formData.street !== originalFormData.street ||
      formData.city !== originalFormData.city ||
      formData.postcode !== originalFormData.postcode ||
      formData.description !== originalFormData.description ||
      formData.image_url !== originalFormData.image_url ||
      formData.is_active !== originalFormData.is_active
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location || !organizationId) return;

    if (
      !formData.name.trim() ||
      !formData.street.trim() ||
      !formData.city.trim() ||
      !formData.postcode.trim()
    ) {
      toast.error(t.editLocationPage.validation.requiredFields[lang]);
      return;
    }

    if (!isValidCityName(formData.city)) {
      toast.error(t.editLocationPage.validation.invalidCityName[lang]);
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

      await dispatch(
        fetchAllOrgLocations({
          orgId: organizationId,
          pageSize: 100,
          currentPage: 1,
        }),
      );

      toast.success(t.editLocationPage.messages.success[lang]);
      void navigate("/admin/locations");
    } catch (error) {
      toast.error(t.editLocationPage.messages.error[lang]);
      console.error("Error updating location:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !location) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoaderCircle className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          className="text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
          size="sm"
          onClick={() => navigate("/admin/locations")}
          aria-label={t.editLocationPage.ariaLabels.backButton[lang]}
        >
          <ChevronLeft className="h-5 w-5" />
          {t.editLocationPage.buttons.back[lang]}
        </Button>
        <DeleteLocationButton
          locationId={location.id}
          locationName={
            location.storage_locations?.name || `Location #${location.id}`
          }
          organizationId={organizationId || ""}
          onDeleteSuccess={() => navigate("/admin/locations")}
        />
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="font-semibold">
            {t.editLocationPage.title[lang]}
          </CardTitle>
          <p className="text-sm italic text-muted-foreground">
            {t.editLocationPage.fields.name.notVisibleToUsers[lang]}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-">
            {/* Location Name */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="name" className="text-sm font-medium">
                {t.editLocationPage.fields.name.label[lang]} *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder={t.editLocationPage.fields.name.placeholder[lang]}
                required
              />
            </div>

            {/* Address Fields */}
            <div className="space-y-4 mb-4">
              <Label className="text-sm font-medium">
                {t.editLocationPage.labels.address[lang]} *
              </Label>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="street"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    {t.editLocationPage.fields.street.label[lang]}
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
                      t.editLocationPage.fields.street.placeholder[lang]
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
                      {t.editLocationPage.fields.city.label[lang]}
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
                        t.editLocationPage.fields.city.placeholder[lang]
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="postcode"
                      className="text-sm font-medium text-muted-foreground"
                    >
                      {t.editLocationPage.fields.postcode.label[lang]}
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
                        t.editLocationPage.fields.postcode.placeholder[lang]
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-4">
              <Label htmlFor="description" className="text-sm font-medium">
                {t.editLocationPage.fields.description.label[lang]}
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
                  t.editLocationPage.fields.description.placeholder[lang]
                }
                rows={3}
              />
            </div>

            <div className="space-y-2 mb-4">
              <Label htmlFor="image_url" className="text-sm font-medium">
                {t.editLocationPage.fields.imageUrl.label[lang]}
              </Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    image_url: e.target.value,
                  }))
                }
                placeholder={
                  t.editLocationPage.fields.imageUrl.placeholder[lang]
                }
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
                {t.editLocationPage.labels.activeLocation[lang]}
              </Label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/locations")}
              >
                {t.editLocationPage.buttons.cancel[lang]}
              </Button>
              <Button
                variant="secondary"
                type="submit"
                disabled={isSubmitting || !hasChanges()}
              >
                {isSubmitting
                  ? t.editLocationPage.buttons.saving[lang]
                  : t.editLocationPage.buttons.save[lang]}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditLocationPage;
