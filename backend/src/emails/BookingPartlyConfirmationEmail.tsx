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

interface BookingPartlyConfirmationEmailProps extends EmailProps {
  confirmedItems: EmailProps["items"];
  rejectedItems: EmailProps["items"];
}

const BookingPartlyConfirmationEmail = ({
  name,
  pickupDate,
  location,
  confirmedItems,
  rejectedItems,
}: BookingPartlyConfirmationEmailProps) => {
  return (
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
          backgroundColor: "#C4C9CC",
          margin: 0,
          padding: "40px 20px",
          color: "#333333",
        }}
      >
        <Img
          width={200}
          src="https://rcbddkhvysexkvgqpcud.supabase.co/storage/v1/object/public/public-files/v8.5.png"
          style={{ justifySelf: "center", margin: "0 auto 1rem" }}
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
            Varaus osittain vahvistettu - Booking partly confirmed
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
            Osa varauksestasi on vahvistettu. Noutopäivämääräsi pysyy samana,
            mutta kaikki kohteet eivät ole vielä saatavilla. Ota meihin yhteyttä
            saadaksesi lisätietoja.
          </Text>

          <Text style={{ fontWeight: "bold", marginBottom: "8px" }}>
            Vahvistetut kohteet:
          </Text>
          <ul style={{ paddingLeft: "20px", marginBottom: "20px" }}>
            {confirmedItems.map((item, index) => (
              <li key={index}>
                {item.translations.fi.name} (x{item.quantity})
              </li>
            ))}
          </ul>

          <Text style={{ fontWeight: "bold", marginBottom: "8px" }}>
            Hylätyt kohteet:
          </Text>
          <ul style={{ paddingLeft: "20px", marginBottom: "20px" }}>
            {rejectedItems.map((item, index) => (
              <li key={index}>
                {item.translations.fi.name} (x{item.quantity})
              </li>
            ))}
          </ul>

          <Text style={{ fontSize: "16px", marginBottom: "20px" }}>
            <strong>Noutopäivämääräsi pysyy samana:</strong> {pickupDate}
            <br />
            <strong>Noutopaikka:</strong> {location}
            <br />
          </Text>

          <hr style={{ margin: "30px 0" }} />

          <Text style={{ fontSize: "16px", marginBottom: "10px" }}>
            Hello <strong>{name}</strong>,
          </Text>
          <Text style={{ fontSize: "16px", marginBottom: "10px" }}>
            Part of your booking has been confirmed. Your pickup date remains
            the same, but not all items are available. Please contact us for
            further details.
          </Text>

          <Text style={{ fontWeight: "bold", marginBottom: "8px" }}>
            Confirmed items:
          </Text>
          <ul style={{ paddingLeft: "20px", marginBottom: "20px" }}>
            {confirmedItems.map((item, index) => (
              <li key={index}>
                {item.translations?.en?.name} (x{item.quantity})
              </li>
            ))}
          </ul>

          <Text style={{ fontWeight: "bold", marginBottom: "8px" }}>
            Rejected items:
          </Text>
          <ul style={{ paddingLeft: "20px", marginBottom: "20px" }}>
            {rejectedItems.map((item, index) => (
              <li key={index}>
                {item.translations?.en?.name} (x{item.quantity})
              </li>
            ))}
          </ul>

          <Text style={{ fontSize: "16px", marginBottom: "20px" }}>
            <strong>Your pickup date remains the same:</strong> {pickupDate}
            <br />
            <strong>Pickup location:</strong> {location}
            <br />
          </Text>

          <Section style={{ textAlign: "center", marginTop: "30px" }}>
            <a
              href="https://agreeable-grass-049dc8010.6.azurestaticapps.net/my-bookings"
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
          <Text
            style={{ fontSize: "14px", color: "#666666", marginTop: "30px" }}
          >
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
};

export default BookingPartlyConfirmationEmail;
