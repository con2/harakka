import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Preview,
} from "@react-email/components";

interface BookingConfirmationEmailProps {
  name: string;
  date: string;
  location: string;
  items: {
    item_id: string;
    quantity: number;
  }[];
}

const BookingConfirmationEmail = ({
  name,
  date,
  location,
  items,
}: BookingConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Buchungsbestätigung für {name}</Preview>
    <Body
      style={{
        fontFamily: "Helvetica, Arial, sans-serif",
        backgroundColor: "#f9f9f9",
      }}
    >
      <Container>
        <Text>Hallo {name},</Text>
        <Text>Deine Buchung wurde erfolgreich bestätigt! mit react email</Text>
        <Text>
          <strong>Bestellte Artikel:</strong>
        </Text>
        <ul>
          {items.map((item, index) => (
            <li key={index}>
              Artikel-ID: {item.item_id}, Menge: {item.quantity}
            </li>
          ))}
        </ul>

        <Text>
          <strong>Datum:</strong> {date}
          <br />
          <strong>Ort:</strong> {location}
        </Text>
        <Text>Vielen Dank für deine Buchung.</Text>
      </Container>
    </Body>
  </Html>
);

export default BookingConfirmationEmail;
