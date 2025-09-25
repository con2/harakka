import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Section,
  Img,
} from "@react-email/components";
import { EmailProps } from "src/modules/mail/interfaces/mail.interface";

const BookingCreationEmail = ({
  name,
  pickupDate,
  location,
  items,
  today,
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
      <Img
        width={200}
        src="https://rcbddkhvysexkvgqpcud.supabase.co/storage/v1/object/public/public-files/v8.5.png"
        style={{ justifySelf: "center", margin: "0 0 1rem" }}
      />
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
              "url('https://i0.wp.com/nordiclarp.org/wp-content/uploads/2023/11/Odysseus2-scaled.jpeg?resize=1200%2C900&ssl=1')",
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
          Vastaanotettu varaus - Booking received!
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
          Varauksesi on lähetetty. Voi kestää muutaman päivän vahvistaa
          varauksen vahvistaminen, koska meidän on varmistettava, että kaikki
          kohteet ovat saatavilla osoitteessa kyseisenä päivänä. Jos sinulla on
          kysyttävää, ota meihin yhteyttä.
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
          <strong>Varaus tehty:</strong> {today}
        </Text>

        <hr style={{ margin: "30px 0" }} />

        <Text style={{ fontSize: "16px", marginBottom: "10px" }}>
          Hello <strong>{name}</strong>,
        </Text>
        <Text style={{ fontSize: "16px", marginBottom: "10px" }}>
          Your booking has been send. It might take a few days to confirm the
          booking, since we have to make sure that all items are available on
          that date. If you have any questions, please contact us.
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
          <strong>Booking made:</strong> {today}
        </Text>

        <Section style={{ textAlign: "center", marginTop: "30px" }}>
          <a
            href="https://agreeable-grass-049dc8010.6.azurestaticapps.net/profile?tab=bookings"
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
            href="https://agreeable-grass-049dc8010.6.azurestaticapps.net/contact-us/"
            style={{ color: "#2f5D9E" }}
          >
            {" "}
            contact form{" "}
          </a>
          on our website.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default BookingCreationEmail;
