import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Section,
} from "@react-email/components";

export interface WelcomeEmailProps {
  name: string;
}

const WelcomeEmail = ({ name }: WelcomeEmailProps) => (
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
              "url('https://i0.wp.com/nordiclarp.org/wp-content/uploads/2024/01/IMG_1161-scaled.jpeg?resize=1200%2C900&ssl=1')",
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
          Welcome to Harakka Storage Solutions
        </Text>

        <Text style={{ fontSize: "16px", marginBottom: "10px" }}>
          Welcome <strong>{name}</strong>,
        </Text>

        <Text style={{ fontSize: "16px", marginBottom: "20px" }}>
          Thank you for joining our family! We are excited to have you on board.
        </Text>

        <Section style={{ textAlign: "center", marginTop: "30px" }}>
          <a
            href="https://agreeable-grass-049dc8010.6.azurestaticapps.net/profile"
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
            Add your information
          </a>
        </Section>
        <Text style={{ fontSize: "14px", color: "#666666", marginTop: "30px" }}>
          If you have any questions, contact us by answering this mail or use
          the
          <a
            href="https://agreeable-grass-049dc8010.6.azurestaticapps.net/contact-us"
            style={{ color: "#2f5D9E" }}
          >
            contact form
          </a>
          in our website.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;
