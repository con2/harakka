import { common } from "./common";

export const organizationList = {
  header: {
    title: {
      fi: "Organisaatiot",
      en: "Organizations",
    },
    description: {
      fi: "Selaa eri organisaatioita ja niiden tarjoamia esineitä.",
      en: "Browse different organizations and their available items.",
    },
  },
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
      fi: "Selaa",
      en: "Browse",
    },
    browseItems: {
      fi: "esineitä",
      en: "Items",
    },
    readMore: {
      fi: "Lue lisää",
      en: "Read More",
    },
    backButton: {
      fi: "Takaisin",
      en: "Back",
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
