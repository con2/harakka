import { SendMailDto } from "../dto/send-mail.dto";
import { Body, Controller, Get, Post } from "@nestjs/common";
import { MailService } from "../services/mail.service";
import BookingConfirmationEmail from "../emails/BookingConfirmationEmail";
import WelcomeEmail from "../emails/WelcomeEmail";

@Controller()
export class AppController {
  constructor(private readonly mailService: MailService) {}

  @Post("send-email") // TODO: send-email dieser endpoint soll für alle emails verwendet werden.
  async sendMail(@Body() sendMailDto: SendMailDto): Promise<string> {
    await this.mailService.sendMail({
      to: sendMailDto.email,
      subject: sendMailDto.subject,
      template: BookingConfirmationEmail({
        name: "Test User",
        date: "01.06.2025",
        location: "Berlin",
        items: [],
      }),
    });

    return "Email sent successfully";
  }
}
