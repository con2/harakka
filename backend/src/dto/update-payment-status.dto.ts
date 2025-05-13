import { IsIn, IsString } from "class-validator";

export class UpdatePaymentStatusDto {
  @IsString()
  orderId: string;

  @IsIn(["invoice-sent", "paid", "payment-rejected"])
  status: "invoice-sent" | "paid" | "payment-rejected";
}
