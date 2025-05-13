import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Preview,
} from "@react-email/components";

interface BookingConfirmationEmailProps {
  name: string;
  date: string;
  location: string;
}

export const BookingConfirmationEmail = ({
  name,
  date,
  location,
}: BookingConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Buchungsbestätigung für {name}</Preview>
    <Body
      style={{
        fontFamily: "Helvetica, Arial, sans-serif",
        backgroundColor: "#f9f9f9",
      }}
    >
      <Container>
        <Text>Hallo {name},</Text>
        <Text>Deine Buchung wurde erfolgreich bestätigt!</Text>
        <Text>
          <strong>Datum:</strong> {date}
          <br />
          <strong>Ort:</strong> {location}
        </Text>
        <Text>Vielen Dank für deine Buchung.</Text>
      </Container>
    </Body>
  </Html>
);

export default BookingConfirmationEmail;
