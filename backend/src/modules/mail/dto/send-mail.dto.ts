import { EmailProps } from "../interfaces/mail.interface";

export class SendMailDto {
  email: string;
  subject: string;
  data: EmailProps;
  type: "bookingConfirmation" | "welcome" | "bookingCancelled";
  // Add other email types as needed
}
