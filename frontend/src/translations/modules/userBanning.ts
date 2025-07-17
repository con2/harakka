export const userBanning = {
  button: {
    title: {
      fi: "Estä käyttäjä",
      en: "Ban User",
    },
  },
  modal: {
    title: {
      fi: "Estä käyttäjä",
      en: "Ban User",
    },
    subtitle: {
      fi: "Valitse esto-tyyppi ja syy",
      en: "Select ban type and reason",
    },
  },
  fields: {
    banType: {
      label: {
        fi: "Esto-tyyppi",
        en: "Ban Type",
      },
      options: {
        role: {
          fi: "Estä roolista",
          en: "Ban from Role",
        },
        organization: {
          fi: "Estä organisaatiosta",
          en: "Ban from Organization",
        },
        application: {
          fi: "Estä sovelluksesta",
          en: "Ban from Application",
        },
      },
    },
    banReason: {
      label: {
        fi: "Esto-syy",
        en: "Ban Reason",
      },
      placeholder: {
        fi: "Syötä syy estolle...",
        en: "Enter reason for ban...",
      },
    },
    notes: {
      label: {
        fi: "Huomautukset (valinnainen)",
        en: "Notes (optional)",
      },
      placeholder: {
        fi: "Lisätiedot...",
        en: "Additional notes...",
      },
    },
    isPermanent: {
      label: {
        fi: "Pysyvä esto",
        en: "Permanent Ban",
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
  status: {
    banned: {
      fi: "Estetty",
      en: "Banned",
    },
    active: {
      fi: "Aktiivinen",
      en: "Active",
    },
  },
  messages: {
    invalidUserId: {
      fi: "Virheellinen käyttäjän tunnus.",
      en: "Invalid user ID.",
    },
    missingFields: {
      fi: "Täytä kaikki vaaditut kentät.",
      en: "Please fill in all required fields.",
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
  history: {
    title: {
      fi: "Käyttäjän estohistoria",
      en: "User Ban History",
    },
    noBans: {
      fi: "Ei estoja",
      en: "No bans",
    },
    columns: {
      banType: {
        fi: "Esto-tyyppi",
        en: "Ban Type",
      },
      reason: {
        fi: "Syy",
        en: "Reason",
      },
      bannedBy: {
        fi: "Estänyt",
        en: "Banned By",
      },
      bannedAt: {
        fi: "Estetty",
        en: "Banned At",
      },
      isPermanent: {
        fi: "Pysyvä",
        en: "Permanent",
      },
    },
  },
};
