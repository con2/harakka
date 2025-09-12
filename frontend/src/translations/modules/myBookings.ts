export const myBookings = {
  loading: {
    fi: "Ladataan tilauksiasi...",
    en: "Loading your bookings...",
  },
  error: {
    loadingError: {
      fi: "Virhe tilausten lataamisessa",
      en: "Error loading your bookings",
    },
    loginRequired: {
      fi: "Kirjaudu sisään nähdäksesi tilauksesi",
      en: "Please log in to view your bookings",
    },
    invalidContext: {
      fi: "Virheellinen konteksti. Yritä uudelleen myöhemmin",
      en: "Invalid context. Please try again later",
    },
    insufficientRole: {
      en: "You do not have permission to view bookings",
      fi: "Sinulla ei ole oikeuksia nähdä varauksia",
    },
    insufficientRoleDescription: {
      en: "Choose another role to view bookings",
      fi: "Valitse toinen rooli nähdäksesi varaukset",
    },
  },
  buttons: {
    tryAgain: {
      fi: "Yritä uudelleen",
      en: "Try Again",
    },
    browseItems: {
      fi: "Selaa varastotuotteita",
      en: "Browse Storage Items",
    },
    clearFilters: {
      fi: "Tyhjennä suodattimet",
      en: "Clear Filters",
    },
  },
  status: {
    pending: {
      fi: "Odottaa",
      en: "Pending",
    },
    confirmed: {
      fi: "Vahvistettu",
      en: "Confirmed",
    },
    cancelled: {
      fi: "Peruutettu",
      en: "Cancelled",
    },
    completed: {
      fi: "Valmis",
      en: "Completed",
    },
    rejected: {
      fi: "Hylätty",
      en: "Rejected",
    },
    picked_up: {
      fi: "Hylätty",
      en: "Picked up",
    },
    all: {
      fi: "Kaikki",
      en: "All",
    },
  },
  columns: {
    bookingNumber: {
      fi: "Tilaus #",
      en: "Booking #",
    },
    status: {
      fi: "Tila",
      en: "Status",
    },
    date: {
      fi: "Päivämäärä",
      en: "Date",
    },
    item: {
      fi: "Tuote",
      en: "Item",
    },
    quantity: {
      fi: "Määrä",
      en: "Quantity",
    },
    startDate: {
      fi: "Alkupäivä",
      en: "Start Date",
    },
    endDate: {
      fi: "Loppupäivä",
      en: "End Date",
    },
  },
  emptyState: {
    title: {
      fi: "Sinulla ei ole vielä tilauksia",
      en: "You don't have any bookings yet",
    },
    description: {
      fi: "Tilauksesi näkyvät täällä",
      en: "Items you book will appear here",
    },
  },
  bookingDetails: {
    title: {
      fi: "Tilauksen tiedot #",
      en: "Booking Details #",
    },
    description: {
      fi: "Katso yksityiskohtaiset tiedot tästä tilauksesta mukaan lukien tuotteet, päivämäärät ja tila.",
      en: "View detailed information about this booking including items, dates, and status.",
    },
    customerInfo: {
      fi: "Asiakkaan tiedot",
      en: "Customer Information",
    },
    bookingInfo: {
      fi: "Tilauksen tiedot",
      en: "Booking Information",
    },
    items: {
      fi: "Tuotteet",
      en: "Items",
    },
  },
  mobile: {
    status: {
      fi: "Tila:",
      en: "Status:",
    },
    item: {
      fi: "Tuote:",
      en: "Item:",
    },
    quantity: {
      fi: "Määrä:",
      en: "Quantity:",
    },
    start: {
      fi: "Alku:",
      en: "Start:",
    },
    end: {
      fi: "Loppu:",
      en: "End:",
    },
  },
  filter: {
    searchPlaceholder: {
      fi: "Hae tilausnumerolla",
      en: "Search booking #",
    },
    all: {
      fi: "Kaikki tilat",
      en: "All statuses",
    },
  },
  edit: {
    title: {
      fi: "Muokkaa tilausta #",
      en: "Edit Booking #",
    },
    description: {
      fi: "Muokkaa määriä, päivämääriä tai peruuta tuotteita tässä tilauksessa.",
      en: "Modify quantities, dates, or cancel items in this booking.",
    },
    item: {
      fi: "Tuote",
      en: "Item",
    },
    quantity: {
      fi: "Määrä",
      en: "Qty",
    },
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
