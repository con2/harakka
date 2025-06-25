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
// import { RecaptchaGuard } from "../guards/recaptcha.guard";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { EmailProps } from "./interfaces/mail.interface";
import { SendMailDto } from "./dto/send-mail.dto";
import BookingConfirmationEmail from "src/emails/BookingConfirmationEmail";
import WelcomeEmail from "src/emails/WelcomeEmail";
import * as React from "react";

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
    await this.mailService.sendMail({
      to,
      subject,
      html: message, // raw HTML from the contact form
    });
    return { success: true };
  }


  @Post("send-email")
  async sendMail(@Body() sendMailDto: SendMailDto): Promise<string> {
    try {
      const { email, subject, type, data } = sendMailDto;

      let templateHtml: React.ReactElement;

      if (type === "bookingConfirmation") {
        templateHtml = BookingConfirmationEmail(data as EmailProps);
      } else if (type === "welcome") {
        templateHtml = WelcomeEmail(data);
      } else {
        throw new BadRequestException("Unknown email type");
      }

      await this.mailService.sendMail({
        to: email,
        subject,
        template: templateHtml,
      });

      return "Email sent successfully";
    } catch (error) {
      console.error("Failed to send email:", error);

      // Optional: falls NestJS Exception
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        "This Error: Failed to send email",
      );
    }
  }
}
