export const myOrders = {
  title: {
    fi: "Tilaukseni",
    en: "My Orders",
  },
  loading: {
    fi: "Ladataan tilauksiasi...",
    en: "Loading your orders...",
  },
  error: {
    loadingError: {
      fi: "Virhe tilausten lataamisessa",
      en: "Error loading your orders",
    },
    loginRequired: {
      fi: "Kirjaudu sisään nähdäksesi tilauksesi",
      en: "Please log in to view your orders",
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
    unknown: {
      fi: "Tuntematon",
      en: "Unknown",
    },
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
    cancelledByUser: {
      fi: "Käyttäjän peruuttama",
      en: "Cancelled by user",
    },
    cancelledByAdmin: {
      fi: "Ylläpitäjän peruuttama",
      en: "Cancelled by admin",
    },
    completed: {
      fi: "Valmis",
      en: "Completed",
    },
    rejected: {
      fi: "Hylätty",
      en: "Rejected",
    },
    deleted: {
      fi: "Poistettu",
      en: "Deleted",
    },
  },
  columns: {
    orderNumber: {
      fi: "Tilaus #",
      en: "Order #",
    },
    status: {
      fi: "Tila",
      en: "Status",
    },
    date: {
      fi: "Päivämäärä",
      en: "Date",
    },
    total: {
      fi: "Yhteensä",
      en: "Total",
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
    subtotal: {
      fi: "Välisumma",
      en: "Subtotal",
    },
  },
  emptyState: {
    title: {
      fi: "Sinulla ei ole vielä tilauksia",
      en: "You don't have any orders yet",
    },
    description: {
      fi: "Tilauksesi näkyvät täällä",
      en: "Items you order will appear here",
    },
  },
  orderDetails: {
    title: {
      fi: "Tilauksen tiedot #",
      en: "Order Details #",
    },
    customerInfo: {
      fi: "Asiakkaan tiedot",
      en: "Customer Information",
    },
    orderInfo: {
      fi: "Tilauksen tiedot",
      en: "Order Information",
    },
    items: {
      fi: "Tuotteet",
      en: "Items",
    },
    total: {
      fi: "Yhteensä:",
      en: "Total:",
    },
  },
  mobile: {
    status: {
      fi: "Tila:",
      en: "Status:",
    },
    total: {
      fi: "Yhteensä:",
      en: "Total:",
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
    subtotal: {
      fi: "Välisumma:",
      en: "Subtotal:",
    },
  },
  filter: {
    searchPlaceholder: {
      fi: "Hae tilausnumerolla",
      en: "Search order #",
    },
    allStatuses: {
      fi: "Kaikki tilat",
      en: "All statuses",
    },
  },
  edit: {
    title: {
      fi: "Muokkaa tilausta #",
      en: "Edit Order #",
    },
    startDate: {
      fi: "Alkupäivä",
      en: "Start",
    },
    endDate: {
      fi: "Loppupäivä",
      en: "End",
    },
    selectStartDate: {
      fi: "Valitse alkupäivä",
      en: "Select start date",
    },
    selectEndDate: {
      fi: "Valitse loppupäivä",
      en: "Select end date",
    },
    item: {
      fi: "Tuote",
      en: "Item",
    },
    quantity: {
      fi: "Määrä",
      en: "Qty",
    },
    unnamedItem: {
      fi: "Nimeämätön tuote",
      en: "Unnamed Item",
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
      orderUpdated: {
        fi: "Tilaus päivitetty!",
        en: "Order updated!",
      },
      updateFailed: {
        fi: "Tilauksen päivitys epäonnistui",
        en: "Failed to update order",
      },
      emptyCancelled: {
        fi: "Kaikki tuotteet poistettu — tilaus peruutettu",
        en: "All items removed — order cancelled",
      },
      cancelFailed: {
        fi: "Tilauksen peruuttaminen epäonnistui",
        en: "Failed to cancel order",
      },
    },
  },
  cancel: {
    title: {
      fi: "Vahvista peruutus",
      en: "Confirm Cancellation",
    },
    description: {
      fi: "Haluatko varmasti peruuttaa tämän tilauksen?",
      en: "Are you sure you want to cancel this order?",
    },
    confirmText: {
      fi: "Peruuta tilaus",
      en: "Cancel Order",
    },
    cancelText: {
      fi: "Säilytä tilaus",
      en: "Keep Order",
    },
    toast: {
      loading: {
        fi: "Peruutetaan tilausta...",
        en: "Cancelling order...",
      },
      success: {
        fi: "Tilaus peruutettu onnistuneesti",
        en: "Order cancelled successfully",
      },
      error: {
        fi: "Tilauksen peruuttaminen epäonnistui",
        en: "Failed to cancel order",
      },
      invalidId: {
        fi: "Virheellinen tilausnumero.",
        en: "Invalid order ID.",
      },
    },
  },
};
