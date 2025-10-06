import { common } from "./common";

export const bookingList = {
  title: {
    fi: "Hallinnoi saapuvia varauksia",
    en: "Manage Incoming Bookings",
  },
  filters: {
    search: {
      fi: "Hae tilausnumeroa tai asiakasta",
      en: "Search booking number or customer name",
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
    overdue: {
      fi: "Myöhästyneet",
      en: "Overdue",
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
  aria: {
    placeholders: {
      search: {
        en: "Search booking number or customer name",
        fi: "Hae varausnumerolla tai asiakkaan nimellä",
      },
    },
    labels: {
      filters: {
        recent: {
          en: "View recently made bookings",
          fi: "Näytä viimeisimmät varaukset",
        },
        upcoming: {
          en: "View upcoming bookings",
          fi: "Näytä tulevat varaukset",
        },
        overdue: {
          en: "View overdue bookings",
          fi: "Näytä myöhästyneet varaukset",
        },
        status: {
          en: "Filter by booking status",
          fi: "Suodata varaustilan mukaan",
        },
      },
      headers: {
        bookingNumber: {
          en: "Booking number",
          fi: "Varausnumero",
        },
      },
      table: {
        row: {
          en: "View booking details of booking {booking_number} made by {user_name} between {start_date} and {end_date}",
          fi: "Näytä varauksen {booking_number} tiedot. Varauksen tekijä {user_name}, varausaika {start_date} - {end_date}.",
        },
        overdue: {
          en: "Table of overdue bookings, made to {org_name}",
          fi: "Taulukko myöhästyneistä varauksista, jotka on tehty organisaatiolle {org_name}",
        },
        list: {
          en: "Table containing bookings, made to {org_name}",
          fi: "Taulukko organisaatiolle {org_name} tehdyistä varauksista",
        },
      },
    },
  },
};
