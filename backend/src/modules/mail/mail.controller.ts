import {
  Body,
  Controller,
  Post,
  BadRequestException,
  InternalServerErrorException,
  UseGuards,
} from "@nestjs/common";
import { MailService } from "./mail.service";
import { SendEmailDto } from "./dto/mail.dto";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { EmailProps } from "./interfaces/mail.interface";
import { SendMailDto } from "./dto/send-mail.dto";
import BookingConfirmationEmail from "src/emails/BookingConfirmationEmail";
import WelcomeEmail, { WelcomeEmailProps } from "src/emails/WelcomeEmail";
import * as React from "react";
import { sanitizeEmailHtml, sanitizeSubject } from "@src/utils/sanitize.util";

@Controller("mail")
@UseGuards(ThrottlerGuard)
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post("send")
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async sendPlainHtml(@Body() dto: SendEmailDto) {
    const { to, subject, message, from } = dto;
    if (!to || !subject || !message || !from) {
      throw new BadRequestException("Missing required fields.");
    }
    const safeSubject = sanitizeSubject(subject);
    const safeHtml = sanitizeEmailHtml(message);

    await this.mailService.sendMail({
      to,
      subject: safeSubject,
      html: safeHtml, // sanitized HTML from the contact form
    });
    return { success: true };
  }

  @Post("send-email")
  async sendMail(@Body() sendMailDto: SendMailDto<unknown>): Promise<string> {
    try {
      const { email, subject, type, data } = sendMailDto;

      let templateHtml: React.ReactElement;

      if (type === "bookingConfirmation") {
        templateHtml = BookingConfirmationEmail(data as EmailProps);
      } else if (type === "welcome") {
        templateHtml = WelcomeEmail(data as WelcomeEmailProps);
      } else {
        throw new BadRequestException("Unknown email type");
      }

      await this.mailService.sendMail({
        to: email,
        subject: sanitizeSubject(subject),
        template: templateHtml,
      });

      return "Email sent successfully";
    } catch (error) {
      console.error("Failed to send email:", error);

      // Optional: fall back to NestJS Exception
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        "This Error: Failed to send email",
      );
    }
  }
}
