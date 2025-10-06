# Email System

## Overview

React Email templates with automated SMTP sending for all booking lifecycle events.
The Emails were setup with:

- gmail
- nodemailer
- react.mails

## Email Templates

Located in `src/emails/`:

| Template                       | Trigger                 | Recipient    |
| ------------------------------ | ----------------------- | ------------ |
| `BookingCreationEmail.tsx`     | New booking created     | User         |
| `BookingConfirmationEmail.tsx` | Admin confirms booking  | User         |
| `BookingRejectionEmail.tsx`    | Admin rejects booking   | User         |
| `BookingCancelledEmail.tsx`    | Booking cancelled       | User + Admin |
| `BookingUpdateEmail.tsx`       | Booking details changed | User         |
| `BookingReminderEmail.tsx`     | Pickup/return reminder  | User         |
| `BookingDeleteMail.tsx`        | Booking deleted         | Admin        |
| `ItemsPickedUp.tsx`            | Items picked up         | User + Admin |
| `ItemsReturned.tsx`            | Items returned          | User + Admin |
| `WelcomeEmail.tsx`             | New user registered     | User         |

## Email Service API

```typescript
// Located in src/modules/mail/mail.service.ts
class MailService {
  async sendBookingCreationEmail(booking: BookingWithDetails): Promise<void>;
  async sendBookingConfirmationEmail(
    booking: BookingWithDetails,
  ): Promise<void>;
  async sendBookingRejectionEmail(
    booking: BookingWithDetails,
    reason: string,
  ): Promise<void>;
  // ... other methods
}
```

## Development

### Preview Endpoints

```bash
# Preview email templates in browser
GET /mail/preview/booking-creation
GET /mail/preview/booking-confirmation
GET /mail/preview/welcome
```

### Environment Variables

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Links

This is the setup page for oAuth playground:
https://developers.google.com/oauthplayground/?code=4/0Ab_5qllgXapuxIEsUQnqhQjwMt4XUpzy7E9GUrHnVQnxgc6uKMBfa4TXbEQqn3JVItGGMQ&scope=https://mail.google.com/

There is the client stored:
https://console.cloud.google.com/auth/clients?authuser=2&inv=1&invt=AbwmXQ&project=bookingappmailing

you should be logged in with the email to see the details

## Other Emails

### Supabase Authentication Emails

The following authentication-related emails are handled directly by Supabase's built-in SMTP service:

- **Email Confirmation** - New user account verification
- **User Invitations** - Organization member invitations
- **Magic Link Authentication** - Passwordless login
- **Email Address Change** - Account email update verification
- **Password Reset** - Forgot password functionality
- **Re-authentication** - Security verification for sensitive operations

### Configuration

Authentication email templates and SMTP settings are managed through the Supabase Dashboard:

![Supabase Email Settings](../../../assets/screenshots/supabase-email-settings.png)

_Navigate to Authentication → Email Templates to customize templates_

For detailed configuration instructions, refer to the [Supabase Email Documentation](https://supabase.com/docs/guides/auth/auth-email-templates).
