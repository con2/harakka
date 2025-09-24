import { common } from "./common";

export const bookingList = {
  title: {
    fi: "Hallinnoi tilauksia",
    en: "Manage Bookings",
  },
  filters: {
    search: {
      fi: "Hae tilausnumeroa tai asiakasta",
      en: "Search booking # or customer name",
    },
    status: {
      all: {
        fi: "Kaikki tilat",
        en: "All statuses",
      },
      pending: {
        fi: "Käsittelyssä",
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
      rejected: {
        fi: "Hylätty",
        en: "Rejected",
      },
      completed: {
        fi: "Valmis",
        en: "Completed",
      },
      picked_up: {
        fi: "Noudettu",
        en: "Picked up",
      },
      returned: {
        fi: "Palautettu",
        en: "Returned",
      },
    },
    clear: {
      fi: "Tyhjennä suodattimet",
      en: "Clear Filters",
    },
    filterBy: {
      fi: "Suodata",
      en: "Filter by",
    },
    recent: {
      fi: "Viimeisimmät",
      en: "Latest",
    },
    upcoming: {
      fi: "Lähitulevaisuus",
      en: "Upcoming",
    },
  },
  columns: {
    bookingNumber: {
      fi: "Tilaus #",
      en: "Booking #",
    },
    customer: {
      fi: "Asiakas",
      en: "Customer",
    },
    status: {
      fi: common.status.fi,
      en: common.status.en,
    },
    bookingDate: {
      fi: "Tilauspäivä",
      en: "Booking Date",
    },
    startDate: {
      fi: "Aloituspäivä",
      en: "Start Date",
    },
  },
  buttons: {
    refresh: {
      fi: "Päivitä tilaukset",
      en: "Refresh Bookings",
    },
    viewDetails: {
      fi: "Näytä tiedot",
      en: "View Details",
    },
    return: {
      fi: "Merkitse palautetuiksi",
      en: "Mark Items Returned",
    },
    delete: {
      fi: "Poista tilaus",
      en: "Delete Booking",
    },
    reject: {
      fi: "Hylkää tilaus",
      en: "Reject Booking",
    },
    pickedUp: {
      fi: "Merkitse noudetuksi",
      en: "Mark as Picked Up",
    },
  },
  status: {
    unknown: {
      fi: "Tuntematon",
      en: "Unknown",
    },
    onBehalfOf: {
      fi: "organisaation puolesta",
      en: "on behalf of",
    },
  },
  modal: {
    customer: {
      fi: "Asiakas",
      en: "Customer",
    },
    bookingInfo: {
      fi: "Tilaustiedot",
      en: "Booking Information",
    },
    status: {
      fi: common.status.fi,
      en: common.status.en,
    },
    date: {
      fi: "Päivämäärä:",
      en: "Date:",
    },
    bookingItems: {
      // moved detailed booking item and modal button texts to bookingDetailsPage
      columns: {
        item: { fi: "", en: "" },
        quantity: { fi: "", en: "" },
        startDate: { fi: "", en: "" },
        endDate: { fi: "", en: "" },
        status: { fi: "", en: "" },
      },
      buttons: {},
    },
  },
  loading: {
    fi: "Ladataan tilauksia...",
    en: "Loading bookings...",
  },
};
