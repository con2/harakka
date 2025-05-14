// src/emails/WelcomeEmail.tsx
import { Html, Text, Heading } from "@react-email/components";
import * as React from "react";

export default function WelcomeEmail({ name }: { name: string }) {
  return (
    <Html>
      <Heading>Welcome, {name}!</Heading>
      <Text>Thanks for signing up for our service 🎉</Text>
    </Html>
  );
}
