import { common } from "./common";

export const bookingReturn = {
  confirmDialog: {
    title: {
      fi: "Vahvista palautus",
      en: "Confirm Return",
    },
    description: {
      fi: "Oletko varma, että haluat merkitä tämän varauksen palautetuksi?",
      en: "Are you sure you want to mark this booking as returned?",
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
      fi: "Käsitellään palautusta...",
      en: "Processing return...",
    },
    success: {
      fi: "Varaus on merkitty onnistuneesti palautetuksi.",
      en: "Booking has been successfully marked as returned.",
    },
    error: {
      fi: "Palautuksen käsittely epäonnistui.",
      en: "Failed to process the return.",
    },
  },
  errors: {
    invalidId: {
      fi: "Virheellinen varausnumero.",
      en: "Invalid booking ID.",
    },
  },
};
