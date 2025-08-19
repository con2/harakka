import { common } from "./common";

export const bookingCancel = {
  confirmDialog: {
    title: {
      fi: "Vahvista peruutus",
      en: "Confirm Cancellation",
    },
    description: {
      fi: "Oletko varma, että haluat peruuttaa tämän varauksen?",
      en: "Are you sure you want to cancel this booking?",
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
      fi: "Peruutetaan varausta...",
      en: "Cancelling booking...",
    },
    success: {
      fi: "Varaus peruutettu onnistuneesti",
      en: "Booking cancelled successfully",
    },
    error: {
      fi: "Varauksen peruuttaminen epäonnistui",
      en: "Failed to cancel booking",
    },
  },
  errors: {
    invalidId: {
      fi: "Virheellinen varausnumero.",
      en: "Invalid booking ID.",
    },
  },
};
