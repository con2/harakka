import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Section,
} from "@react-email/components";
import type { ReminderEmailProps } from "src/modules/mail/interfaces/mail.interface";

export default function BookingReminderEmail({
  bookingNumber,
  dueDate,
  type,
}: ReminderEmailProps): React.ReactElement {
  const isOverdue = type === "overdue";
  const titleFi = isOverdue
    ? "Muistutus: Palautus myöhässä"
    : "Muistutus: Palautus erääntyy tänään";
  const titleEn = isOverdue
    ? "Reminder: Return overdue"
    : "Reminder: Return due today";

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
          backgroundColor: "#f3f4f6",
          margin: 0,
          padding: "40px 20px",
          color: "#111827",
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            padding: "32px 28px",
            maxWidth: "640px",
            margin: "0 auto",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          }}
        >
          <Text
            style={{
              fontFamily: "'Roboto'",
              fontSize: "20px",
              fontWeight: 600,
              color: "#1f2937",
              textAlign: "center",
              marginBottom: "18px",
            }}
          >
            {titleFi} – {titleEn}
          </Text>

          <Text style={{ fontSize: "16px", marginBottom: "8px" }}>Hei,</Text>
          <Text style={{ fontSize: "16px", marginBottom: "8px" }}>
            Varauksesi <strong>{bookingNumber}</strong>{" "}
            {isOverdue ? "on myöhässä" : "erääntyy tänään"}:{" "}
            <strong>{dueDate}</strong>.
          </Text>
          <Text style={{ fontSize: "16px", marginBottom: "18px" }}>
            Ole hyvä ja palauta tuotteet mahdollisimman pian tai ole meihin
            yhteydessä, mikäli tarvitset lisäaikaa.
          </Text>

          <Section>
            <hr style={{ margin: "24px 0", borderColor: "#e5e7eb" }} />
          </Section>

          <Text style={{ fontSize: "16px", marginBottom: "8px" }}>Hello,</Text>
          <Text style={{ fontSize: "16px", marginBottom: "8px" }}>
            Your booking <strong>{bookingNumber}</strong> is{" "}
            {isOverdue ? "overdue" : "due today"}: <strong>{dueDate}</strong>.
          </Text>
          <Text style={{ fontSize: "16px", marginBottom: "18px" }}>
            Please return the items as soon as possible or contact us if you
            need more time.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
