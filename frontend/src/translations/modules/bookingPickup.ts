import { common } from "./common";

export const bookingPickup = {
  confirmDialog: {
    title: {
      fi: "Vahvista nouto",
      en: "Confirm Pickup",
    },
    description: {
      fi: "Haluatko varmasti merkitä tämän varauksen noudetuksi?",
      en: "Are you sure you want to mark this booking as picked up?",
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
      fi: "Käsitellään noutoa...",
      en: "Processing pick-up...",
    },
    success: {
      fi: "Varaus on merkitty onnistuneesti noudetuksi.",
      en: "Booking has been successfully marked as picked-up.",
    },
    error: {
      fi: "Noudon käsittely epäonnistui.",
      en: "Failed to process the pick-up.",
    },
  },
  errors: {
    invalidId: {
      fi: "Virheellinen varausnumero.",
      en: "Invalid booking ID.",
    },
    multiLocation: {
      fi: "Valitse tuotteet yhdestä sijainnista ennen noudon vahvistamista.",
      en: "Select items from a single location before confirming pickup.",
    },
    beforeStartDate: {
      fi: "Tuotteet voidaan merkitä noudetuiksi aikaisintaan aloituspäivänä.",
      en: "Items can be marked as picked up on or after their start date.",
    },
  },
};
