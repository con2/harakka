import { Injectable } from "@nestjs/common";
import { render } from "@react-email/render";
import * as nodemailer from "nodemailer";

interface SendMailConfiguration {
  email: string;
  subject: string;
  text?: string;
  template: any;
}

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport(
      {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: "illusia.rantal.service@gmail.com",
          pass: "!2bGVd%e$Bto71",
        },
      },
      {
        from: {
          name: "NestJs + React Emails Test App",
          address: "Test App",
        },
      },
    );
  }

  private generateEmail = (template) => {
    return render(template);
  };

  async sendMail({ email, subject, template }: SendMailConfiguration) {
    const html = this.generateEmail(template);

    await this.transporter.sendMail({
      to: email,
      subject,
      html,
    });
  }
}
