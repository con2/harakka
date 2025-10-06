import { common } from "./common";

export const editLocationPage = {
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
      notVisibleToUsers: {
        en: "The users can only see the city name. Full address is shown after booking confirmation.",
        fi: "Käyttäjille näkyy vain kaupungin nimi. Vahvistuksen jälkeen näytetään koko osoite.",
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
      en: "Location name, street, city, and postcode are required",
      fi: "Sijainnin nimi, katuosoite, kaupunki ja postinumero ovat pakollisia",
    },
    invalidCityName: {
      en: "Please enter a valid city name (letters, spaces, and hyphens only)",
      fi: "Syötä kelvollinen kaupungin nimi (vain kirjaimia, välilyöntejä ja yhdysviivoja)",
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
    back: {
      en: common.back.en,
      fi: common.back.fi,
    },
  },
  ariaLabels: {
    backButton: {
      en: "Go back to locations",
      fi: "Palaa sijainteihin",
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
