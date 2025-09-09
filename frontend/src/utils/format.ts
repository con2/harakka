import { BookingStatus } from "@/types";

export function formatBookingStatus(status: BookingStatus) {
  return status?.replace("_", " ");
}
