export const unbanUser = {
  messages: {
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
    missingFields: {
      fi: "Täytä kaikki vaaditut kentät.",
      en: "Please fill in all required fields.",
    },
    onlyUnbanActiveOrg: {
      fi: "Voit poistaa estoja vain aktiivisesta organisaatiostasi",
      en: "You can only unban users from your active organization",
    },
    loadingBanInfo: {
      fi: "Ladataan esto-tietoja...",
      en: "Loading ban information...",
    },
    noActiveBans: {
      fi: "Tällä käyttäjällä ei ole aktiivisia estoja poistettavana.",
      en: "This user has no active bans to remove.",
    },
  },
  unban: {
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
  fields: {
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
  },
  actions: {
    unban: {
      fi: "Poista esto",
      en: "Unban User",
    },
  },
  toast: {
    unbanSuccess: {
      fi: "Esto poistettu onnistuneesti",
      en: "User unbanned successfully",
    },
    unbanError: {
      fi: "Virhe eston poistossa",
      en: "Error unbanning user",
    },
    loading: {
      fi: "Poistetaan estoa...",
      en: "Unbanning user...",
    },
  },
};
