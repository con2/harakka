export const cart = {
  empty: {
    title: {
      fi: "Ostoskorisi on tyhjä",
      en: "Your cart is empty",
    },
    description: {
      fi: "Lisää tuotteita ostoskoriisi nähdäksesi ne täällä.",
      en: "Add some items to your cart to see them here.",
    },
    browseButton: {
      fi: "Selaa varastoa",
      en: "Browse Storage",
    },
  },
  review: {
    title: {
      fi: "Tarkista ostoskorisi ennen kassalle siirtymistä",
      en: "Review your cart before booking",
    },
  },
  booking: {
    timeframe: {
      fi: "Varausajankohta",
      en: "Booking Timeframe",
    },
    day: {
      fi: "päivä",
      en: "day",
    },
    days: {
      fi: "päivää",
      en: "days",
    },
    total: {
      fi: "yhteensä",
      en: "total",
    },
    noDates: {
      fi: "Varausaikaa ei ole valittu. Valitse ensin päivämäärät.",
      en: "No booking period selected. Please select dates first.",
    },
    explanation: {
      fi: "Alla olevan painikkeen napsauttaminen ei ole sitova. Kyseessä on vain varauspyyntö – tarkistamme sen ja otamme sinuun pian yhteyttä.",
      en: "Clicking the button below is not a commitment. It's just a request — we'll review it and get back to you shortly.",
    },
  },
  item: {
    available: {
      fi: "Yhteensä saatavilla",
      en: "Total available",
    },
    units: {
      fi: "kpl",
      en: "units",
    },
  },
  summary: {
    title: {
      fi: "Tilauksen yhteenveto",
      en: "Booking Summary",
    },
    rentalPeriod: {
      fi: "Vuokra-aika",
      en: "Rental period",
    },
  },
  buttons: {
    checkout: {
      fi: "Lähetä pyyntö",
      en: "Checkout",
    },
    processing: {
      fi: "Käsitellään...",
      en: "Processing...",
    },
    clearCart: {
      fi: "Tyhjennä ostoskori",
      en: "Clear Cart",
    },
    unknownError: {
      fi: "Tuntematon virhe",
      en: "Unknown error",
    },
  },
  toast: {
    clearCartTitle: {
      fi: "Tyhjennä ostoskori",
      en: "Clear Cart",
    },
    clearCartDescription: {
      fi: "Haluatko varmasti tyhjentää ostoskorisi? Tätä toimenpidettä ei voi kumota.",
      en: "Are you sure you want to clear your cart? This action cannot be undone.",
    },
    confirmClear: {
      fi: "Kyllä, tyhjennä",
      en: "Yes, clear it",
    },
    cancelClear: {
      fi: "Ei, säilytä",
      en: "No, keep it",
    },
    cartCleared: {
      fi: "Ostoskori tyhjennetty",
      en: "Cart cleared",
    },
    cartNotCleared: {
      fi: "Ostoskoria ei tyhjennetty",
      en: "Cart not cleared",
    },
    loginRequired: {
      fi: "Kirjaudu sisään suorittaaksesi tilauksesi loppuun",
      en: "Please log in to complete your booking",
    },
    profileLoading: {
      fi: "Profiiliasi ladataan. Yritä uudelleen hetken kuluttua.",
      en: "Your profile is being loaded. Please try again in a moment.",
    },
    selectDatesAndItems: {
      fi: "Valitse päivämäärät ja lisää tuotteita ostoskoriin",
      en: "Please select dates and add items to cart",
    },
    itemsExceedQuantity: {
      fi: "Jotkin tuotteet ylittävät saatavilla olevan määrän",
      en: "Some items exceed available quantity",
    },
    itemsExceedQuantityInCart: {
      fi: "Olet ostoskorissasi tämän tuotteen määrän rajoissa. Saatavilla olevat tuotteet: ",
      en: "You’re at the limit for this item in your cart. Items available: ",
    },
    creatingBooking: {
      fi: "Luodaan varaustasi...",
      en: "Creating your booking...",
    },
    bookingCreated: {
      fi: "Varaus luotu onnistuneesti!",
      en: "Booking created successfully!",
    },
    bookingError: {
      fi: "Virhe: ",
      en: "Error: ",
    },
    profileUpdateSuccess: {
      fi: "Profiili päivitetty onnistuneesti! Voit nyt yrittää varausta uudelleen.",
      en: "Profile updated successfully! Please try booking again.",
    },
    profileUpdateError: {
      fi: "Profiilin päivittäminen epäonnistui. Yritä uudelleen.",
      en: "Failed to update profile. Please try again.",
    },
  },
  profileCompletion: {
    title: {
      fi: "Täydennä profiilisi",
      en: "Complete Your Profile",
    },
    description: {
      fi: "Anna tietosi jatkaaksesi varaustasi.",
      en: "Please provide your details to continue with your booking.",
    },
    fields: {
      fullName: {
        label: {
          fi: "Koko nimi",
          en: "Full Name",
        },
        placeholder: {
          fi: "Syötä koko nimesi",
          en: "Enter your full name",
        },
        required: {
          fi: "Koko nimi vaaditaan",
          en: "Full name is required",
        },
      },
      phone: {
        label: {
          fi: "Puhelinnumero",
          en: "Phone Number",
        },
        placeholder: {
          fi: "+358 12 345 6789",
          en: "+358 12 345 6789",
        },
        recommended: {
          fi: "(suositeltu)",
          en: "(recommended)",
        },
        description: {
          fi: "Puhelinnumeron lisääminen helpottaa varaustesi yhteydenpitoa.",
          en: "Adding a phone number helps us communicate about your bookings more easily.",
        },
      },
      address: {
        label: {
          fi: "Osoite",
          en: "Address",
        },
        optional: {
          fi: "(valinnainen)",
          en: "(optional)",
        },
        description: {
          fi: "Osoitteen lisääminen auttaa tuotteiden toimitus- ja noutojärjestelyissä.",
          en: "Adding your address helps with item delivery and pickup coordination.",
        },
        streetAddress: {
          label: {
            fi: "Katuosoite",
            en: "Street Address",
          },
          placeholder: {
            fi: "Katukatu 123",
            en: "123 Main Street",
          },
          required: {
            fi: "Katuosoite vaaditaan",
            en: "Street address is required",
          },
        },
        city: {
          label: {
            fi: "Kaupunki",
            en: "City",
          },
          placeholder: {
            fi: "Helsinki",
            en: "Helsinki",
          },
          required: {
            fi: "Kaupunki vaaditaan",
            en: "City is required",
          },
        },
        postalCode: {
          label: {
            fi: "Postinumero",
            en: "Postal Code",
          },
          placeholder: {
            fi: "00100",
            en: "00100",
          },
          required: {
            fi: "Postinumero vaaditaan",
            en: "Postal code is required",
          },
        },
        country: {
          label: {
            fi: "Maa",
            en: "Country",
          },
          placeholder: {
            fi: "Suomi",
            en: "Finland",
          },
          required: {
            fi: "Maa vaaditaan",
            en: "Country is required",
          },
        },
      },
    },
    buttons: {
      cancel: {
        fi: "Peruuta",
        en: "Cancel",
      },
      complete: {
        fi: "Täydennä profiili",
        en: "Complete Profile",
      },
      updating: {
        fi: "Päivitetään...",
        en: "Updating...",
      },
    },
    errors: {
      updateFailed: {
        fi: "Profiilin päivittäminen epäonnistui.",
        en: "An error occurred while updating your profile.",
      },
    },
  },
};
