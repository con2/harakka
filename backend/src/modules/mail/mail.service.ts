// src/services/mail.service.ts
import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { google } from "googleapis";
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
  private oAuth2Client;

  constructor() {
    this.oAuth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground",
    );

    this.oAuth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });
  }

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

      const finalHtml = await this.generateHtml(template, html);

      const mailOptions = {
        from: `BookingApp <${process.env.EMAIL_FROM}>`,
        to,
        subject,
        html: finalHtml,
      };

      const result = await transport.sendMail(mailOptions);
      return result;
    } catch (error) {
      console.error("Failed to send email:", error);

      if (process.env.NODE_ENV === "production") {
        return { success: false, error: error.message };
      } else {
        throw new Error("Mail sending failed: " + error.message);
      }
    }
  }

  // method to get emails from Contact Form
  async getMail(to: string, subject: string, html: string, from: string) {
    try {
      console.log("Email configuration:", {
        clientId: process.env.GMAIL_CLIENT_ID ? "Configured" : "Missing",
        clientSecret: process.env.GMAIL_CLIENT_SECRET
          ? "Configured"
          : "Missing",
        refreshToken: process.env.GMAIL_REFRESH_TOKEN
          ? "Configured"
          : "Missing",
        emailFrom: process.env.EMAIL_FROM,
      });

      const accessToken = await this.oAuth2Client.getAccessToken();

      const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: process.env.EMAIL_FROM,
          clientId: process.env.GMAIL_CLIENT_ID,
          clientSecret: process.env.GMAIL_CLIENT_SECRET,
          refreshToken: process.env.GMAIL_REFRESH_TOKEN,
          accessToken: accessToken.token,
        },
      });
      // transport object
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
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      // Don't throw in production environments
      if (process.env.NODE_ENV === "production") {
        return { success: false, error: error.message };
      } else {
        throw new Error("Mail sending failed: " + error.message);
      }
    }
  }
}
