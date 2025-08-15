import { common } from "../modules/common";

export const deleteLocationButton = {
  title: {
    en: "Delete Location",
    fi: "Poista sijainti",
  },
  description: {
    en: "Are you sure you want to delete this location? This action cannot be undone.",
    fi: "Oletko varma, että haluat poistaa tämän sijainnin? Tätä toimintoa ei voi perua.",
  },
  locationInfo: {
    en: "Location: {name}",
    fi: "Sijainti: {name}",
  },
  buttons: {
    delete: {
      en: common.delete.en,
      fi: common.delete.fi,
    },
    cancel: {
      en: "Cancel",
      fi: "Peruuta",
    },
  },
  messages: {
    loading: {
      en: "Removing location from organization...",
      fi: "Poistetaan sijaintia organisaatiosta...",
    },
    success: {
      en: "Location deleted successfully!",
      fi: "Sijainti poistettu onnistuneesti!",
    },
    error: {
      en: "Failed to delete location",
      fi: "Sijainnin poistaminen epäonnistui",
    },
  },
};
