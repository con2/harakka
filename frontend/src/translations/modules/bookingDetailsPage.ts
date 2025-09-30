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
    onBehalfOf: {
      fi: "Varattu organisaation puolesta",
      en: "Booked on behalf of",
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
        location: {
          fi: "Sijainti",
          en: "Location",
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
  edit: {
    hasItemsFromMultipleOrgs: {
      en: "This booking contains items from multiple organizations. You can not edit the dates of this booking.",
      fi: "Tämä varaus sisältää tuotteita useista organisaatioista. Et voi muokata tämän varauksen päivämääriä.",
    },
    buttons: {
      editBooking: {
        en: "Edit Booking",
        fi: "Muokkaa varausta",
      },
      cancel: {
        en: "Cancel",
        fi: "Peruuta",
      },
      saveChanges: {
        en: "Save Changes",
        fi: "Tallenna muutokset",
      },
      checkingAvailability: {
        en: "Checking availability...",
        fi: "Tarkistetaan saatavuutta...",
      },
    },
    columns: {
      actions: {
        en: "Actions",
        fi: "Toiminnot",
      },
      availability: {
        en: "Available",
        fi: "Saatavilla",
      },
    },
    confirm: {
      saveChanges: {
        title: {
          en: "Confirm Changes",
          fi: "Vahvista muutokset",
        },
        description: {
          en: "Are you sure you want to save these changes to the booking? This action cannot be undone.",
          fi: "Haluatko varmasti tallentaa nämä muutokset varaukseen? Tätä toimintoa ei voi peruuttaa.",
        },
        confirmText: {
          en: "Save Changes",
          fi: "Tallenna muutokset",
        },
        cancelText: {
          en: "Cancel",
          fi: "Peruuta",
        },
      },
      removeItem: {
        title: {
          en: "Remove Item",
          fi: "Poista tuote",
        },
        description: {
          en: "Are you sure you want to remove this item from the booking?",
          fi: "Haluatko varmasti poistaa tämän tuotteen varauksesta?",
        },
        confirmText: {
          en: "Remove",
          fi: "Poista",
        },
        cancelText: {
          en: "Cancel",
          fi: "Peruuta",
        },
      },
      cancelBooking: {
        title: {
          en: "Cancel Entire Booking",
          fi: "Peruuta koko varaus",
        },
        description: {
          en: "Removing all items will cancel the entire booking. This action cannot be undone. Are you sure you want to proceed?",
          fi: "Kaikkien tuotteiden poistaminen peruuttaa koko varauksen. Tätä toimintoa ei voi peruuttaa. Haluatko varmasti jatkaa?",
        },
        confirmText: {
          en: "Cancel Booking",
          fi: "Peruuta varaus",
        },
        cancelText: {
          en: "Keep Editing",
          fi: "Jatka muokkausta",
        },
      },
    },
    toast: {
      itemRemoved: {
        en: "Item removed from booking",
        fi: "Tuote poistettu varauksesta",
      },
      bookingUpdated: {
        en: "Booking updated successfully",
        fi: "Varaus päivitetty onnistuneesti",
      },
      updateFailed: {
        en: "Failed to update booking",
        fi: "Varauksen päivitys epäonnistui",
      },
      noChanges: {
        en: "No changes to save",
        fi: "Ei muutoksia tallennettavaksi",
      },
      noItems: {
        en: "Cannot save booking with no items",
        fi: "Varausta ei voi tallentaa ilman tuotteita",
      },
      bookingCancelled: {
        en: "Booking has been cancelled successfully",
        fi: "Varaus on peruutettu onnistuneesti",
      },
      cancelFailed: {
        en: "Failed to cancel booking",
        fi: "Varauksen peruuttaminen epäonnistui",
      },
      orgItemsCancelled: {
        en: "All organization items have been cancelled",
        fi: "Kaikki organisaation tuotteet on peruutettu",
      },
      cancelOrgItemsFailed: {
        en: "Failed to cancel items. Please try again.",
        fi: "Tuotteiden peruuttaminen epäonnistui. Yritä uudelleen.",
      },
      itemPermanentlyRemoved: {
        en: "Item permanently removed from booking",
        fi: "Tuote poistettu pysyvästi varauksesta",
      },
      itemRemovedWillNotAppear: {
        en: "Item permanently removed. Booking will no longer appear in your dashboard.",
        fi: "Tuote poistettu pysyvästi. Varaus ei enää näy hallintapaneelissasi.",
      },
      failedToRemoveItem: {
        en: "Failed to remove item",
        fi: "Tuotteen poistaminen epäonnistui",
      },
    },
  },
  items: {
    unknownItem: {
      en: "Unknown Item",
      fi: "Tuntematon tuote",
    },
    item: {
      en: "Item",
      fi: "Tuote",
    },
  },
  confirmations: {
    removeAllItems: {
      title: {
        en: "Remove all items from booking?",
        fi: "Poistetaanko kaikki tuotteet varauksesta?",
      },
      description: {
        en: "This will permanently remove all your organization's items from this booking. The booking will no longer appear in your dashboard.",
        fi: "Tämä poistaa pysyvästi kaikki organisaatiosi tuotteet tästä varauksesta. Varaus ei enää näy hallintapaneelissasi.",
      },
      confirmText: {
        en: "Remove All Items",
        fi: "Poista kaikki tuotteet",
      },
      cancelText: {
        en: "Cancel",
        fi: "Peruuta",
      },
    },
    removeItem: {
      title: {
        en: "Permanently remove item?",
        fi: "Poistetaanko tuote pysyvästi?",
      },
      description: {
        en: "This will permanently delete this item from the booking. This action cannot be undone.",
        fi: "Tämä poistaa tuotteen pysyvästi varauksesta. Tätä toimintoa ei voi peruuttaa.",
      },
      confirmText: {
        en: "Remove Item",
        fi: "Poista tuote",
      },
      cancelText: {
        en: "Cancel",
        fi: "Peruuta",
      },
    },
    cancelOrgItems: {
      title: {
        en: "Cancel Organization Items",
        fi: "Peruuta organisaation tuotteet",
      },
      description: {
        en: "All items from your organization will be cancelled. This action cannot be undone.",
        fi: "Kaikki organisaatiosi tuotteet peruutetaan. Tätä toimintoa ei voi peruuttaa.",
      },
      confirmText: {
        en: "Cancel All Items",
        fi: "Peruuta kaikki tuotteet",
      },
      cancelText: {
        en: "Keep Editing",
        fi: "Jatka muokkausta",
      },
    },
  },
};
