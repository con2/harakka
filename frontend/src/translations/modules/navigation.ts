import { common } from "./common";

export const navigation = {
  admin: {
    fi: common.roles.admin.fi,
    en: common.roles.admin.en,
  },
  storage: {
    fi: "Varasto",
    en: "Storage",
  },
  guides: {
    fi: "Oppaat",
    en: "Guides",
  },
  contactUs: {
    fi: "Ota yhteyttä",
    en: "Contact Us",
  },
  organizations: {
    en: "Organizations",
    fi: "Organisaatiot",
  },
  toast: {
    title: {
      fi: "Vahvista uloskirjautuminen",
      en: "Confirm Logout",
    },
    description: {
      fi: "Haluatko varmasti kirjautua ulos? Tämä lopettaa nykyisen istuntosi.",
      en: "Are you sure you want to log out? This will end your current session.",
    },
    confirmText: {
      fi: "Kirjaudu ulos",
      en: "Log Out",
    },
    cancelText: {
      fi: common.cancel.fi,
      en: common.cancel.en,
    },
    success: {
      fi: "Uloskirjautuminen peruttu.",
      en: "Logout canceled.",
    },
  },
  notifications: {
    label: {
      en: "Notifications",
      fi: "Ilmoitukset",
    },
    none: {
      en: "Nothing new yet.",
      fi: "Ei uusia ilmoituksia",
    },
    markAllRead: {
      en: "Mark all as read",
      fi: "Merkitse kaikki luetuiksi",
    },
    markAsRead: {
      en: "Mark as read",
      fi: "Merkitse luetuksi",
    },
    deleteAll: {
      en: "Delete all",
      fi: "Poista kaikki",
    },
    deleteOne: {
      en: "Delete notification",
      fi: "Poista ilmoitus",
    },
    viewActive: {
      en: "Active",
      fi: "Konteksti",
    },
    viewAll: {
      en: "All",
      fi: "Kaikki",
    },
    otherContextsPrefix: {
      en: "Others",
      fi: "Muut",
    },
    toasts: {
      switchedContext: {
        en: "Switched to {role} in {org} to open this booking.",
        fi: "Vaihdettiin rooliin {role} organisaatiossa {org} tämän varauksen avaamiseksi.",
      },
      revertedContext: {
        en: "Reverted to {role} in {org}.",
        fi: "Palattiin rooliin {role} organisaatiossa {org}.",
      },
    },
    srOpen: {
      en: "Open notifications",
      fi: "Avaa ilmoitukset",
    },
  },
  aria: {
    labels: {
      cart: {
        en: "Go to cart. {number} items",
        fi: "Siirry ostoskoriin. {number} tuotetta",
      },
      logIn: {
        en: "Log in",
        fi: "Kirjaudu sisään",
      },
      logo: {
        en: "Home",
        fi: "Etusivu",
      },
      notifications: {
        en: "Notifications. {number} unread",
        fi: "Ilmoitukset. {number} lukematonta",
      },
    },
  },
};
