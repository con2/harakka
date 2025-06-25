export const orderList = {
  title: {
    fi: "Hallinnoi tilauksia",
    en: "Manage Orders",
  },
  filters: {
    search: {
      fi: "Hae tilausnumeroa tai asiakasta",
      en: "Search order # or customer name",
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
      cancelledByUser: {
        fi: "Käyttäjän peruuttama",
        en: "Cancelled by user",
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
    orderNumber: {
      fi: "Tilaus #",
      en: "Order #",
    },
    customer: {
      fi: "Asiakas",
      en: "Customer",
    },
    status: {
      fi: "Tila",
      en: "Status",
    },
    orderDate: {
      fi: "Tilauspäivä",
      en: "Order Date",
    },
    dateRange: {
      fi: "Aika",
      en: "Booking Time",
    },
    total: {
      fi: "Summa",
      en: "Total",
    },
    invoice: {
      invoiceStatus: {
        sent: {
          fi: "Lähetetty",
          en: "Invoice Sent",
        },
        paid: {
          fi: "Maksettu",
          en: "Paid",
        },
        rejected: {
          fi: "Maksu hylätty",
          en: "Payment Rejected",
        },
        overdue: {
          fi: "Erääntynyt",
          en: "Overdue",
        },
        NA: {
          fi: "N/A",
          en: "N/A",
        },
      },
      fi: "Lasku",
      en: "Invoice",
    },
    actions: {
      fi: "Toiminnot",
      en: "Actions",
    },
  },
  buttons: {
    refresh: {
      fi: "Päivitä tilaukset",
      en: "Refresh Orders",
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
      en: "Delete Order",
    },
    reject: {
      fi: "Hylkää tilaus",
      en: "Reject Order",
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
    cancelledByUser: {
      fi: "Käyttäjän peruuttama",
      en: "Cancelled by user",
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
    na: {
      fi: "Ei saatavilla",
      en: "N/A",
    },
    pickedUp: {
      fi: "Noudettu",
      en: "Picked Up",
    },
  },
  modal: {
    customer: {
      fi: "Asiakas",
      en: "Customer",
    },
    orderInfo: {
      fi: "Tilaustiedot",
      en: "Order Information",
    },
    status: {
      fi: "Tila:",
      en: "Status:",
    },
    date: {
      fi: "Päivämäärä:",
      en: "Date:",
    },
    orderItems: {
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
        subtotal: {
          fi: "Välisumma",
          en: "Subtotal",
        },
      },
    },
    buttons: {
      confirm: {
        fi: "Vahvistaa",
        en: "Confirm",
      },
      reject: {
        fi: "Hylkää",
        en: "Reject",
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
    },
  },
  loading: {
    fi: "Ladataan tilauksia...",
    en: "Loading orders...",
  },
};
