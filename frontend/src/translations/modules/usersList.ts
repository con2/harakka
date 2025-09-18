import { common } from "./common";

export const usersList = {
  titleSuper: {
    fi: "Hallinnoi käyttäjiä",
    en: "Manage Users",
  },
  titleOrg: {
    en: "Manage Users of {org}",
    fi: "Hallinnoi organisaation {org} käyttäjiä",
  },
  filters: {
    search: {
      fi: "Hae nimellä tai sähköpostilla",
      en: "Search by name or email",
    },
    roles: {
      all: {
        fi: "Kaikki roolit",
        en: "All Roles",
      },
    },
    clear: {
      fi: "Tyhjennä suodattimet",
      en: "Clear Filters",
    },
  },
  addUser: {
    title: {
      fi: "Lisää Orgni käyttäjää",
      en: "Add My Org User",
    },
    search: {
      fi: "Hae nimellä tai sähköpostilla",
      en: "Search by name or email",
    },
    searchButton: {
      fi: "Hae",
      en: "Search",
    },
    addButton: {
      fi: "Lisää käyttäjä",
      en: "Add User",
    },
    noResults: {
      fi: "Ei tuloksia",
      en: "No results",
    },
    noOrgSelected: {
      fi: "Valitse organisaatio ensin",
      en: "Select organization first",
    },
    roleNotAvailable: {
      fi: "Rooli ei ole saatavilla",
      en: "Role not available",
    },
    roles: {
      user: {
        fi: common.roles.user.fi,
        en: common.roles.user.en,
      },
      storageManager: {
        fi: common.roles.storageManager.fi,
        en: common.roles.storageManager.en,
      },
      requester: {
        fi: common.roles.requester.fi,
        en: common.roles.requester.en,
      },
    },
    member: {
      fi: "Jäsen",
      en: "Member",
    },
    buttons: {
      assign: {
        fi: "Määritä",
        en: "Assign",
      },
      close: {
        fi: common.close.fi,
        en: common.close.en,
      },
      loading: {
        fi: "Ladataan...",
        en: "Loading...",
      },
      loadMore: {
        fi: "Lataa lisää",
        en: "Load More",
      },
    },
    success: {
      fi: "Rooli määritetty onnistuneesti",
      en: "Role assigned successfully",
    },
    error: {
      fi: "Roolin määrittäminen epäonnistui",
      en: "Failed to assign role",
    },
  },
  columns: {
    name: {
      fi: common.personalData.name.fi,
      en: common.personalData.name.en,
    },
    phone: {
      fi: common.personalData.phone.fi,
      en: common.personalData.phone.en,
    },
    email: {
      fi: common.personalData.email.fi,
      en: common.personalData.email.en,
    },
    userSince: {
      fi: "Käyttäjä alkaen",
      en: "User Since",
    },
    role: {
      fi: common.roles.role.fi,
      en: common.roles.role.en,
    },
    organization: {
      fi: common.organizations.organization.fi,
      en: common.organizations.organization.en,
    },
    active: {
      fi: common.status.fi,
      en: common.status.en,
    },
  },
  status: {
    unverified: {
      fi: "Vahvistamaton",
      en: "Unverified",
    },
    na: {
      fi: "Ei saatavilla",
      en: "N/A",
    },
    active: {
      fi: common.active.fi,
      en: common.active.en,
    },
    banned: {
      fi: "Estetty",
      en: "Banned",
    },
  },
  loading: {
    fi: "Ladataan käyttäjiä...",
    en: "Loading users...",
  },
};
