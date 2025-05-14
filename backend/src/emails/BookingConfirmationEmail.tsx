import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Section,
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
    <Head>
      <link
        href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&family=Roboto+Slab:wght@400;700&display=swap"
        rel="stylesheet"
      />
    </Head>
    <Body
      style={{
        fontFamily: "'Lato', sans-serif",
        backgroundColor: "#f9f9f9",
        margin: 0,
        padding: "20px",
        color: "#252525", // ersetzt: oklch(0.145 0 0)
      }}
    >
      <Container
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          padding: "30px",
          maxWidth: "600px",
          margin: "0 auto",
          border: "1px solid #ebebeb", // ersetzt: oklch(0.922 0 0)
        }}
      >
        {/* Logo entfernt */}

        <Text
          style={{
            fontFamily: "'Roboto Slab', serif",
            fontSize: "24px",
            fontWeight: 700,
            color: "#9537c7", // secondary
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          Buchungsbestätigung
        </Text>

        <Text style={{ fontSize: "16px", marginBottom: "10px" }}>
          Hallo <strong>{name}</strong>,
        </Text>

        <Text style={{ fontSize: "16px", marginBottom: "20px" }}>
          Deine Buchung wurde erfolgreich bestätigt.
        </Text>

        <Text style={{ fontWeight: "bold", marginBottom: "8px" }}>
          Bestellte Artikel:
        </Text>
        <ul style={{ paddingLeft: "20px", marginBottom: "20px" }}>
          {items.map((item, index) => (
            <li key={index} style={{ marginBottom: "4px" }}>
              Artikel-ID: <strong>{item.item_id}</strong>, Menge:{" "}
              <strong>{item.quantity}</strong>
            </li>
          ))}
        </ul>

        <Text style={{ marginBottom: "20px" }}>
          <strong>Datum:</strong> {date}
          <br />
          <strong>Ort:</strong> {location}
        </Text>

        <Text style={{ fontSize: "16px", marginTop: "20px" }}>
          Vielen Dank für deine Buchung.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default BookingConfirmationEmail;
