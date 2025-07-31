export const orgLocationManagement = {
  // OrganizationLocations Page
  page: {
    title: {
      en: "Organization Locations",
      fi: "Organisaation sijainnit",
    },
    noAccess: {
      title: {
        en: "Organization Locations",
        fi: "Organisaation sijainnit",
      },
      message: {
        en: "You don't have permission to manage locations in any organization. Please contact your administrator.",
        fi: "Sinulla ei ole oikeuksia hallita sijainteja missään organisaatiossa. Ota yhteyttä järjestelmänvalvojaan.",
      },
    },
    selector: {
      title: {
        en: "Select Organization",
        fi: "Valitse organisaatio",
      },
      description: {
        en: "Choose which organization's locations you want to manage",
        fi: "Valitse, minkä organisaation sijainteja haluat hallita",
      },
      placeholder: {
        en: "Select an organization",
        fi: "Valitse organisaatio",
      },
    },
    error: {
      en: "Error loading locations: {error}",
      fi: "Virhe sijaintien lataamisessa: {error}",
    },
  },

  // OrgLocationManagement Component
  header: {
    description: {
      en: "Manage storage locations for this organization",
      fi: "Hallitse tämän organisaation varastosijainteja",
    },
    addButton: {
      en: "Add Location",
      fi: "Lisää sijainti",
    },
    addFirstButton: {
      en: "Add First Location",
      fi: "Lisää ensimmäinen sijainti",
    },
  },
  locationCard: {
    address: {
      en: "Address",
      fi: "Osoite",
    },
    organization: {
      en: "Organization",
      fi: "Organisaatio",
    },
    created: {
      en: "Created",
      fi: "Luotu",
    },
    editButton: {
      en: "Edit",
      fi: "Muokkaa",
    },
    deleteButton: {
      en: "Delete",
      fi: "Poista",
    },
    noAddress: {
      en: "No address available",
      fi: "Osoitetta ei ole saatavilla",
    },
  },
  status: {
    active: {
      en: "Active",
      fi: "Aktiivinen",
    },
    inactive: {
      en: "Inactive",
      fi: "Ei aktiivinen",
    },
  },
  emptyState: {
    title: {
      en: "No locations found",
      fi: "Sijainteja ei löytynyt",
    },
    description: {
      en: "This organization doesn't have any storage locations yet.",
      fi: "Tällä organisaatiolla ei ole vielä varastosijainteja.",
    },
  },

  // AddLocationModal Component
  addModal: {
    title: {
      en: "Add New Location",
      fi: "Lisää uusi sijainti",
    },
    description: {
      en: "Create a new storage location for this organization",
      fi: "Luo uusi varastosijainti tälle organisaatiolle",
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
      isActive: {
        label: {
          en: "Active Location",
          fi: "Aktiivinen sijainti",
        },
        description: {
          en: "Whether this location is currently active",
          fi: "Onko tämä sijainti tällä hetkellä aktiivinen",
        },
      },
    },
    labels: {
      address: {
        en: "Address",
        fi: "Osoite",
      },
      coordinates: {
        en: "Coordinates",
        fi: "Koordinaatit",
      },
      status: {
        en: "Status",
        fi: "Tila",
      },
      activeLocation: {
        en: "Active Location",
        fi: "Aktiivinen sijainti",
      },
    },
    buttons: {
      create: {
        en: "Create Location",
        fi: "Luo sijainti",
      },
      creating: {
        en: "Creating...",
        fi: "Luodaan...",
      },
      cancel: {
        en: "Cancel",
        fi: "Peruuta",
      },
    },
    messages: {
      success: {
        en: "Location created successfully!",
        fi: "Sijainti luotu onnistuneesti!",
      },
      error: {
        en: "Failed to create location",
        fi: "Sijainnin luominen epäonnistui",
      },
    },
  },

  // EditLocationModal Component
  editModal: {
    title: {
      en: "Edit Location",
      fi: "Muokkaa sijaintia",
    },
    description: {
      en: "Update the details of this storage location",
      fi: "Päivitä tämän varastosijainnin tiedot",
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
  },

  // DeleteLocationButton Component
  deleteModal: {
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
        en: "Delete",
        fi: "Poista",
      },
      deleting: {
        en: "Deleting...",
        fi: "Poistetaan...",
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
  },

  // Common validation messages
  validation: {
    required: {
      en: "This field is required",
      fi: "Tämä kenttä on pakollinen",
    },
    requiredFields: {
      en: "Name, street, city, and postcode are required",
      fi: "Nimi, katuosoite, kaupunki ja postinumero ovat pakollisia",
    },
    invalidNumber: {
      en: "Please enter a valid number",
      fi: "Syötä kelvollinen numero",
    },
  },
};
