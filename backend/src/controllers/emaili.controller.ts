import { SendMailDto } from "../dto/send-mail.dto";
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from "@nestjs/common";
import { MailService } from "../services/mail.service";
import BookingConfirmationEmail from "../emails/BookingConfirmationEmail";
import WelcomeEmail from "../emails/WelcomeEmail";
import { BookingConfirmationEmailProps } from "src/interfaces/confirmation-mail.interface";
import { ReactElement } from "react";

@Controller()
export class AppController {
  constructor(private readonly mailService: MailService) {}

  @Post("send-email")
  async sendMail(@Body() sendMailDto: SendMailDto): Promise<string> {
    const { email, subject, type, data } = sendMailDto;

    let templateHtml: ReactElement;

    if (type === "bookingConfirmation") {
      templateHtml = BookingConfirmationEmail(
        data as BookingConfirmationEmailProps,
      );
    } else if (type === "welcome") {
      templateHtml = WelcomeEmail(data);
    } else {
      throw new BadRequestException("Unknown email type"); // BEIDE MAILCONTROLLER VERBINDEN!!!
    }

    await this.mailService.sendMail({
      to: email,
      subject,
      template: templateHtml,
    });

    return "Email sent successfully";
  }
}
