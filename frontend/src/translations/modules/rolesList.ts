import { common } from "./common";

export const rolesList = {
  messages: {
    selectUser: {
      en: "Please select user, organization and role",
      fi: "Valitse käyttäjä, organisaatio ja rooli",
    },
    roleCreated: {
      en: "Role created",
      fi: "Rooli luotu",
    },
    createFailed: {
      en: "Failed to create role",
      fi: "Roolin luominen epäonnistui",
    },
    roleActivated: {
      en: "Role activated",
      fi: "Rooli aktivoitu",
    },
    roleDeactivated: {
      en: "Role deactivated",
      fi: "Rooli deaktivoitu",
    },
    failedRoleUpdate: {
      en: "Failed to update role",
      fi: "Roolin päivittäminen epäonnistui",
    },
    roleDeletedSuccess: {
      en: "Role permanently deleted",
      fi: "Rooli poistettu pysyvästi",
    },
    roleDeletedFail: {
      en: "Failed to delete role",
      fi: "Roolin poistaminen epäonnistui",
    },
    confirmDelete: {
      title: {
        en: "Delete role permanently?",
        fi: "Poistetaanko rooli pysyvästi?",
      },
      description: {
        en: "This will permanently remove role {row.role_name} for {row.user_email}",
        fi: "Tämä poistaa pysyvästi roolin {row.role_name} käyttäjältä {row.user_email}",
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
  },
  placeholders: {
    selectUser: {
      en: "Select user",
      fi: "Valitse käyttäjä",
    },
    filterByUser: {
      en: "Filter by user (email or name)",
      fi: "Suodata käyttäjän mukaan (sähköposti tai nimi)",
    },
    filterByOrg: {
      en: "Filter by organization",
      fi: "Suodata organisaation mukaan",
    },
    searchRoles: {
      en: "Search roles",
      fi: "Hae rooleja",
    },
  },
  input: {
    selectRoles: {
      allRoles: {
        en: "All Roles",
        fi: "Kaikki roolit",
      },
      all: {
        en: common.roles.all.en,
        fi: common.roles.all.fi,
      },
      active: {
        en: common.active.en,
        fi: common.active.fi,
      },
      inactive: {
        en: common.inactive.en,
        fi: common.inactive.fi,
      },
    },
  },
  buttons: {
    clearFilters: {
      en: "Clear Filters",
      fi: "Tyhjennä suodattimet",
    },
    createNewRole: {
      en: "Create New Role",
      fi: "Luo uusi rooli",
    },
    cancel: {
      en: common.cancel.en,
      fi: common.cancel.fi,
    },
    save: {
      en: common.save.en,
      fi: common.save.fi,
    },
    ariaLabels: {
      deletePermanently: {
        en: "Delete permanently",
        fi: "Poista pysyvästi",
      },
    },
  },
  paragraphs: {
    noRoleAssignmentsFound: {
      en: "No role assignments found.",
      fi: "Roolimäärittelyjä ei löytynyt.",
    },
    loadingAdminData: {
      en: "Loading admin data...",
      fi: "Ladataan ylläpitäjän tietoja...",
    },
    allUserRoles: {
      en: "All Users Roles",
      fi: "Kaikkien käyttäjien roolit",
    },
  },
  badges: {
    you: {
      en: "You",
      fi: "Sinä",
    },
    willBeActive: {
      en: "Will be active",
      fi: "Aktivoituu",
    },
  },
  table: {
    headers: {
      user: {
        en: common.roles.user.en,
        fi: common.roles.user.fi,
      },
      role: {
        en: common.roles.role.en,
        fi: common.roles.role.fi,
      },
      org: {
        en: common.organizations.organization.en,
        fi: common.organizations.organization.fi,
      },
      active: {
        en: common.active.en,
        fi: common.active.fi,
      },
      actions: {
        en: common.actions.en,
        fi: common.actions.fi,
      },
    },
  },
};
