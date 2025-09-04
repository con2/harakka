export const userBan = {
  fields: {
    banType: {
      label: {
        fi: "Esto-tyyppi",
        en: "Ban Type",
      },
      options: {
        application: {
          fi: "Estä sovelluksesta",
          en: "Ban from Application",
        },
        organization: {
          fi: "Estä organisaatiosta",
          en: "Ban from Organization",
        },
        role: {
          fi: "Estä roolista",
          en: "Ban from Role",
        },
      },
    },
    organization: {
      label: {
        fi: "Organisaatio",
        en: "Organization",
      },
      placeholder: {
        fi: "Valitse organisaatio",
        en: "Select organization",
      },
    },
    role: {
      label: {
        fi: "Rooli",
        en: "Role",
      },
      placeholder: {
        fi: "Valitse rooli",
        en: "Select role",
      },
    },
    banReason: {
      label: {
        fi: "Esto-syy",
        en: "Ban Reason",
      },
      selectPlaceholder: {
        fi: "Valitse syy...",
        en: "Select a reason...",
      },
      custom: {
        fi: "Mukautettu esto-syy",
        en: "Custom Ban Reason",
      },
      customPlaceholder: {
        fi: "Täsmennä esto-syy...",
        en: "Please specify the reason for banning...",
      },
    },
    notes: {
      label: {
        fi: "Huomautukset (valinnainen)",
        en: "Notes (optional)",
      },
      placeholder: {
        fi: "Lisää huomautuksia (valinnainen)",
        en: "Add notes (optional)",
      },
    },
    isPermanent: {
      label: {
        fi: "Pysyvä esto",
        en: "Permanent Ban",
      },
    },
  },
  toast: {
    success: {
      fi: "Käyttäjä estetty onnistuneesti",
      en: "User banned successfully",
    },
    error: {
      fi: "Virhe estettäessä käyttäjää",
      en: "Error banning user",
    },
    loading: {
      fi: "Estetään käyttäjää...",
      en: "Banning user...",
    },
  },
  actions: {
    ban: {
      fi: "Estä käyttäjä",
      en: "Ban User",
    },
    cancel: {
      fi: "Peruuta",
      en: "Cancel",
    },
  },
  messages: {
    noPermissionApp: {
      fi: "Sinulla ei ole oikeutta estää käyttäjiä sovelluksesta",
      en: "You don't have permission to ban users from the application",
    },
    noPermissionOrg: {
      fi: "Sinulla ei ole oikeutta estää käyttäjiä organisaatioista",
      en: "You don't have permission to ban users from organizations",
    },
    noPermissionRole: {
      fi: "Sinulla ei ole oikeutta estää käyttäjiä rooleista",
      en: "You don't have permission to ban users from roles",
    },
    onlyAdminUserRoles: {
      fi: "Voit estää käyttäjiä vain 'admin' tai 'user' rooleista",
      en: "You can only ban users from 'admin' or 'user' roles",
    },
    onlyActiveOrg: {
      fi: "Voit estää käyttäjiä vain aktiivisesta organisaatiostasi",
      en: "You can only ban users from your active organization",
    },
    missingFields: {
      fi: "Täytä kaikki vaaditut kentät.",
      en: "Please fill in all required fields.",
    },
    provideCustomReason: {
      fi: "Anna mukautettu esto-syy",
      en: "Please provide a custom ban reason",
    },
  },
};
