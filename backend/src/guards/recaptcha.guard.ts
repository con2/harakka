/* import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from "@nestjs/common";
import axios from "axios";

@Injectable()
export class RecaptchaGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.body?.recaptchaToken;

    if (!token) {
      throw new BadRequestException("Missing reCAPTCHA token.");
    }

    try {
      const res = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify`,
        null,
        {
          params: {
            secret: process.env.RECAPTCHA_SECRET,
            response: token,
          },
        }
      );

      const success = res.data.success;
      const score = res.data.score ?? 0;

      if (!success || score < 0.5) {
        throw new BadRequestException("Failed reCAPTCHA verification.");
      }

      return true;
    } catch (error) {
      console.error("reCAPTCHA error:", error);
      throw new BadRequestException("reCAPTCHA validation failed.");
    }
  }
} */
