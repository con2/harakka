import { common } from "./common";

export const bookingDelete = {
  confirmDialog: {
    title: {
      fi: "Vahvista poisto",
      en: "Confirm Deletion",
    },
    description: {
      fi: "Oletko varma, että haluat poistaa tämän varauksen?",
      en: "Are you sure you want to delete this booking?",
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
      fi: "Poistetaan varausta...",
      en: "Deleting booking...",
    },
    success: {
      fi: "Varaus on poistettu onnistuneesti.",
      en: "Booking has been successfully deleted.",
    },
    error: {
      fi: "Varauksen poistaminen epäonnistui.",
      en: "Failed to delete booking.",
    },
  },
  errors: {
    invalidId: {
      fi: "Virheellinen varausnumero.",
      en: "Invalid booking ID.",
    },
  },
};
