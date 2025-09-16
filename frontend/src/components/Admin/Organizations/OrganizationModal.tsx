import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { OrganizationDetails } from "@/types/organization";
import { useEffect } from "react";
import OrganizationLogoUploader from "./OrganizationLogoUploader";

// Define the form values type for organization
export type OrganizationFormValues = {
  name: string;
  description?: string;
  slug?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onSubmit?: (data: OrganizationFormValues) => void;
  mode: "view" | "edit" | "create";
  organization?: OrganizationDetails | null;
  isLoading?: boolean;
};

export default function OrganizationModal({
  open,
  onOpenChange,
  onSubmit,
  mode,
  organization,
}: Props) {
  const { lang } = useLanguage();

  const isViewMode = mode === "view";

  const schema = z.object({
    name: z.string().min(1, t.organizations.validation.nameRequired[lang]),
    description: z.string().optional(),
    slug: z.string().optional(),
  });

  // schema for organization form
  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: organization?.name || "",
      description: organization?.description || "",
      slug: organization?.slug || "",
    },
  });

  useEffect(() => {
    form.reset({
      name: organization?.name || "",
      description: organization?.description || "",
      slug: organization?.slug || "",
    });
  }, [organization, form]);

  // View-only modal
  if (isViewMode) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{organization?.name}</DialogTitle>
          </DialogHeader>

          {/* Add logo uploader */}
          <div className="flex flex-col items-center mb-4">
            <OrganizationLogoUploader
              currentImage={organization?.logo_picture_url}
              organizationId={organization?.id || ""}
            />
          </div>

          <div className="space-y-2 text-sm">
            <p>
              <strong>{t.organizations.modal.labels.description[lang]}:</strong>{" "}
              {organization?.description || "—"}
            </p>
            <p>
              <strong>{t.organizations.modal.labels.slug[lang]}:</strong>{" "}
              {organization?.slug || "—"}
            </p>
            <p>
              <strong>{t.organizations.modal.labels.active[lang]}:</strong>{" "}
              {organization?.is_active
                ? t.organizations.values.isActive.yes[lang]
                : t.organizations.values.isActive.no[lang]}
            </p>
            <p>
              <strong>{t.organizations.modal.labels.createdAt[lang]}:</strong>{" "}
              {organization?.created_at
                ? new Date(organization.created_at).toLocaleString()
                : "—"}
            </p>
            <p>
              <strong>{t.organizations.modal.labels.createdBy[lang]}:</strong>{" "}
              {organization?.created_by || "—"}
            </p>
            <p>
              <strong>{t.organizations.modal.labels.updatedAt[lang]}:</strong>{" "}
              {organization?.updated_at
                ? new Date(organization.updated_at).toLocaleString()
                : "—"}
            </p>
            <p>
              <strong>{t.organizations.modal.labels.updatedBy[lang]}:</strong>{" "}
              {organization?.updated_by || "—"}
            </p>
          </div>
          <DialogFooter className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>
              {t.organizations.modal.buttons.close[lang]}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Create/Edit form
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.organizations.modal.title[lang]}</DialogTitle>
        </DialogHeader>

        {/* Add logo uploader for edit mode only */}
        {mode === "edit" && organization?.id && (
          <div className="flex flex-col items-center mb-4">
            <OrganizationLogoUploader
              currentImage={organization?.logo_picture_url}
              organizationId={organization.id}
            />
          </div>
        )}

        <Form {...form} key={organization?.id ?? "new"}>
          <form
            onSubmit={form.handleSubmit((data) => {
              onSubmit?.(data);
              /*  form.reset(); */
            })}
            className="space-y-4"
          >
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.organizations.modal.labels.name[lang]}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        t.organizations.modal.placeholders.name[lang]
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.organizations.modal.labels.description[lang]}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        t.organizations.modal.placeholders.description[lang]
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Slug */}
            {mode === "edit" && (
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t.organizations.modal.labels.slug[lang]}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="my-org-slug" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Actions & Footer*/}
            <DialogFooter className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
              >
                {t.organizations.modal.buttons.cancel[lang]}
              </Button>
              <Button type="submit" variant="outline">
                {t.organizations.modal.buttons.save[lang]}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
