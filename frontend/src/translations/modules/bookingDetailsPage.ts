export const bookingDetailsPage = {
  title: {
    fi: "Varauksen tiedot",
    en: "Booking Details",
  },
  buttons: {
    back: {
      fi: "Takaisin",
      en: "Back",
    },
  },
  tooltip: {
    self_pickup: {
      en: "Allow user to pick up items themselves for selected locations. If enabled, the items are marked as picked up by the user instead of an admin.",
      fi: "Salli käyttäjän noutaa tuotteet itse valituista sijainneista. Jos tämä on käytössä, tuotteet merkitään noudetuiksi käyttäjän toimesta hallinnoijan sijaan.",
    },
  },
  selfPickup: {
    en: "Allow Self-Pickup",
    fi: "Salli itsepalautus",
  },
  status: {
    fi: "Tila",
    en: "Status",
  },
  info: {
    fi: "Varauksessa olevien kohteiden kokonaismäärä:",
    en: "Total number of items in booking:",
  },
  dateRange: {
    fi: "Vuokra-aika:",
    en: "Rental period:",
  },
  copy: {
    title: {
      fi: "Kopioi sähköposti",
      en: "Copy email",
    },
    copied: {
      fi: "Kopioitu",
      en: "Copied",
    },
  },
  modal: {
    bookingDetails: {
      fi: "Varauksen tiedot",
      en: "Booking Details for",
    },
    date: {
      fi: "Päivämäärä",
      en: "Date",
    },
    bookingItems: {
      columns: {
        item: {
          fi: "Tuote",
          en: "Item",
        },
        quantity: {
          fi: "Määrä",
          en: "Quantity",
        },
        startDate: {
          fi: "Alkaa",
          en: "Start Date",
        },
        endDate: {
          fi: "Päättyy",
          en: "End Date",
        },
        status: {
          fi: "Tila",
          en: "Status",
        },
      },
    },
    buttons: {
      confirmDisabled: {
        fi: "Valitse kohde vahvistaaksesi",
        en: "Select an item to confirm",
      },
      confirmItem: {
        fi: "Vahvista 1 kohde",
        en: "Confirm 1 item",
      },
      confirmAll: {
        fi: "Vahvista kaikki",
        en: "Confirm all",
      },
      confirmItems: {
        fi: "Vahvista valitut",
        en: "Confirm selected",
      },
      rejectDisabled: {
        fi: "Valitse kohde hylätaksesi",
        en: "Select an item to reject",
      },
      rejectItem: {
        fi: "Hylkää 1 kohde",
        en: "Reject 1 item",
      },
      rejectAll: {
        fi: "Hylkää kaikki",
        en: "Reject all",
      },
      rejectItems: {
        fi: "Hylkää valitut",
        en: "Reject selected",
      },
      pickUpAll: {
        en: "Mark all as picked up",
        fi: "Merkitse kaikki noudetuiksi",
      },
      pickUpSome: {
        en: "Mark {amount} items as picked up",
        fi: "Merkitse {amount} tuotetta noudetuksi",
      },
      returnAll: {
        en: "Mark all as returned",
        fi: "Merkitse kaikki palautetuiksi",
      },
      returnSome: {
        en: "Mark {amount} items as returned",
        fi: "Merkitse {amount} tuotetta palautetuksi",
      },
      cancelAll: {
        en: "Mark all as cancelled",
        fi: "Merkitse kaikki peruutetuiksi",
      },
      cancelSome: {
        en: "Mark {amount} items as cancelled",
        fi: "Merkitse {amount} tuotetta perutetuiksi",
      },
    },
  },
  toast: {
    selfPickup: {
      enabled: {
        en: "Self-pickup was successfully enabled!",
        fi: "Itsepalautus otettu käyttöön!",
      },
      disabled: {
        en: "Self-pickup was successfully disabled!",
        fi: "Itsepalautus poistettu käytöstä!",
      },
      failed: {
        en: "Failed to update pickup status.",
        fi: "Nouto-asetuksen päivitys epäonnistui.",
      },
      loading: {
        en: "Updating pickup status...",
        fi: "Päivitetään nouto-asetusta...",
      },
    },
  },
};
