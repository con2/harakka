import { common } from "./common";

export const editLocationModal = {
  title: {
    en: "Edit Location",
    fi: "Muokkaa sijaintia",
  },
  description: {
    en: "Update the details of this storage location",
    fi: "Päivitä tämän varastosijainnin tiedot",
  },
  fields: {
    name: {
      label: {
        en: "Location Name",
        fi: "Sijainnin nimi",
      },
      placeholder: {
        en: "Enter location name",
        fi: "Syötä sijainnin nimi",
      },
    },
    street: {
      label: {
        en: common.personalData.street.en,
        fi: common.personalData.street.fi,
      },
      placeholder: {
        en: "Enter street address",
        fi: "Syötä katuosoite",
      },
    },
    city: {
      label: {
        en: common.personalData.city.en,
        fi: common.personalData.city.fi,
      },
      placeholder: {
        en: "Enter city",
        fi: "Syötä kaupunki",
      },
    },
    postcode: {
      label: {
        en: common.personalData.postalCode.en,
        fi: common.personalData.postalCode.fi,
      },
      placeholder: {
        en: "Enter postal code",
        fi: "Syötä postinumero",
      },
    },
    description: {
      label: {
        en: "Description",
        fi: "Kuvaus",
      },
      placeholder: {
        en: "Enter location description",
        fi: "Syötä sijainnin kuvaus",
      },
    },
    latitude: {
      label: {
        en: "Latitude",
        fi: "Leveysaste",
      },
      placeholder: {
        en: "Enter latitude (optional)",
        fi: "Syötä leveysaste (valinnainen)",
      },
    },
    longitude: {
      label: {
        en: "Longitude",
        fi: "Pituusaste",
      },
      placeholder: {
        en: "Enter longitude (optional)",
        fi: "Syötä pituusaste (valinnainen)",
      },
    },
    imageUrl: {
      label: {
        en: "Image URL",
        fi: "Kuvan URL",
      },
      placeholder: {
        en: "Enter image URL (optional)",
        fi: "Syötä kuvan URL (valinnainen)",
      },
    },
  },
  labels: {
    address: {
      en: common.personalData.address.en,
      fi: common.personalData.address.fi,
    },
    activeLocation: {
      en: "Active Location",
      fi: "Aktiivinen sijainti",
    },
  },
  validation: {
    requiredFields: {
      en: "Name, street, city, and postcode are required",
      fi: "Nimi, katuosoite, kaupunki ja postinumero ovat pakollisia",
    },
  },
  buttons: {
    save: {
      en: "Save Changes",
      fi: "Tallenna muutokset",
    },
    saving: {
      en: "Saving...",
      fi: "Tallennetaan...",
    },
    cancel: {
      en: common.cancel.en,
      fi: common.cancel.fi,
    },
  },
  messages: {
    success: {
      en: "Location updated successfully!",
      fi: "Sijainti päivitetty onnistuneesti!",
    },
    error: {
      en: "Failed to update location",
      fi: "Sijainnin päivittäminen epäonnistui",
    },
  },
};
