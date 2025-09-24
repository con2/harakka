import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Section,
} from "@react-email/components";
import type { Org_Roles } from "@common/role.types";
import type { BookingItem } from "../modules/booking/types/order";

type ExtendedBookingItem = BookingItem & {
  translations?: {
    fi: { name: string };
    en: { name: string };
  };
};

type BookingCancelledEmailProps = {
  bookingId: string;
  items: ExtendedBookingItem[];
  recipientRole: Org_Roles;
  startDate: string;
};

const BookingCancelledEmail = ({
  bookingId,
  items,
  recipientRole,
  startDate,
}: BookingCancelledEmailProps): React.ReactElement => {
  // Define elevated roles who should *not* see the user-specific CTA
  const elevatedRoles: Org_Roles[] = [
    "super_admin",
    "tenant_admin",
    "storage_manager",
  ];
  const isElevated = elevatedRoles.includes(recipientRole);

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
                "url('https://larppikuvat.fi/media/previews/odysseus-2024-run-3-vssomnx7/lenne-eeronketo/day-1/odysseus-7.preview.avif')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              height: "250px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          ></Section>

          {/* --- finnish --- */}
          <Text
            style={{
              fontFamily: "'Roboto Slab'",
              fontSize: "24px",
              fontWeight: 400,
              color: "#2f5D9E",
              textAlign: "center",
              marginBottom: "16px",
            }}
          >
            Varaus peruttu - Booking Cancelled
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
            Varaus numerolla <strong>{bookingId}</strong> päivämäärälle{" "}
            <strong>{startDate}</strong> on peruttu.
          </Text>

          <Text style={{ fontWeight: "bold", marginTop: "20px" }}>
            Perutut tuotteet:
          </Text>
          <ul style={{ paddingLeft: "20px", marginBottom: "20px" }}>
            {items.map(
              (item, index): React.ReactElement => (
                <li
                  key={index}
                  style={{ fontSize: "16px", marginBottom: "6px" }}
                >
                  Kohde: {item.translations?.en.name ?? "Unknown"}, <br />
                  Määrä: {item.quantity}, <br />
                  Päivämäärät: {item.start_date} to {item.end_date}
                </li>
              ),
            )}
          </ul>

          <hr style={{ margin: "30px 0" }} />

          {/* --- english --- */}
          <Text style={{ fontSize: "16px", marginBottom: "10px" }}>
            A booking with booking number <strong>{bookingId}</strong> has been
            cancelled.
          </Text>

          <Text style={{ fontWeight: "bold", marginTop: "20px" }}>
            Cancelled Items:
          </Text>
          <ul style={{ paddingLeft: "20px", marginBottom: "20px" }}>
            {items.map(
              (item, index): React.ReactElement => (
                <li
                  key={index}
                  style={{ fontSize: "16px", marginBottom: "6px" }}
                >
                  Item: {item.translations?.en.name ?? "Unknown"}, <br />
                  Quantity: {item.quantity}, <br />
                  Dates: {item.start_date} to {item.end_date}
                </li>
              ),
            )}
          </ul>

          {!isElevated && (
            <Section style={{ textAlign: "center", marginTop: "30px" }}>
              <a
                href="http://localhost:5180/profile?tab=bookings"
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
                View Your Bookings
              </a>
            </Section>
          )}

          <Text
            style={{ fontSize: "14px", color: "#666666", marginTop: "30px" }}
          >
            If you have any questions, contact us by replying to this email or
            use the{" "}
            <a href="" style={{ color: "#2f5D9E" }}>
              contact form
            </a>{" "}
            on our website.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default BookingCancelledEmail;
