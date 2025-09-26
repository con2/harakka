import { common } from "./common";

export const organizationList = {
  columns: {
    description: {
      fi: "Kuvaus",
      en: "Description",
    },
  },
  view: {
    fi: "Näytä",
    en: "View",
  },
  error: {
    fi: "Virhe: ",
    en: "Error: ",
  },
  myRoles: {
    fi: "Omat roolit",
    en: "My roles",
  },
  membership: {
    youAreRole: {
      fi: "Olet {role} täällä",
      en: "You are a {role} here",
    },
  },
  actions: {
    browseStorage: {
      fi: "Selaa varastoa",
      en: "Browse Storage",
    },
  },
  alt: {
    organizationLogo: {
      fi: "{orgName} logo",
      en: "{orgName} logo",
    },
  },
};

export const organizationDelete = {
  button: {
    title: {
      en: "Delete organization",
      fi: "Poista organisaatio",
    },
  },
  confirmation: {
    title: {
      en: "Are you sure?",
      fi: "Oletko varma?",
    },
    description: {
      en: "This will permanently delete the organization.",
      fi: "Tämä poistaa organisaation pysyvästi.",
    },
    confirmText: {
      en: common.delete.en,
      fi: common.delete.fi,
    },
    cancelText: {
      en: common.cancel.en,
      fi: common.cancel.fi,
    },
  },
  toast: {
    loading: {
      en: "Deleting organization...",
      fi: "Poistetaan organisaatiota...",
    },
    success: {
      en: "Organization deleted successfully.",
      fi: "Organisaatio poistettu onnistuneesti.",
    },
    error: {
      en: "Failed to delete organization.",
      fi: "Organisaation poistaminen epäonnistui.",
    },
  },
  messages: {
    invalidId: {
      en: "Invalid organization ID.",
      fi: "Virheellinen organisaation tunnus.",
    },
    generalError: {
      en: "Something went wrong.",
      fi: "Jotain meni pieleen.",
    },
  },
};
