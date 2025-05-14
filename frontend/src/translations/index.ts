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

  // PasswordReset translations
  passwordReset: {
    title: {
      fi: "Nollaa salasana",
      en: "Reset Password",
    },
    updating: {
      fi: "Päivitetään salasanaasi...",
      en: "Updating your password...",
    },
    errors: {
      emptyPassword: {
        fi: "Salasanakenttä on tyhjä tai sitä ei löydy",
        en: "Password field not found or empty",
      },
      noToken: {
        fi: "URL:ssa ei ole pääsytunnistetta",
        en: "No access token found in URL",
      },
      updateFailed: {
        fi: "Virhe salasanan päivityksessä",
        en: "Error updating password",
      },
      unexpected: {
        fi: "Tapahtui odottamaton virhe",
        en: "An unexpected error occurred",
      },
    },
    // Auth UI translations for update_password view
    auth_ui: {
      password_label: {
        fi: "Uusi salasana",
        en: "New Password",
      },
      password_input_placeholder: {
        fi: "Syötä uusi salasanasi",
        en: "Enter your new password",
      },
      button_label: {
        fi: "Päivitä salasana",
        en: "Update Password",
      },
    },
  },

  // PasswordResetResult translations
  passwordResetResult: {
    success: {
      title: {
        fi: "Salasanan nollaus onnistui",
        en: "Password Reset Successful",
      },
      description: {
        fi: "Salasanasi on nollattu onnistuneesti. Voit nyt käyttää uutta salasanaasi tilillesi kirjautumiseen.",
        en: "Your password has been reset successfully. You can now use your new password to access your account.",
      },
      button: {
        fi: "Siirry etusivulle",
        en: "Go to Dashboard",
      },
    },
    error: {
      title: {
        fi: "Salasanan nollaus epäonnistui",
        en: "Password Reset Failed",
      },
      description: {
        fi: "Pyydä uusi salasanan nollauslinkki.",
        en: "Please request a new password reset link.",
      },
      linkExpired: {
        fi: "Linkki on vanhentunut tai virheellinen",
        en: "Link has expired or is invalid",
      },
      button: {
        fi: "Takaisin kirjautumissivulle",
        en: "Back to Login",
      },
    },
  },

  // Cart translations
  cart: {
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
        en: "Review your cart before checkout",
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
        en: "Order Summary",
      },
      subtotal: {
        fi: "Tuotteet yhteensä:",
        en: "Items subtotal:",
      },
      rentalPeriod: {
        fi: "Vuokra-aika:",
        en: "Rental period:",
      },
      total: {
        fi: "Yhteensä:",
        en: "Total:",
      },
    },
    buttons: {
      checkout: {
        fi: "Kassalle",
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
        en: "Please log in to complete your order",
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
      creatingOrder: {
        fi: "Luodaan tilaustasi...",
        en: "Creating your order...",
      },
      orderCreated: {
        fi: "Tilaus luotu onnistuneesti!",
        en: "Order created successfully!",
      },
      orderError: {
        fi: "Virhe: ",
        en: "Error: ",
      },
      checkoutError: {
        fi: "Tilausvirhe: ",
        en: "Checkout error: ",
      },
    },
  },

  // ContactForm translations
  contactForm: {
    title: {
      fi: "Ota yhteyttä",
      en: "Contact Us",
    },
    email: {
      label: {
        fi: "Sähköpostiosoitteesi",
        en: "Your Email",
      },
      placeholder: {
        fi: "sinä@esimerkki.fi",
        en: "you@example.com",
      },
    },
    subject: {
      label: {
        fi: "Aihe",
        en: "Subject",
      },
      placeholder: {
        fi: "Viestisi aihe",
        en: "Subject of your message",
      },
    },
    message: {
      label: {
        fi: "Viesti",
        en: "Message",
      },
      placeholder: {
        fi: "Kirjoita viestisi tähän...",
        en: "Your message...",
      },
    },
    button: {
      sending: {
        fi: "Lähetetään...",
        en: "Sending...",
      },
      send: {
        fi: "Lähetä viesti",
        en: "Send Message",
      },
    },
    toast: {
      success: {
        fi: "Viesti lähetetty onnistuneesti!",
        en: "Message sent successfully!",
      },
      error: {
        fi: "Viestin lähetys epäonnistui.",
        en: "Failed to send message.",
      },
      serverError: {
        fi: "Palvelinvirhe.",
        en: "Server error.",
      },
      genericError: {
        fi: "Jotain meni vikaan.",
        en: "Something went wrong.",
      },
    },
  },

  // Footer translations
  footer: {
    sections: {
      shop: {
        title: {
          fi: "KAUPPA",
          en: "SHOP",
        },
        links: {
          products: {
            fi: "Tuotteet",
            en: "Products",
          },
          cart: {
            fi: "Ostoskori",
            en: "Cart",
          },
          checkout: {
            fi: "Kassa",
            en: "Checkout",
          },
        },
      },
      about: {
        title: {
          fi: "TIETOA",
          en: "ABOUT",
        },
        links: {
          userGuides: {
            fi: "Käyttöohjeet",
            en: "User Guides",
          },
          privacyPolicy: {
            fi: "Tietosuojakäytäntö",
            en: "Privacy Policy",
          },
          termsOfUse: {
            fi: "Käyttöehdot",
            en: "Terms of Use",
          },
        },
      },
      stayUpdated: {
        title: {
          fi: "PYSY AJAN TASALLA",
          en: "STAY UP TO DATE",
        },
        description: {
          fi: "Ole ensimmäinen, joka tietää uusista LARP-tapahtumista, tuotteista tai paikoista Suomessa:",
          en: "Be the first to know about new LARP events, products, or venues in Finland:",
        },
        newsletter: {
          fi: "Tilaa uutiskirjeemme",
          en: "Subscribe to our newsletter",
        },
        followUs: {
          fi: "SEURAA MEITÄ",
          en: "FOLLOW US ON",
        },
      },
    },
    copyright: {
      fi: "Kaikki oikeudet pidätetään.",
      en: "All rights reserved.",
    },
  },
};
