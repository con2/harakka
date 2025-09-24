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

const BookingUpdateEmail = ({
  name,
  pickupDate,
  // location,
  items,
  // today,
}: EmailProps) => (
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
        backgroundColor: "#C4C9CC",
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
              "url('https://larppikuvat.fi/media/previews/odysseus-2024-run-3-vssomnx7/lenne-eeronketo/day-1/odysseus-141.preview.avif')",
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
          Varaus päivitetty - Booking updated
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
          Varauksesi päivitettiin onnistuneesti. Varauksen vahvistaminen voi
          kestää muutaman päivän, koska meidän on varmistettava, että kaikki
          kohteet ovat saatavilla kyseisenä päivänä. Jos sinulla on kysyttävää,
          ota meihin yhteyttä.
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
          <strong>Noutopäivämääräsi pysyy samana:</strong> {pickupDate}
        </Text>

        <hr style={{ margin: "30px 0" }} />

        <Text style={{ fontSize: "16px", marginBottom: "10px" }}>
          Hello <strong>{name}</strong>,
        </Text>
        <Text style={{ fontSize: "16px", marginBottom: "10px" }}>
          Your booking was successfully updated. It is still pending and might
          take a few days to confirm the booking, since we have to make sure
          that all items are available on that date. If you have any questions,
          please contact us.
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
          <strong>Your Pick up date stays the same:</strong> {pickupDate}
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

export default BookingUpdateEmail;
