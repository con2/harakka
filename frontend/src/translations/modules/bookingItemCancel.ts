import { common } from "./common";

export const bookingItemsCancel = {
  confirmDialog: {
    title: {
      fi: "Vahvista tuotteen peruutus",
      en: "Confirm Item Cancellation",
    },
    description: {
      fi: "Haluatko varmasti peruuttaa valitut tuotteet?",
      en: "Are you sure you want to cancel the selected items?",
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
  cancel: {
    fi: "Peruuta varatut tuotteet",
    en: "Cancel Booking Items",
  },
  toast: {
    loading: {
      fi: "Peruutetaan varattuja tuotteita...",
      en: "Cancelling booking items...",
    },
    success: {
      fi: "Varauskohteet peruutettu onnistuneesti",
      en: "Booking items cancelled successfully",
    },
    error: {
      fi: "Varauskohteiden peruuttaminen epäonnistui",
      en: "Failed to cancel booking items",
    },
  },
  errors: {
    invalidId: {
      fi: "Virheellinen varausnumero.",
      en: "Invalid booking ID.",
    },
  },
};
