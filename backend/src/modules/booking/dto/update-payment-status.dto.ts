import { IsIn, IsString } from "class-validator";

export class UpdatePaymentStatusDto {
  @IsString()
  bookingId: string;

  @IsIn(["invoice-sent", "paid", "payment-rejected"])
  status: "invoice-sent" | "paid" | "payment-rejected";
}
