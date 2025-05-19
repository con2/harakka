import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { z } from "zod";
import { contactSchema } from "@/lib/validations/contactSchema";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

type ContactFormData = z.infer<typeof contactSchema>;

export const ContactForm = () => {
  // Translation
  const { lang } = useLanguage();

  // 1. define the form
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      email: "",
      subject: "",
      message: "",
    },
  });
  // 2. define a submit handler, type-safe and validated
  const onSubmit = async (values: ContactFormData) => {
    try {
      // Use the environment variable for API URL
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      // Send the data to backend to trigger the email sending
      const response = await axios.post(`${apiUrl}/mail/send`, {
        from: values.email, // The user's email will be the sender
        subject: values.subject, // Subject of the email
        message: `
          <p><strong>From:</strong> ${values.email}</p>
          <p><strong>Subject:</strong> ${values.subject}</p>
          <p>${values.message}</p>
        `, // The actual message body
        to: "illusia.rental.service@gmail.com", // Admin email where contact form is sent
      });

      // Handle success or failure
      if (response.data.success) {
        toast.success(t.contactForm.toast.success[lang]);
        form.reset();
      } else {
        toast.error(t.contactForm.toast.error[lang]);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            t.contactForm.toast.serverError[lang],
        );
      } else {
        toast.error(t.contactForm.toast.genericError[lang]);
      }
    }
  };

  return (
    <div className="max-w-md w-full mx-auto px-4 sm:px-6 md:px-8 m-10">
      <h2 className="text-2xl font-bold mb-4">{t.contactForm.title[lang]}</h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 max-w-[400px] mx-auto"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.contactForm.email.label[lang]}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t.contactForm.email.placeholder[lang]}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.contactForm.subject.label[lang]}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t.contactForm.subject.placeholder[lang]}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.contactForm.message.label[lang]}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t.contactForm.message.placeholder[lang]}
                    rows={5}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="text-center">
            <Button
              className="bg-secondary text-white border-1 border:secondary font-normal px-6 py-5 rounded-lg shadow hover:bg-white hover:text-secondary hover:border-secondary transition"
              type="submit"
              size={"sm"}
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? t.contactForm.button.sending[lang]
                : t.contactForm.button.send[lang]}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ContactForm;
