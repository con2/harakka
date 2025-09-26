import {
  Body,
  Controller,
  Post,
  BadRequestException,
  UseGuards,
} from "@nestjs/common";
import { MailService } from "./mail.service";
import { SendEmailDto } from "./dto/mail.dto";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { sanitizeEmailHtml, sanitizeSubject } from "../../utils/sanitize.util";

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
}
