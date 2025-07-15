export class SendMailDto {
  email: string;
  subject: string;
  data: any;
  type: "bookingConfirmation" | "welcome" | "bookingCancelled";
  // Add other email types as needed
}
