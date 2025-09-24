import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Section,
} from "@react-email/components";

const BookingDeleteMail = ({ name, email, booking }) => (
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
              "url('https://larppikuvat.fi/media/previews/odysseus-2024-run-3-vssomnx7/lenne-eeronketo/day-1/odysseus-6.preview.avif')",
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
          Varaus poistettu - Booking deleted - marked as deleted
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
          Hei <strong>Admin</strong>,
        </Text>
        <Text style={{ fontSize: "16px", marginBottom: "10px" }}>
          Varaus, jonka järjestysnumero on {booking}, on onnistuneesti merkitty
          poistetuksi. Se siirtyy arkistoosi eikä näy enää tilausten
          luettelossa. Se on tullut pois käyttäjältä {name}, {email}.
        </Text>

        <hr style={{ margin: "30px 0" }} />

        <Text style={{ fontSize: "16px", marginBottom: "10px" }}>
          Hello <strong>Admin</strong>,
        </Text>
        <Text style={{ fontSize: "16px", marginBottom: "10px" }}>
          The booking with the booking number {booking} has been sucessfully
          marked as deleted. It will go to your archive and will no longer be
          visible in the list of the bookings. It has been deleted from user{" "}
          {name}, {email}.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default BookingDeleteMail;
