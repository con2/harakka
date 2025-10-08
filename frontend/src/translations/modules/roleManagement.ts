export const roleManagement = {
  loading: {
    roles: {
      fi: "Ladataan rooleja...",
      en: "Loading roles...",
    },
  },
  buttons: {
    tryAgain: {
      fi: "Yritä uudelleen",
      en: "Try Again",
    },
    refresh: {
      fi: "Päivitä",
      en: "Refresh",
    },
    refreshSession: {
      fi: "Päivitä istunto",
      en: "Refresh session",
    },
  },
  titles: {
    dashboard: {
      fi: "Roolinhallinta-kojelauta",
      en: "Role Management Dashboard",
    },
  },
  messages: {
    failedToLoadRoleInformation: {
      fi: "Roolisietojen lataaminen epäonnistui:",
      en: "Failed to load role information:",
    },
  },
  toast: {
    info: {
      permissionsUpdated: {
        fi: "Ylläpitäjä päivitti käyttöoikeutesi. Saatat huomata joitain muutoksia käytettävissä olevissa toiminnoissa.",
        en: "An admin updated your access permissions. You may notice some changes in available actions.",
      },
    },
    success: {
      refreshed: {
        fi: "Roolit päivitetty onnistuneesti",
        en: "Roles refreshed successfully",
      },
      supabaseSessionRefreshed: {
        fi: "Supabase-istunto päivitetty!",
        en: "Supabase session refreshed!",
      },
    },
    error: {
      refreshFailed: {
        fi: "Roolien päivittäminen epäonnistui",
        en: "Failed to refresh roles",
      },
      supabaseSessionRefreshFailed: {
        fi: "Supabase-istunnon päivittäminen epäonnistui",
        en: "Failed to refresh Supabase session",
      },
    },
  },
};
