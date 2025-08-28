export class SendMailDto<T> {
  email: string;
  subject: string;
  data: T;
  type: "bookingConfirmation" | "welcome" | "bookingCancelled";
  // Add other email types as needed
}
