import { common } from "./common";

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
      fi: common.cancel.fi,
      en: common.cancel.en,
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
    provideCustomReason: {
      fi: "Anna mukautettu esto-syy",
      en: "Please provide a custom ban reason",
    },
    failedLoadBanHistory: {
      fi: "Esto-historian lataaminen epäonnistui",
      en: "Failed to load ban history",
    },
    noPermissionUnbanApp: {
      fi: "Sinulla ei ole oikeutta poistaa sovellus-estoja",
      en: "You don't have permission to unban users from the application",
    },
    noPermissionUnbanOrg: {
      fi: "Sinulla ei ole oikeutta poistaa organisaatio-estoja",
      en: "You don't have permission to unban users from organizations",
    },
    noPermissionUnbanRole: {
      fi: "Sinulla ei ole oikeutta poistaa rooli-estoja",
      en: "You don't have permission to unban users from roles",
    },
    onlyUnbanActiveOrg: {
      fi: "Voit poistaa estoja vain aktiivisesta organisaatiostasi",
      en: "You can only unban users from your active organization",
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
    unbanSuccess: {
      fi: "Esto poistettu onnistuneesti",
      en: "User unbanned successfully",
    },
    unbanError: {
      fi: "Virhe eston poistossa",
      en: "Error unbanning user",
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
      organizationPlaceholder: {
        fi: "Valitse organisaatio, josta esto poistetaan...",
        en: "Select organization to unban from...",
      },
      rolePlaceholder: {
        fi: "Valitse rooli, josta esto poistetaan...",
        en: "Select role to unban from...",
      },
      reasonPlaceholder: {
        fi: "Syy eston poistamiselle...",
        en: "Reason for unbanning...",
      },
    },
  },
};
