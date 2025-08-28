import { common } from "./common";

export const bookingReject = {
  confirmDialog: {
    title: {
      fi: "Vahvista hylkäys",
      en: "Confirm Rejection",
    },
    description: {
      fi: "Oletko varma, että haluat hylätä tämän varauksen?",
      en: "Are you sure you want to reject this booking?",
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
      fi: "Hylätään varausta...",
      en: "Rejecting booking...",
    },
    success: {
      fi: "Varaus on hylätty onnistuneesti.",
      en: "Booking has been successfully rejected.",
    },
    error: {
      fi: "Varauksen hylkääminen epäonnistui.",
      en: "Failed to reject the booking.",
    },
  },
  errors: {
    invalidId: {
      fi: "Virheellinen varausnumero.",
      en: "Invalid booking ID.",
    },
  },
};
