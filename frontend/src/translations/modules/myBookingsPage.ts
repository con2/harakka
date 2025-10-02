import { common } from "./common";

export const myBookingsPage = {
  title: {
    en: "My Bookings",
    fi: "Omat varaukset",
  },
  buttons: {
    back: {
      en: common.back.en,
      fi: common.back.fi,
    },
    edit: {
      en: "Edit Booking",
      fi: "Muokkaa varausta",
    },
    pickedUp: {
      en: "Mark as Picked Up",
      fi: "Merkitse noudetuksi",
    },
    return: {
      en: "Mark Items Returned",
      fi: "Merkitse palautetuiksi",
    },
  },
  headings: {
    createdAt: {
      en: "Created at",
      fi: "Luotu",
    },
    bookingDates: {
      en: "Booking Dates",
      fi: "Varauspäivät",
    },
    availability: {
      en: "Total available to book",
      fi: "Varattavissa yhteensä",
    },
  },
  error: {
    loadingError: {
      fi: "Virhe tilausten lataamisessa",
      en: "Error loading your bookings",
    },
  },
  columns: {
    status: {
      fi: "Tila",
      en: "Status",
    },
    quantity: {
      fi: "Määrä",
      en: "Quantity",
    },
    item: {
      fi: "Tuote",
      en: "Item",
    },
    startDate: {
      fi: "Alkupäivä",
      en: "Start Date",
    },
    endDate: {
      fi: "Loppupäivä",
      en: "End Date",
    },
    actions: {
      fi: "Toiminnot",
      en: "Actions",
    },
    selfPickup: {
      fi: "Omatoiminosto",
      en: "Self-Pickup",
    },
  },
  bookingDetails: {
    title: {
      fi: "Tilauksen tiedot #",
      en: "Booking Details #",
    },
    items: {
      fi: "Tuotteet",
      en: "Items",
    },
    customerInfo: {
      fi: "Asiakastiedot",
      en: "Customer Info",
    },
    bookingInfo: {
      fi: "Tilaustiedot",
      en: "Booking Info",
    },
    orgItems: {
      fi: "tuotteet",
      en: "items",
    },
  },
  edit: {
    buttons: {
      cancel: {
        fi: "Peruuta",
        en: "Cancel",
      },
      saveChanges: {
        fi: "Tallenna muutokset",
        en: "Save Changes",
      },
    },
    confirm: {
      cancelBooking: {
        title: {
          fi: "Peruuta varaus?",
          en: "Cancel Booking?",
        },
        description: {
          fi: "Oletko varma, että haluat peruuttaa tämän varauksen? Tätä toimintoa ei voi perua.",
          en: "Are you sure you want to cancel this booking? This action cannot be undone.",
        },
        confirmText: {
          fi: "Peruuta varaus",
          en: "Cancel Booking",
        },
        cancelText: {
          fi: "Älä peruuta",
          en: "Don't Cancel",
        },
      },
      removeItem: {
        title: {
          fi: "Poista tuote varauksesta?",
          en: "Remove item from booking?",
        },
        description: {
          fi: "Oletko varma, että haluat poistaa tämän tuotteen varauksesta? Tätä toimintoa ei voi perua.",
          en: "Are you sure you want to remove this item from the booking? This action cannot be undone.",
        },
        confirmText: {
          fi: "Poista tuote",
          en: "Remove Item",
        },
        cancelText: {
          fi: "Älä poista",
          en: "Don't Remove",
        },
      },
    },
    toast: {
      noChanges: {
        en: "No changes to save",
        fi: "Ei muutoksia tallennettavaksi",
      },
      bookingUpdated: {
        fi: "Tilaus päivitetty!",
        en: "Booking updated!",
      },
      updateFailed: {
        fi: "Tilauksen päivitys epäonnistui",
        en: "Failed to update booking",
      },
      emptyCancelled: {
        fi: "Kaikki tuotteet poistettu — tilaus peruutettu",
        en: "All items removed — booking cancelled",
      },
      cancelFailed: {
        fi: "Tilauksen peruuttaminen epäonnistui",
        en: "Failed to cancel booking",
      },
      itemRemoved: {
        fi: "Tuote poistettu varauksesta",
        en: "Item removed from booking",
      },
      bookingUpdatedItemRemoved: {
        fi: "Tilaus päivitetty ja tuotteet poistettu onnistuneesti!",
        en: "Booking updated and items removed successfully!",
      },
      updatingBooking: {
        fi: "Päivitetään tilausta...",
        en: "Updating your booking...",
      },
    },
  },
  aria: {
    labels: {
      quantity: {
        decrease: {
          en: "Reduce quantity to {number}",
          fi: "Vähennä määrää arvoon {number}",
        },
        increase: {
          en: "Increase quantity to {number}",
          fi: "Lisää määrää arvoon {number}",
        },
        enterQuantity: {
          en: "Enter quantity. Current quantity {number}.",
          fi: "Anna määrä. Nykyinen määrä {number}.",
        },
      },
    },
  },
};
