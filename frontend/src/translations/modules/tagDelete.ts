import { common } from "./common";

export const tagDelete = {
  messages: {
    invalidId: {
      fi: "Virheellinen tagin tunnus.",
      en: "Invalid tag ID.",
    },
    generalError: {
      fi: "Virhe poistettaessa tagia.",
      en: "Error deleting tag.",
    },
  },
  confirmation: {
    title: {
      fi: "Vahvista poistaminen",
      en: "Confirm Deletion",
    },
    description: {
      fi: "Tämä poistaa tagin pysyvästi ja poistaa sen kaikista liitetyistä kohteista. Oletko varma?",
      en: "This will permanently delete the tag and remove it from all associated items. Are you sure?",
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
      fi: "Poistetaan tagia...",
      en: "Deleting tag...",
    },
    success: {
      fi: "Tagi on poistettu onnistuneesti.",
      en: "Tag has been successfully deleted.",
    },
    error: {
      fi: "Tagin poistaminen epäonnistui.",
      en: "Failed to delete tag.",
    },
  },
  button: {
    title: {
      fi: "Poista tagi",
      en: "Delete Tag",
    },
  },
};
