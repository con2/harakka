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
} from "@/components/ui/form"

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type ContactFormData = z.infer<typeof contactSchema>;

export const ContactForm = () => {
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
      // Send the data to backend to trigger the email sending
      const response = await axios.post("http://localhost:3000/mail/send", {
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
      if (response.data.accepted && response.data.accepted.length > 0) {
        toast.success("Message sent successfully!");
        form.reset();
      } else {
        toast.error("Failed to send message.");
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Server error.");
      } else {
        toast.error("Something went wrong.");
      }
    }
  };  

  return (
    <div className="max-w-md w-full mx-auto px-4 sm:px-6 md:px-8 m-10">
      <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-[400px] mx-auto">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} />
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
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Input placeholder="Subject of your message" {...field} />
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
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea placeholder="Your message..." rows={5} {...field} />
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
              {form.formState.isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ContactForm;