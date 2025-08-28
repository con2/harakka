import { common } from "./common";

export const userDelete = {
  messages: {
    invalidId: {
      fi: "Virheellinen käyttäjän tunnus.",
      en: "Invalid user ID.",
    },
  },
  confirmation: {
    title: {
      fi: "Vahvista käyttäjän poistaminen",
      en: "Confirm User Deletion",
    },
    description: {
      fi: "Tämä poistaa käyttäjän ja kaikki hänen tietonsa pysyvästi. Tätä toimintoa ei voi kumota. Oletko varma?",
      en: "This will permanently delete the user and all their data. This action cannot be undone. Are you sure?",
    },
    confirmText: {
      fi: "Poista käyttäjä",
      en: "Delete User",
    },
    cancelText: {
      fi: common.cancel.fi,
      en: common.cancel.en,
    },
  },
  toast: {
    loading: {
      fi: "Poistetaan käyttäjää...",
      en: "Deleting user...",
    },
    success: {
      fi: "Käyttäjä poistettu onnistuneesti.",
      en: "User deleted successfully.",
    },
    error: {
      fi: "Käyttäjän poistaminen epäonnistui.",
      en: "Failed to delete user.",
    },
  },
  button: {
    title: {
      fi: "Poista käyttäjä",
      en: "Delete User",
    },
  },
};
