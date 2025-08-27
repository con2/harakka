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
      cancelledByAdmin: {
        fi: "Ylläpitäjän peruuttama",
        en: "Cancelled by admin",
      },
      rejected: {
        fi: "Hylätty",
        en: "Rejected",
      },
      completed: {
        fi: "Valmis",
        en: "Completed",
      },
      deleted: {
        fi: "Poistettu",
        en: "Deleted",
      },
    },
    clear: {
      fi: "Tyhjennä suodattimet",
      en: "Clear Filters",
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
          fi: "Alkupäivä",
          en: "Start Date",
        },
        endDate: {
          fi: "Loppupäivä",
          en: "End Date",
        },
        status: {
          fi: "Tila",
          en: "Status",
        },
      },
    },
    buttons: {
      confirm: {
        fi: common.confirm.fi,
        en: common.confirm.en,
      },
      confirmItem: {
        fi: "Vahvista tuote",
        en: "Confirm Item",
      },
      confirmItems: {
        fi: "Vahvista tuotteet",
        en: "Confirm Items",
      },
      confirmAll: {
        fi: "Vahvista kaikki",
        en: "Confirm All",
      },
      confirmDisabled: {
        fi: "Vahvista",
        en: "Confirm",
      },
      reject: {
        fi: "Hylkää",
        en: "Reject",
      },
      rejectItem: {
        fi: "Hylkää tuote",
        en: "Reject Item",
      },
      rejectItems: {
        fi: "Hylkää tuotteet",
        en: "Reject Items",
      },
      rejectAll: {
        fi: "Hylkää kaikki",
        en: "Reject All",
      },
      rejectDisabled: {
        fi: "Hylkää",
        en: "Reject",
      },
      selectAll: {
        fi: "Valitse kaikki",
        en: "Select All",
      },
      allSelected: {
        fi: "Kaikki valittu",
        en: "All Selected",
      },
      deselectAll: {
        fi: "Poista valinnat",
        en: "Deselect All",
      },
      return: {
        fi: "Palautaa",
        en: "Return",
      },
      delete: {
        fi: "Poistaa",
        en: "Delete",
      },
      pickedUp: {
        fi: "Noudettu",
        en: "Picked Up",
      },
      selectedCount: {
        fi: "valittu",
        en: "selected",
      },
    },
  },
  loading: {
    fi: "Ladataan tilauksia...",
    en: "Loading bookings...",
  },
};
