// src/services/mail.service.ts
import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { ReactElement } from "react";
import {
  BookingMailType,
  BookingMailParams,
} from "./interfaces/mail.interface";
import { BookingEmailAssembler } from "./booking-email-assembler";
import BookingCreationEmail from "./../../emails/BookingCreationEmail";
import BookingConfirmationEmail from "./../../emails/BookingConfirmationEmail";
import BookingCancelledEmail from "./../../emails/BookingCancelledEmail";
import BookingUpdateEmail from "./../../emails/BookingUpdateEmail";
import BookingRejectionEmail from "./../../emails/BookingRejectionEmail";
import BookingDeleteMail from "./../../emails/BookingDeleteMail";
import ItemsReturnedMail from "./../../emails/ItemsReturned";
import ItemsPickedUpMail from "./../../emails/ItemsPickedUp";

interface SendMailOptions {
  to: string;
  subject: string;
  template?: ReactElement; // React component
  html?: string; // fallback for plain HTML
  bcc?: string | string[]; // optional blind‑copy (e.g. admins)
}

@Injectable()
export class MailService {
  constructor(private readonly assembler: BookingEmailAssembler) {}

  private generateHtml(template?: ReactElement, html?: string) {
    if (template) {
      return render(template);
    }

    if (html) {
      return html;
    }

    throw new Error("No email template or HTML content provided.");
  }

  async sendMail({ to, subject, template, html, bcc }: SendMailOptions) {
    try {
      // ==== DEBUG LOGS (remove in production) ====
      console.log("[MailService] ENV EMAIL_FROM_2 =", process.env.EMAIL_FROM_2);
      console.log("[MailService] Sending to:", to, " | subject:", subject);
      // ===========================================
      /*    const accessToken = await this.oAuth2Client.getAccessToken() */

      const transport = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_FROM_2, // illusia.info.ry@gmail.com
          pass: process.env.GMAIL_APP_PASSWORD, // ← App Password
        },
      });

      const finalHtml = await this.generateHtml(template, html);

      const mailOptions: Record<string, unknown> = {
        from: `BookingApp <${process.env.EMAIL_FROM_2}>`,
        to,
        subject,
        html: finalHtml,
      };
      if (bcc) mailOptions.bcc = bcc;

      const result = await transport.sendMail(mailOptions);
      console.log("[MailService] SMTP sendMail result:", result);
      return result;
    } catch (error) {
      console.error("Failed to send email:", error);

      if (process.env.NODE_ENV === "production") {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      } else {
        throw new Error(
          "Mail sending failed: " +
            (error instanceof Error ? error.message : "Unknown error"),
        );
      }
    }
  }

  // method to get emails from Contact Form
  async getMail(to: string, subject: string, html: string, from: string) {
    try {
      const transport = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_FROM_2, // Gmail address used with App Password
          pass: process.env.GMAIL_APP_PASSWORD, // App Password
        },
      });

      const mailObject = {
        from,
        to,
        subject,
        html,
      };

      const result = await transport.sendMail(mailObject);
      return result;
    } catch (error) {
      console.error("Failed to send email:", error);

      // Don't throw in production environments
      if (process.env.NODE_ENV === "production") {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      } else {
        throw new Error(
          "Mail sending failed: " +
            (error instanceof Error ? error.message : "Unknown error"),
        );
      }
    }
  }

  private pickTemplate(type: BookingMailType, payload: any) {
    switch (type) {
      case BookingMailType.Creation:
        return BookingCreationEmail(payload);
      case BookingMailType.Confirmation:
        return BookingConfirmationEmail(payload);
      case BookingMailType.Update:
        return BookingUpdateEmail(payload);
      case BookingMailType.Cancellation:
        return BookingCancelledEmail(payload);
      case BookingMailType.Rejection:
        return BookingRejectionEmail(payload);
      case BookingMailType.Deletion:
        return BookingDeleteMail(payload);
      case BookingMailType.ItemsReturned:
        return ItemsReturnedMail(payload);
      case BookingMailType.ItemsPickedUp:
        return ItemsPickedUpMail(payload);
      default:
        throw new Error(`Unknown BookingMailType: ${type}`);
    }
  }

  private subjectLine(type: BookingMailType): string {
    switch (type) {
      case BookingMailType.Creation:
        return "Varaus vastaanotettu - Booking request received";
      case BookingMailType.Confirmation:
        return "Varaus vahvistettu - Booking confirmed";
      case BookingMailType.Update:
        return "Varaus päivitetty - Booking updated";
      case BookingMailType.Cancellation:
        return "Varaus peruttu - Booking cancelled";
      case BookingMailType.Rejection:
        return "Varaus hylätty - Booking rejected";
      case BookingMailType.Deletion:
        return "Varaus poistettu - Booking deleted";
      case BookingMailType.ItemsReturned:
        return "Palautetut tuotteet - Items returned";
      case BookingMailType.ItemsPickedUp:
        return "Noudetut tuotteet - Items picked up";
      default:
        return "Booking notification";
    }
  }

  public async sendBookingMail(
    type: BookingMailType,
    params: BookingMailParams,
  ) {
    console.log("[MailService] sendBookingMail START ⇒", type, params);
    const payload = await this.assembler.buildPayload(params.orderId);
    const template = this.pickTemplate(type, payload);
    // For cancellation emails, the template expects orderId, startDate, and recipientRole
    let finalTemplate = template;
    if (type === BookingMailType.Cancellation) {
      finalTemplate = BookingCancelledEmail({
        orderId: params.orderId,
        startDate: payload.pickupDate,
        items: payload.items,
        recipientRole: "user", // identical copy goes to admin via Bcc
      });
    }
    const subject = this.subjectLine(type);

    await this.sendMail({
      to: payload.recipient,
      bcc: process.env.BOOKING_ADMIN_EMAIL ?? process.env.EMAIL_FROM_2, // Send to admin as well
      subject,
      template: finalTemplate,
    });
    console.log("[MailService] sendBookingMail DONE for order", params.orderId);
  }
}
