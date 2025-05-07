import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
} from "@react-email/components";
import type { UserRole } from "../types/user";
import type { BookingItem } from "../types/order";

type BookingCancelledEmailProps = {
  orderId: string;
  items: BookingItem[];
  recipientRole: Extract<UserRole, "user" | "admin" | "superVera">;
};

export const BookingCancelledEmail = ({
  orderId,
  items,
  recipientRole,
}: BookingCancelledEmailProps) => {
  const isAdmin = recipientRole === "admin" || recipientRole === "superVera";

  return (
    <Html>
      <Head />
      <Body
        style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#fff" }}
      >
        <Container>
          <Heading as="h1">
            {isAdmin ? "Booking Cancelled" : "Your Booking Was Cancelled"}
          </Heading>
          <Text>
            {isAdmin
              ? `A booking with order number ${orderId} was cancelled.`
              : `Your booking with order number ${orderId} has been cancelled.`}
          </Text>

          <Text>Details:</Text>
          <ul>
            {items.map((item, index) => (
              <li key={index}>
                Item: {item.item_id}, Quantity: {item.quantity}, Dates:{" "}
                {item.start_date} to {item.end_date}
              </li>
            ))}
          </ul>

          {!isAdmin && (
            <Text>
              If this was unintended, you can restore it in your booking
              history.
            </Text>
          )}
        </Container>
      </Body>
    </Html>
  );
};
