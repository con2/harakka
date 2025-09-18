import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Section,
} from "@react-email/components";
import { EmailProps } from "src/modules/mail/interfaces/mail.interface";

const BookingConfirmationEmail = ({
  name,
  pickupDate,
  location,
  items,
}: EmailProps): React.ReactElement => (
  <Html>
    <Head>
      <link
        href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&family=Roboto+Slab:wght@400;700&display=swap"
        rel="stylesheet"
      />
    </Head>
    <Body
      style={{
        fontFamily: "'Lato', Arial, sans-serif",
        // backgroundColor: "#2f5D9E",
        backgroundColor: "#d0c1d8",
        margin: 0,
        padding: "40px 20px",
        color: "#333333",
      }}
    >
      <Container
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          padding: "40px 30px",
          maxWidth: "600px",
          margin: "0 auto",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Section
          style={{
            backgroundImage:
              "url('https://i0.wp.com/nordiclarp.org/wp-content/uploads/2023/11/Odysseus-warp-core-scaled.jpeg?resize=900%2C1200&ssl=1')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "250px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        ></Section>

        <Text
          style={{
            fontFamily: "'Roboto'",
            fontSize: "24px",
            fontWeight: 400,
            color: "#2f5D9E",
            textAlign: "center",
            marginBottom: "24px",
          }}
        >
          Varausvahvistus - Booking confirmation
        </Text>

        <Text
          style={{
            fontSize: "14px",
            textAlign: "center",
            marginBottom: "24px",
            fontStyle: "italic",
          }}
        >
          English below
        </Text>

        <Text style={{ fontSize: "16px", marginBottom: "10px" }}>
          Hei <strong>{name}</strong>,
        </Text>
        <Text style={{ fontSize: "16px", marginBottom: "10px" }}>
          Vahvistamme varauksesi. Tervetuloa noutamaan varauksesi noutopäivänä.
          Ota yhteyttä meihin saadaksesi tarkan ajan kyseisenä päivänä.
        </Text>

        <Text style={{ fontWeight: "bold", marginBottom: "8px" }}>
          Varaustiedot:
        </Text>
        <ul style={{ paddingLeft: "20px", marginBottom: "20px" }}>
          {items.map((item, index) => (
            <li key={index} style={{ marginBottom: "4px", fontSize: "16px" }}>
              {item.translations.fi.name} (x{item.quantity})
            </li>
          ))}
        </ul>

        <Text style={{ fontSize: "16px", marginBottom: "20px" }}>
          <strong>Noutopäivä:</strong> {pickupDate}
          <br />
          <strong>Noutopaikka:</strong> {location}
          <br />
        </Text>

        <hr style={{ margin: "30px 0" }} />

        <Text style={{ fontSize: "16px", marginBottom: "10px" }}>
          Hello <strong>{name}</strong>,
        </Text>
        <Text style={{ fontSize: "16px", marginBottom: "10px" }}>
          Your booking has been confirmed. You're welcome to pick up your items
          on the pickup date. Please contact us for the exact time on that day.
        </Text>

        <Text style={{ fontWeight: "bold", marginBottom: "8px" }}>
          Booking details:
        </Text>
        <ul style={{ paddingLeft: "20px", marginBottom: "20px" }}>
          {items.map((item, index) => (
            <li key={index} style={{ marginBottom: "4px", fontSize: "16px" }}>
              {item.translations.en.name} (x{item.quantity})
            </li>
          ))}
        </ul>

        <Text style={{ fontSize: "16px", marginBottom: "20px" }}>
          <strong>Pickup Date:</strong> {pickupDate}
          <br />
          <strong>Pickup Location:</strong> {location}
          <br />
        </Text>

        <Section style={{ textAlign: "center", marginTop: "30px" }}>
          <a
            href="http://localhost:5180/profile?tab=bookings" // TODO: replace with actual link
            style={{
              backgroundColor: "#2f5D9E",
              color: "#ffffff",
              padding: "12px 24px",
              borderRadius: "4px",
              textDecoration: "none",
              fontWeight: "bold",
              display: "inline-block",
              fontSize: "16px",
            }}
          >
            View your Booking
          </a>
        </Section>
        <Text style={{ fontSize: "14px", color: "#666666", marginTop: "30px" }}>
          If you have any questions, contact us by answering this mail or use
          the{" "}
          <a
            href="http://localhost:5180/contact-us" // TODO: replace with actual link
            style={{ color: "#2f5D9E" }}
          >
            {" "}
            contact form{" "}
          </a>
          in our website.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default BookingConfirmationEmail;
