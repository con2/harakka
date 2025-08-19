import { common } from "./common";

export const userEditModal = {
  title: {
    fi: "Muokkaa käyttäjää",
    en: "Edit User",
  },
  description: {
    fi: "Muokkaa käyttäjän profiilitietoja ja rooleja.",
    en: "Edit the user's profile details and roles.",
  },
  labels: {
    fullName: {
      fi: common.personalData.name.fi,
      en: common.personalData.name.en,
    },
    email: {
      fi: common.personalData.email.fi,
      en: common.personalData.email.en,
    },
    phone: {
      fi: common.personalData.phone.fi,
      en: common.personalData.phone.en,
    },
    roles: {
      fi: "Roolit",
      en: "Roles",
    },
    visibleName: {
      fi: common.personalData.visibleName.fi,
      en: common.personalData.visibleName.en,
    },
  },
  placeholders: {
    fullName: {
      fi: common.personalData.name.fi,
      en: common.personalData.name.en,
    },
    email: {
      fi: common.personalData.email.fi,
      en: common.personalData.email.en,
    },
    phone: {
      fi: common.personalData.phone.fi,
      en: common.personalData.phone.en,
    },
    visibleName: {
      fi: common.personalData.visibleName.fi,
      en: common.personalData.visibleName.en,
    },
    selectRole: {
      fi: "Valitse rooli",
      en: "Select Role",
    },
    selectOrganization: {
      fi: "Valitse organisaatio",
      en: "Select Organization",
    },
  },
  buttons: {
    save: {
      fi: "Tallenna muutokset",
      en: "Save Changes",
    },
    remove: {
      fi: common.remove.fi,
      en: common.remove.en,
    },
    addRole: {
      fi: "Lisää rooli",
      en: "Add Role",
    },
  },
  status: {
    noRoles: {
      fi: "Ei rooleja",
      en: "No roles",
    },
  },
  messages: {
    success: {
      fi: "Käyttäjä päivitetty onnistuneesti!",
      en: "User updated successfully!",
    },
    error: {
      fi: "Käyttäjän päivitys epäonnistui. Yritä uudelleen.",
      en: "Failed to update user. Please try again.",
    },
  },
  columns: {
    organization: {
      fi: common.organizations.organization.fi,
      en: common.organizations.organization.en,
    },
    role: {
      fi: common.roles.role.fi,
      en: common.roles.role.en,
    },
    actions: {
      fi: common.actions.fi,
      en: common.actions.en,
    },
    active: {
      fi: common.active.fi,
      en: common.active.en,
    },
  },
};
