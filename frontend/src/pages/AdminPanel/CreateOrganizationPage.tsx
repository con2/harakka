import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { createOrganization } from "@/store/slices/organizationSlice";
import { ArrowLeft, Building2, Save } from "lucide-react";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CreateOrganizationPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBackToList = () => {
    void navigate("/admin/organizations");
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error(t.organizations.validation.nameRequired[lang]);
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(createOrganization(formData)).unwrap();
      toast.success(t.organizations.toasts.created[lang]);
      void navigate("/admin/organizations");
    } catch {
      toast.error(t.organizations.toasts.creationFailed[lang]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="max-w-4xl mx-4 p-6 space-y-6">
      <h1 className="text-xl">{t.organizationDetailsPage.createTitle[lang]}</h1>

      {/* Header */}
      <div className="flex items-center justify-between">
        <Button onClick={handleBackToList} variant="secondary" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.organizationDetailsPage.backButton[lang]}
        </Button>

        <div className="flex items-center space-x-2">
          <Button
            onClick={handleSave}
            size="sm"
            variant="outline"
            disabled={isSubmitting || !formData.name.trim()}
          >
            <Save className="w-4 h-4 mr-2" />
            {t.organizationDetailsPage.buttons.save[lang]}
          </Button>
        </div>
      </div>

      {/* Create Organization Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              {t.organizationDetailsPage.createTitle[lang]}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Placeholder Logo */}
          <div className="flex justify-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <Avatar className="w-20 h-20">
                      <AvatarFallback>
                        <Building2 className="h-10 w-10 text-gray-400" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {t.organizationDetailsPage.tooltips.logoPlaceholder[lang]}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Organization Form */}
          <div className="space-y-4 text-sm">
            <div>
              <label htmlFor="org-name" className="font-semibold">
                {t.organizationDetailsPage.fields.name[lang]}:
              </label>
              <Input
                id="org-name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="mt-2"
                placeholder={t.organizationDetailsPage.fields.name[lang]}
                required
                aria-required="true"
                aria-describedby="org-name-error"
              />
            </div>

            <div>
              <label htmlFor="org-description" className="font-semibold">
                {t.organizationDetailsPage.fields.description[lang]}:
              </label>
              <Textarea
                id="org-description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="mt-2"
                rows={3}
                placeholder={t.organizationDetailsPage.fields.description[lang]}
                aria-describedby="org-description-help"
              />
              <div id="org-description-help" className="sr-only">
                {
                  t.organizationDetailsPage.accessibility.labels
                    .descriptionHelp[lang]
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateOrganizationPage;
