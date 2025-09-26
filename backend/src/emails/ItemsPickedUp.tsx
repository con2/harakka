import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Img,
  Section,
} from "@react-email/components";
import { PickUpEmail } from "src/modules/mail/interfaces/mail.interface";

const ItemsPickedUpMail = ({
  name,
  // pickupDate,
  location,
  items,
}: PickUpEmail) => (
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
              "url('https://www.odysseuslarp.com/uploads/1/1/7/1/117136993/characters4-japsu_1.jpg')",
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
          Noudetut tuotteet - Items picked up
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
          Kaikki tavarat noudettiin paikalta: {location}.
        </Text>

        <Text style={{ fontWeight: "bold", marginBottom: "8px" }}>
          Tavaraluettelo:
        </Text>
        <ul style={{ paddingLeft: "20px", marginBottom: "20px" }}>
          {items.map((item, index) => (
            <li key={index} style={{ marginBottom: "4px", fontSize: "16px" }}>
              {item.translations.fi.name} (x{item.quantity})
            </li>
          ))}
        </ul>

        <hr style={{ margin: "30px 0" }} />

        <Text style={{ fontSize: "16px", marginBottom: "10px" }}>
          Hello <strong>{name}</strong>,
        </Text>
        <Text style={{ fontSize: "16px", marginBottom: "10px" }}>
          All items were picked up from the location: {location}.
        </Text>

        <Text style={{ fontWeight: "bold", marginBottom: "8px" }}>
          List of items:
        </Text>
        <ul style={{ paddingLeft: "20px", marginBottom: "20px" }}>
          {items.map((item, index) => (
            <li key={index} style={{ marginBottom: "4px", fontSize: "16px" }}>
              {item.translations.en.name} (x{item.quantity})
            </li>
          ))}
        </ul>

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
            View your Bookings
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

export default ItemsPickedUpMail;
