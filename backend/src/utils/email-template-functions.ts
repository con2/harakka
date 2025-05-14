import { SupabaseService } from "../services/supabase.service";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import { BookingConfirmationEmailProps } from "../interfaces/confirmation-mail.interface";

// return-format for mails

export class EmailTemplateHelper {
  constructor(private supabase: SupabaseService) {}

  async prepareDataForConfirmationMail(
    orderId: string,
  ): Promise<BookingConfirmationEmailProps> {
    // Query logic
    const today = dayjs().format("DD.MM.YYYY");

    return {
      name: "Vladimir Beliakov",
      email: "ermegilius@gmail.com",
      pickupDate: dayjs().format("DD.MM.YYYY"),
      today: dayjs().format("DD.MM.YYYY"),
      location: "Helsinki",
      items: [
        {
          item_id: "abc123",
          quantity: 2,
          translations: {
            fi: {
              name: "string",
            },
            en: {
              name: "string",
            },
          },
        },
      ],
    };
  }

  // more methods:
  // async prepareDataForCancellationMail
  // async prepareDataForWelcomeMail
}
