import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { google } from "googleapis";

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

  async sendMail(to: string, subject: string, html: string) {
    try {
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

      const mailOptions = {
        from: `BookingApp <${process.env.EMAIL_FROM}>`,
        to,
        subject,
        html,
      };

      const result = await transport.sendMail(mailOptions);
      return result;
    } catch (error) {
      console.error("Failed to send email:", error);
      throw new Error("Mail sending failed: " + error.message);
    }
  }
}
