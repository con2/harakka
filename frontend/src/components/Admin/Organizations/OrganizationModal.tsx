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

type Props = {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onSubmit?: (data: OrganizationFormValues) => void;
  mode: "view" | "edit" | "create";
  organization?: OrganizationDetails | null;
  isLoading?: boolean;
};

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  slug: z.string().optional(),
});

export type OrganizationFormValues = z.infer<typeof schema>;

export default function OrganizationModal({
  open,
  onOpenChange,
  onSubmit,
  mode,
  organization,
}: Props) {
  const { lang } = useLanguage();

  const isViewMode = mode === "view";

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
          <div className="space-y-2 text-sm">
            <p>
              <strong>Beschreibung:</strong> {organization?.description || "—"}
            </p>
            <p>
              <strong>Slug:</strong> {organization?.slug || "—"}
            </p>
            <p>
              <strong>Active:</strong>{" "}
              {organization?.is_active
                ? t.organizationList.values.isActive.yes[lang]
                : t.organizationList.values.isActive.no[lang]}
            </p>
            <p>
              <strong>
                {t.organizationList.modal.labels.createdAt[lang]}:
              </strong>{" "}
              {organization?.created_at
                ? new Date(organization.created_at).toLocaleString()
                : "—"}
            </p>
            <p>
              <strong>
                {t.organizationList.modal.labels.createdBy[lang]}:
              </strong>{" "}
              {organization?.created_by || "—"}
            </p>
            <p>
              <strong>
                {t.organizationList.modal.labels.updatedAt[lang]}:
              </strong>{" "}
              {organization?.updated_at
                ? new Date(organization.updated_at).toLocaleString()
                : "—"}
            </p>
            <p>
              <strong>
                {t.organizationList.modal.labels.updatedBy[lang]}:
              </strong>{" "}
              {organization?.updated_by || "—"}
            </p>
          </div>
          <DialogFooter className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>
              <strong>{t.organizationList.modal.buttons.close[lang]}:</strong>
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
          <DialogTitle>{t.organizationList.modal.title[lang]}</DialogTitle>
        </DialogHeader>

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
                    {t.organizationList.modal.labels.name[lang]}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        t.organizationList.modal.placeholders.name[lang]
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
                    {t.organizationList.modal.labels.description[lang]}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        t.organizationList.modal.placeholders.description[lang]
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
                      {t.organizationList.modal.labels.slug[lang]}
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
                {t.common.cancel[lang]}
              </Button>
              <Button type="submit">{t.common.save[lang]}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
