export const notifications = {
  "booking.status_approved": {
    title: { en: "Booking confirmed", fi: "Varaus vahvistettu" },
    message: {
      en: "Your booking {num} has been confirmed.",
      fi: "Varauksesi {num} on vahvistettu.",
    },
  },
  "booking.status_rejected": {
    title: { en: "Booking rejected", fi: "Varaus hylätty" },
    message: {
      en: "Unfortunately booking {num} was rejected.",
      fi: "Valitettavasti varaus {num} hylättiin.",
    },
  },
  "user.created": {
    title: { en: "New user registered", fi: "Uusi käyttäjä rekisteröityi" },
    message: {
      en: "{email} just signed up.",
      fi: "{email} rekisteröityi.",
    },
  },
} as const;
