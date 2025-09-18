import {
  Body,
  Controller,
  Post,
  BadRequestException,
  InternalServerErrorException,
  UseGuards,
} from "@nestjs/common";
import sanitizeHtml from "sanitize-html";
import { MailService } from "./mail.service";
import { SendEmailDto } from "./dto/mail.dto";
// import { RecaptchaGuard } from "../guards/recaptcha.guard";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { EmailProps } from "./interfaces/mail.interface";
import { SendMailDto } from "./dto/send-mail.dto";
import BookingConfirmationEmail from "src/emails/BookingConfirmationEmail";
import WelcomeEmail, { WelcomeEmailProps } from "src/emails/WelcomeEmail";
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
    const sanitizedMessage = sanitizeHtml(message, {
      allowedTags: [
        "b", "i", "em", "strong", "u", "p", "br", "span", "ul", "ol", "li", "a"
      ],
      allowedAttributes: {
        a: ["href", "target", "rel"],
        span: ["style"]
      },
      allowedSchemes: ["http", "https", "mailto"],
    });
    await this.mailService.sendMail({
      to,
      subject,
      html: sanitizedMessage,
    });
    return { success: true };
  }
  /*  @Post("send")
  // @UseGuards(RecaptchaGuard) // TODO: add recaptcha on frontend
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per 60 seconds
  async getMail(@Body() sendEmailDto: SendEmailDto) {
    const { to, subject, message, from } = sendEmailDto;

    if (!to || !subject || !message || !from) {
      throw new BadRequestException("Missing required fields.");
    }

    try {
      const result = await this.mailService.getMail(to, subject, message, from);
      return {
        success: true,
        message: "Email sent successfully",
        result,
      };
    } catch (error) {
      console.error("Email sending failed:", error);
      throw new InternalServerErrorException("Failed to send email.");
    }
  } */

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
