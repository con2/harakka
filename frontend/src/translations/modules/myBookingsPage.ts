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
    },
    toast: {
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
    },
  },
};
