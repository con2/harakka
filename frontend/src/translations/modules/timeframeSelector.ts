export const timeframeSelector = {
  title: {
    fi: "Valitse varausajankohta",
    en: "Select Booking Timeframe",
  },
  tooltip: {
    fi: "Valitse varausajankohta nähdäksesi saatavilla olevat tuotteet. Kaikki ostoskoriisi lisättävät tuotteet käyttävät tätä varausaikaa.",
    en: "Select a timeframe to see available items. All items in your cart will use this booking period.",
  },
  startDate: {
    label: {
      fi: "Alkupäivä",
      en: "Start Date",
    },
    placeholder: {
      fi: "Valitse alkupäivä",
      en: "Select start date",
    },
  },
  endDate: {
    label: {
      fi: "Loppupäivä",
      en: "End Date",
    },
    placeholder: {
      fi: "Valitse loppupäivä",
      en: "Select end date",
    },
  },
  clearDates: {
    fi: "Tyhjennä päivämäärät",
    en: "Clear Dates",
  },
  confirmClear: {
    fi: "Vahvista tyhjennys",
    en: "Click again to clear cart & dates",
  },
  toast: {
    warning: {
      fi: "Päivämäärien muuttaminen tyhjentää ostoskorisi. Viimeistele tai tyhjennä nykyinen varauksesi ensin.",
      en: "Changing dates will clear your cart. Please complete or clear your current booking first.",
    },
    errorSameDay: {
      fi: "Varausajan on oltava vähintään 1 päivän mittainen",
      en: "Booking must be at least 1 day long",
    },
    errorTooLong: {
      fi: "Varaus ei voi ylittää 6 viikkoa",
      en: "Booking cannot exceed 6 weeks",
    },
    errorEndBeforeStart: {
      fi: "Loppupäivän on oltava alkupäivän jälkeen",
      en: "End date must be after start date",
    },
  },
};
