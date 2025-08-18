import { common } from "./common";

export const bookingConfirm = {
  confirmDialog: {
    title: {
      fi: "Vahvista varaus",
      en: "Confirm Booking",
    },
    description: {
      fi: "Oletko varma, että haluat vahvistaa tämän varauksen?",
      en: "Are you sure you want to confirm this booking?",
    },
    confirmText: {
      fi: common.confirm.fi,
      en: common.confirm.en,
    },
    cancelText: {
      fi: common.cancel.fi,
      en: common.cancel.en,
    },
  },
  toast: {
    loading: {
      fi: "Vahvistetaan varausta...",
      en: "Confirming booking...",
    },
    success: {
      fi: "Varaus on vahvistettu onnistuneesti.",
      en: "Booking has been successfully confirmed.",
    },
    error: {
      fi: "Varauksen vahvistaminen epäonnistui.",
      en: "Failed to confirm the booking.",
    },
  },
  errors: {
    invalidId: {
      fi: "Virheellinen varausnumero.",
      en: "Invalid booking ID.",
    },
  },
  button: {
    title: {
      fi: "Vahvista varaus",
      en: "Confirm Booking",
    },
  },
};
