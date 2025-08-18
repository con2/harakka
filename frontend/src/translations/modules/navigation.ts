import { common } from "./common";

export const navigation = {
  myProfile: {
    fi: "Profiilini",
    en: "My Profile",
  },
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
    en: common.organizations.organization.en,
    fi: common.organizations.organization.fi,
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
    label: { en: "Notifications", fi: "Ilmoitukset" },
    none: { en: "Nothing new yet.", fi: "Ei uusia ilmoituksia" },
    markAllRead: { en: "Mark all as read", fi: "Merkitse kaikki luetuiksi" },
    srOpen: { en: "Open notifications", fi: "Avaa ilmoitukset" },
  },
};
