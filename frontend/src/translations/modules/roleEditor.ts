import { common } from "./common";

export const roleEditor = {
  modes: {
    label: {
      fi: "Tila:",
      en: "Mode:",
    },
    options: {
      create: {
        fi: "Luo",
        en: "Create",
      },
      softDelete: {
        fi: "Pehmeä poisto",
        en: "Soft Delete",
      },
      restoreRole: {
        fi: "Palauta rooli",
        en: "Restore Role",
      },
      hardDelete: {
        fi: "Pysyvä poisto",
        en: "Hard Delete",
      },
    },
  },
  titles: {
    createRole: {
      fi: "Luo rooli",
      en: "Create Role",
    },
    softDeleteRole: {
      fi: "Pehmeä poisto rooli",
      en: "Soft Delete Role",
    },
    restoreRole: {
      fi: "Palauta rooli",
      en: "Restore Role",
    },
    hardDeleteRole: {
      fi: "Poista rooli pysyvästi",
      en: "Hard Delete Role",
    },
  },
  fields: {
    userByEmail: {
      fi: "Käyttäjä (sähköpostilla)",
      en: "User (by email)",
    },
    organization: {
      fi: common.organizations.organization.fi,
      en: common.organizations.organization.en,
    },
    role: {
      fi: common.roles.role.fi,
      en: common.roles.role.en,
    },
    roleAssignment: {
      fi: "Roolitehtävä",
      en: "Role Assignment",
    },
  },
  placeholders: {
    selectUser: {
      fi: "Valitse käyttäjä",
      en: "Select a user",
    },
    selectOrganization: {
      fi: "Valitse organisaatio",
      en: "Select an organization",
    },
    selectRole: {
      fi: "Valitse rooli",
      en: "Select a role",
    },
    filterByUserEmail: {
      fi: "Suodata käyttäjän sähköpostilla",
      en: "Filter by user email",
    },
    filterByOrganization: {
      fi: "Suodata organisaation mukaan",
      en: "Filter by organization",
    },
    filterByRole: {
      fi: "Suodata roolin mukaan",
      en: "Filter by role",
    },
  },
  buttons: {
    creating: {
      fi: "Luodaan...",
      en: "Creating...",
    },
    createRole: {
      fi: "Luo rooli",
      en: "Create Role",
    },
    cancel: {
      fi: common.cancel.fi,
      en: common.cancel.en,
    },
    clearFilters: {
      fi: "Tyhjennä suodattimet",
      en: "Clear Filters",
    },
    delete: {
      fi: common.delete.fi,
      en: common.delete.en,
    },
    restore: {
      fi: "Palauta",
      en: "Restore",
    },
    deletePermanently: {
      fi: "Poista pysyvästi",
      en: "Delete Permanently",
    },
  },
  table: {
    headers: {
      userEmail: {
        fi: "Käyttäjän sähköposti",
        en: "User Email",
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
        fi: common.active.fi,
        en: common.active.en,
      },
      action: {
        fi: common.actions.fi,
        en: common.actions.en,
      },
    },
    status: {
      yes: {
        fi: common.yes.fi,
        en: common.yes.en,
      },
      no: {
        fi: common.no.fi,
        en: common.no.en,
      },
    },
  },
  toast: {
    success: {
      created: {
        en: "Role created",
        fi: "Rooli luotu",
      },
      deactivated: {
        en: "Role deactivated",
        fi: "Rooli deaktivoitu",
      },
      restored: {
        en: "Role restored",
        fi: "Rooli palautettu",
      },
      deleted: {
        en: "Role permanently deleted",
        fi: "Rooli poistettu pysyvästi",
      },
    },
  },
  messages: {
    operationFailed: {
      fi: "Toiminto epäonnistui",
      en: "Operation failed",
    },
    allFieldsRequired: {
      fi: "Kaikki kentät ovat pakollisia",
      en: "All fields are required",
    },
    noRoleAssignments: {
      fi: "Yksikään roolitehtävä ei vastaa suodattimia",
      en: "No role assignments match your filters",
    },
  },
  userLabels: {
    thisUser: {
      fi: "Tämä käyttäjä",
      en: "This user",
    },
  },
};
