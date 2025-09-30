import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchOrganizationById,
  updateOrganization,
  selectOrganizationLoading,
  setSelectedOrganization,
} from "@/store/slices/organizationSlice";
import {
  ArrowLeft,
  Building2,
  Edit,
  LoaderCircle,
  Save,
  X,
} from "lucide-react";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import OrganizationDelete from "@/components/Admin/Organizations/OrganizationDelete";
import OrganizationLogoUploader from "@/components/Admin/Organizations/OrganizationLogoUploader";

const OrganizationDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();
  const loading = useAppSelector(selectOrganizationLoading);
  const selectedOrg = useAppSelector(
    (state) => state.organizations.selectedOrganization,
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    slug: "",
    description: "",
    is_active: true,
  });

  // Check if this is a protected organization
  const isProtectedOrg =
    selectedOrg?.name === "Global" || selectedOrg?.name === "High Council";

  useEffect(() => {
    if (id) {
      void dispatch(fetchOrganizationById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedOrg) {
      setEditForm({
        name: selectedOrg.name || "",
        slug: selectedOrg.slug || "",
        description: selectedOrg.description || "",
        is_active: selectedOrg.is_active,
      });
    }
  }, [selectedOrg]);

  const handleEdit = () => {
    if (isProtectedOrg) {
      toast.error(t.organizationDetailsPage.toasts.protectedEditError[lang]);
      return;
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (selectedOrg) {
      setEditForm({
        name: selectedOrg.name || "",
        slug: selectedOrg.slug || "",
        description: selectedOrg.description || "",
        is_active: selectedOrg.is_active,
      });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!selectedOrg || isProtectedOrg) return;

    try {
      await dispatch(
        updateOrganization({ id: selectedOrg.id, data: editForm }),
      ).unwrap();
      toast.success(t.organizationDetailsPage.toasts.updateSuccess[lang]);
      setIsEditing(false);
      // Refresh the data
      void dispatch(fetchOrganizationById(selectedOrg.id));
    } catch {
      toast.error(t.organizationDetailsPage.toasts.updateError[lang]);
    }
  };

  const handleToggleActive = async (checked: boolean) => {
    if (!selectedOrg || isProtectedOrg) return;

    try {
      await dispatch(
        updateOrganization({
          id: selectedOrg.id,
          data: { is_active: checked },
        }),
      ).unwrap();
      toast.success(
        checked
          ? t.organizationDetailsPage.toasts.activateSuccess[lang]
          : t.organizationDetailsPage.toasts.deactivateSuccess[lang],
      );
      // Update local state
      setEditForm((prev) => ({ ...prev, is_active: checked }));
      // Refresh the data
      void dispatch(fetchOrganizationById(selectedOrg.id));
    } catch {
      toast.error(t.organizationDetailsPage.toasts.statusUpdateError[lang]);
    }
  };

  const handleBackToList = () => {
    dispatch(setSelectedOrganization(null));
    void navigate("/admin/organizations");
  };

  const handleDeleted = () => {
    dispatch(setSelectedOrganization(null));
    void navigate("/admin/organizations");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoaderCircle className="animate-spin text-muted" />
      </div>
    );
  }

  if (!selectedOrg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-muted-foreground">
          {t.organizationDetailsPage.notFound[lang]}
        </p>
        <Button onClick={handleBackToList} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.organizationDetailsPage.backButton[lang]}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-4 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button onClick={handleBackToList} variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.organizationDetailsPage.backButton[lang]}
        </Button>

        <div className="flex items-center space-x-2">
          {!isProtectedOrg && (
            <>
              {isEditing ? (
                <>
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    size="sm"
                  >
                    <X className="w-4 h-4 mr-2" />
                    {t.organizationDetailsPage.buttons.cancel[lang]}
                  </Button>
                  <Button onClick={handleSave} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    {t.organizationDetailsPage.buttons.save[lang]}
                  </Button>
                </>
              ) : (
                <Button onClick={handleEdit} variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  {t.organizationDetailsPage.buttons.edit[lang]}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Organization Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              {selectedOrg.name}
              {isProtectedOrg && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {t.organizationDetailsPage.protected[lang]}
                </span>
              )}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Logo - Show uploader when editing and not protected, otherwise show static avatar */}
          <div className="flex justify-center">
            {isEditing && !isProtectedOrg ? (
              <OrganizationLogoUploader
                currentImage={selectedOrg.logo_picture_url}
                organizationId={selectedOrg.id}
                onLogoUpdated={(_url) => {
                  void dispatch(fetchOrganizationById(selectedOrg.id));
                }}
              />
            ) : (
              <Avatar className="w-20 h-20">
                <AvatarImage
                  src={selectedOrg.logo_picture_url ?? undefined}
                  alt={`${selectedOrg.name} logo`}
                />
                <AvatarFallback>
                  <Building2 className="h-10 w-10 text-gray-400" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          {/* Organization Info */}
          <div className="space-y-4 text-sm">
            <div>
              <strong>
                {t.organizationDetailsPage.fields.description[lang]}:
              </strong>{" "}
              {isEditing ? (
                <Textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="mt-2"
                  rows={3}
                />
              ) : (
                <span>
                  {selectedOrg.description ||
                    t.organizationDetailsPage.fields.noDescription[lang]}
                </span>
              )}
            </div>

            <div>
              <strong>{t.organizationDetailsPage.fields.slug[lang]}:</strong>{" "}
              {isEditing ? (
                <Input
                  value={editForm.slug}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  className="mt-2"
                />
              ) : (
                <span>{selectedOrg.slug || "—"}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <strong>{t.organizationDetailsPage.fields.status[lang]}:</strong>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={
                    isEditing ? editForm.is_active : selectedOrg.is_active
                  }
                  onCheckedChange={handleToggleActive}
                  disabled={isProtectedOrg}
                />
                <span>
                  {(isEditing ? editForm.is_active : selectedOrg.is_active)
                    ? t.organizationDetailsPage.fields.active[lang]
                    : t.organizationDetailsPage.fields.inactive[lang]}
                </span>
              </div>
            </div>

            <div>
              <strong>
                {t.organizationDetailsPage.fields.createdAt[lang]}:
              </strong>{" "}
              {selectedOrg.created_at
                ? new Date(selectedOrg.created_at).toLocaleString()
                : "—"}
            </div>

            <div>
              <strong>
                {t.organizationDetailsPage.fields.createdBy[lang]}:
              </strong>{" "}
              {selectedOrg.created_by || "—"}
            </div>

            <div>
              <strong>
                {t.organizationDetailsPage.fields.updatedAt[lang]}:
              </strong>{" "}
              {selectedOrg.updated_at
                ? new Date(selectedOrg.updated_at).toLocaleString()
                : "—"}
            </div>

            <div>
              <strong>
                {t.organizationDetailsPage.fields.updatedBy[lang]}:
              </strong>{" "}
              {selectedOrg.updated_by || "—"}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <OrganizationDelete id={selectedOrg.id} onDeleted={handleDeleted} />
      </div>
    </div>
  );
};

export default OrganizationDetailsPage;
