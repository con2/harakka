export type MailEvent =
  | "user.welcome"
  | "booking.created"
  | "booking.waiting-for-action"
  | "booking.confirmed"
  | "booking.cancelled"
  | "booking.rejected"
  | "booking.updated"
  | "new.invoice"
  | "payment.reminder"
  | "payment.received"
  | "items.return.reminder"
  | "items.returned";

export interface MailTemplateConfig {
  subject: (data: any) => string;
  template: (data: any) => string; // is going to be filled with `render()` later
}
