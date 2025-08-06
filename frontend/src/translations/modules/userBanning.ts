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
      custom: {
        fi: "Mukautettu esto-syy",
        en: "Custom Ban Reason",
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
    unban: {
      fi: "Poista esto",
      en: "Unban User",
    },
    viewHistory: {
      fi: "Näytä historia",
      en: "View History",
    },
    cancel: {
      fi: "Peruuta",
      en: "Cancel",
    },
    openMenu: {
      fi: "Avaa valikko",
      en: "Open menu",
    },
  },
  status: {
    banned: {
      fi: "Estetty",
      en: "Banned",
    },
    unbanned: {
      fi: "Esto poistettu",
      en: "Unbanned",
    },
    active: {
      fi: "Aktiivinen",
      en: "Active",
    },
    status: {
      fi: "Tila",
      en: "Status",
    },
    action: {
      fi: "Toiminto",
      en: "Action",
    },
    loading: {
      fi: "Ladataan...",
      en: "Loading...",
    },
    date: {
      fi: "Päivämäärä",
      en: "Date",
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
    noActiveBans: {
      fi: "Tällä käyttäjällä ei ole aktiivisia estoja poistettavana.",
      en: "This user has no active bans to remove.",
    },
    loadingBanInfo: {
      fi: "Ladataan esto-tietoja...",
      en: "Loading ban information...",
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
      orgName: {
        fi: "Organisaatio",
        en: "Organization",
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
      permanent: {
        fi: "Kyllä",
        en: "Yes",
      },
      notPermanent: {
        fi: "Ei",
        en: "No",
      },
    },
  },
  unban: {
    modal: {
      title: {
        fi: "Poista esto käyttäjältä",
        en: "Unban User",
      },
      subtitle: {
        fi: "Poista esto käyttäjältä",
        en: "Remove ban for user",
      },
    },
    fields: {
      banTypeToRemove: {
        fi: "Poistettava esto-tyyppi",
        en: "Ban Type to Remove",
      },
      selectTypes: {
        application: {
          fi: "Sovellus-esto",
          en: "Application Ban",
        },
        organization: {
          fi: "Organisaatio-esto",
          en: "Organization Ban",
        },
        role: {
          fi: "Rooli-esto",
          en: "Role Ban",
        },
      },
    },
  },
};
