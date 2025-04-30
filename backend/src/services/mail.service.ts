import { Injectable } from "@nestjs/common";
import { Resend } from "resend";

@Injectable()
export class MailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: "onboarding@resend.dev",
        to,
        subject,
        html,
      });

      if (error) {
        console.error("Mail send error:", error);
        throw new Error("Failed to send email");
      }

      return data;
    } catch (err) {
      console.error("Unexpected error sending mail:", err);
      throw err;
    }
  }
}
