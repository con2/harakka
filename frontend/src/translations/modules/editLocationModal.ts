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
        en: "Street Address",
        fi: "Katuosoite",
      },
      placeholder: {
        en: "Enter street address",
        fi: "Syötä katuosoite",
      },
    },
    city: {
      label: {
        en: "City",
        fi: "Kaupunki",
      },
      placeholder: {
        en: "Enter city",
        fi: "Syötä kaupunki",
      },
    },
    postcode: {
      label: {
        en: "Postal Code",
        fi: "Postinumero",
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
      en: "Address",
      fi: "Osoite",
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
      en: "Cancel",
      fi: "Peruuta",
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
