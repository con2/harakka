export const t = {
  // General translations
  common: {
    add: {
      fi: "Lisää",
      en: "Add",
    },
    cancel: {
      fi: "Peruuta",
      en: "Cancel",
    },
    save: {
      fi: "Tallenna",
      en: "Save",
    },
    delete: {
      fi: "Poista",
      en: "Delete",
    },
    edit: {
      fi: "Muokkaa",
      en: "Edit",
    },
  },

  // Login related translations
  login: {
    title: {
      fi: "Kirjaudu tilillesi",
      en: "Login to your account",
    },
    resetSuccess: {
      fi: "Salasana on päivitetty onnistuneesti. Ole hyvä ja kirjaudu sisään uudella salasanallasi.",
      en: "Password has been updated successfully. Please log in with your new password.",
    },
    expiredLink: {
      fi: 'Salasanan nollauslinkki on vanhentunut. Pyydä uusi linkki käyttämällä "Unohditko salasanasi" -vaihtoehtoa alla.',
      en: 'Your password reset link has expired. Please request a new one using the "Forgot password" option below.',
    },
    login: {
      fi: "Kirjaudu sisään",
      en: "Login",
    },
    logout: {
      fi: "Kirjaudu ulos",
      en: "Logout",
    },
    // Auth UI translations
    auth_ui: {
      sign_in: {
        email_label: {
          fi: "Sähköpostiosoite",
          en: "Email Address",
        },
        email_input_placeholder: {
          fi: "Sähköpostisi",
          en: "Your email",
        },
        password_label: {
          fi: "Salasana",
          en: "Password",
        },
        password_input_placeholder: {
          fi: "Salasanasi",
          en: "Your password",
        },
        button_label: {
          fi: "Kirjaudu sisään",
          en: "Sign In",
        },
        social_provider_text: {
          fi: "Jatka palvelulla {{provider}}",
          en: "Continue with {{provider}}",
        },
        link_text: {
          fi: "Onko sinulla jo tili? Kirjaudu sisään",
          en: "Already have an account? Sign in",
        },
      },
      sign_up: {
        email_label: {
          fi: "Sähköpostiosoite",
          en: "Email Address",
        },
        email_input_placeholder: {
          fi: "Sähköpostisi",
          en: "Your email",
        },
        password_label: {
          fi: "Salasana",
          en: "Create a Password",
        },
        password_input_placeholder: {
          fi: "Salasanasi",
          en: "Your password",
        },
        button_label: {
          fi: "Rekisteröidy",
          en: "Sign Up",
        },
        link_text: {
          fi: "Eikö sinulla ole tiliä? Rekisteröidy",
          en: "Don't have an account? Sign up",
        },
      },
      forgotten_password: {
        email_label: {
          fi: "Sähköpostiosoite",
          en: "Email Address",
        },
        email_input_placeholder: {
          fi: "Sähköpostisi",
          en: "Your email",
        },
        button_label: {
          fi: "Lähetä ohjeet",
          en: "Send Instructions",
        },
        link_text: {
          fi: "Unohditko salasanasi?",
          en: "Forgot your password?",
        },
      },
      magic_link: {
        email_input_label: {
          fi: "Sähköpostiosoite",
          en: "Email Address",
        },
        email_input_placeholder: {
          fi: "Sähköpostisi",
          en: "Your email",
        },
        button_label: {
          fi: "Lähetä taikalinkkisähköposti",
          en: "Send a magic link email",
        },
        link_text: {
          fi: "Lähetä taikalinkki sähköpostitse",
          en: "Send a magic link email",
        },
      },
    },
  },

  // ItemCard translations
  itemCard: {
    timeframe: {
      fi: "Valittu varaus",
      en: "Selected booking",
    },
    viewDetails: {
      fi: "Katso tiedot",
      en: "View Details",
    },
    addedToCart: {
      fi: "lisätty koriin",
      en: "added to cart",
    },
    checkingAvailability: {
      fi: "Tarkistetaan saatavuutta...",
      en: "Checking availability...",
    },
    availabilityError: {
      fi: "Saatavuuden tarkistaminen epäonnistui",
      en: "Failed to check availability",
    },
    available: {
      fi: "Saatavilla kpl",
      en: "Available units",
    },
    selectDatesFirst: {
      fi: "Valitse ensin varauspäivät",
      en: "Please select booking dates first",
    },
    selectValidQuantity: {
      fi: "Valitse kelvollinen määrä",
      en: "Please select valid quantity",
    },
    notAvailable: {
      fi: "Ei saatavilla valitulle ajanjaksolle",
      en: "Not available for selected period",
    },
    totalUnits: {
      fi: "Yhteensä",
      en: "Total units",
    },
  },

  // ItemDetails translations
  itemDetails: {
    buttons: {
      save: {
        fi: "Tallenna",
        en: "Save",
      },
      cancel: {
        fi: "Peruuta",
        en: "Cancel",
      },
      delete: {
        fi: "Poista",
        en: "Delete",
      },
      back: {
        fi: "Takaisin",
        en: "Back",
      },
    },
    items: {
      addToCart: {
        fi: "Lisää koriin",
        en: "Add to Cart",
      },
      quantity: {
        fi: "Määrä",
        en: "Quantity",
      },
    },
    locations: {
      locationInfo: {
        fi: "Sijaintitiedot",
        en: "Location Information",
      },
      location: {
        fi: "Sijainti",
        en: "Location",
      },
      address: {
        fi: "Osoite",
        en: "Address",
      },
    },
    info: {
      noDates: {
        fi: "Varataksesi tämän tuotteen, valitse ensin varauspäivät ",
        en: "To book this item, please first select booking dates ",
      },
      here: {
        fi: "tästä",
        en: "here",
      },
      timeframe: {
        fi: "Valittu varaus",
        en: "Selected booking",
      },
    },
  },

  // ItemsList translations
  itemsList: {
    searchPlaceholder: {
      fi: "Hae tuotteita nimellä, kategorialla, tageilla tai kuvauksella",
      en: "Search items by name, category, tags, or description",
    },
    noItemsFound: {
      fi: "Tuotteita ei löytynyt",
      en: "No items found",
    },
    error: {
      fi: "Virhe: ",
      en: "Error: ",
    },
  },

  // Navigation translations
  navigation: {
    home: {
      fi: "Etusivu",
      en: "Home",
    },
    myProfile: {
      fi: "Profiilini",
      en: "My Profile",
    },
    admin: {
      fi: "Ylläpitäjä",
      en: "Admin",
    },
    storage: {
      fi: "Varasto",
      en: "Storage",
    },
    guides: {
      fi: "Oppaat",
      en: "Guides",
    },
    toast: {
      title: {
        fi: "Vahvista uloskirjautuminen",
        en: "Confirm Logout",
      },
      description: {
        fi: "Haluatko varmasti kirjautua ulos? Tämä lopettaa nykyisen istuntosi.",
        en: "Are you sure you want to log out? This will end your current session.",
      },
      confirmText: {
        fi: "Kirjaudu ulos",
        en: "Log Out",
      },
      cancelText: {
        fi: "Peruuta",
        en: "Cancel",
      },
      success: {
        fi: "Uloskirjautuminen peruttu.",
        en: "Logout canceled.",
      },
    },
  },

  // UserPanel translations
  userPanel: {
    filters: {
      title: {
        fi: "Suodattimet",
        en: "Filters",
      },
      active: {
        fi: "aktiivinen",
        en: "active",
      },
      clearFilters: {
        fi: "Tyhjennä suodattimet",
        en: "Clear Filters",
      },
      clearAllFilters: {
        fi: "Tyhjennä kaikki suodattimet",
        en: "Clear All Filters",
      },
      closeFilters: {
        fi: "Sulje suodattimet",
        en: "Close Filters",
      },
    },
    categories: {
      showLess: {
        fi: "Näytä vähemmän",
        en: "Show less",
      },
      seeAll: {
        fi: "Näytä kaikki",
        en: "See all",
      },
    },
    availability: {
      title: {
        fi: "Saatavilla olevat tuotteet",
        en: "Items Available",
      },
      items: {
        fi: "tuotteet",
        en: "items",
      },
    },
    locations: {
      title: {
        fi: "Sijainnit",
        en: "Locations",
      },
    },
    tags: {
      title: {
        fi: "Tagit",
        en: "Tags",
      },
      unnamed: {
        fi: "Nimeämätön",
        en: "Unnamed",
      },
    },
    rating: {
      title: {
        fi: "Keskimääräinen arvosana",
        en: "Average Rating",
      },
    },
    colors: {
      title: {
        fi: "Värit",
        en: "Colors",
      },
    },
  },
};
