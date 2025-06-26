// src/services/mail.service.ts
import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { ReactElement } from "react";

interface SendMailOptions {
  to: string;
  subject: string;
  template?: ReactElement; // React component
  html?: string; // fallback for plain HTML
}

@Injectable()
export class MailService {
  private generateHtml(template?: ReactElement, html?: string) {
    if (template) {
      return render(template);
    }

    if (html) {
      return html;
    }

    throw new Error("No email template or HTML content provided.");
  }

  async sendMail({ to, subject, template, html }: SendMailOptions) {
    try {
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
      console.log("EMAIL:", process.env.LATEST_APP_PASSWORD);
      console.log("EMAIL:", process.env.EMAIL_FROM_NEW);

      const finalHtml = await this.generateHtml(template, html);

      const mailOptions = {
        from: `BookingApp <${process.env.EMAIL_FROM_2}>`,
        to,
        subject,
        html: finalHtml,
      };

      const result = await transport.sendMail(mailOptions);
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
}
