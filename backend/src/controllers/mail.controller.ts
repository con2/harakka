import {
  Body,
  Controller,
  Post,
  BadRequestException,
  InternalServerErrorException,
  UseGuards,
} from "@nestjs/common";
import { MailService } from "../services/mail.service";
import { SendEmailDto } from "src/dto/mail.dto";
// import { RecaptchaGuard } from "../guards/recaptcha.guard";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";

@Controller("mail")
@UseGuards(ThrottlerGuard)
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post("send")
  // @UseGuards(RecaptchaGuard) // TODO: add recaptcha on frontend
  @Throttle({default: {limit: 5, ttl: 60000 }}) // 5 requests per 60 seconds
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
  }
}