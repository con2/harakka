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
    contactUs: {
      fi: "Ota yhteyttä",
      en: "Contact Us",
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

  // LandingPage translations
  landingPage: {
    heading: {
      fi: "Valmiina viemään LARPisi seuraavalle tasolle?",
      en: "Ready to level up your next LARP?",
    },
    subheading: {
      fi: "Selaa varustevalikoimaamme, tee varaus verkossa ja herätä maailmasi eloon.",
      en: "Browse our gear, book online, and bring your world to life.",
    },
    button: {
      fi: "Selaa varastoa",
      en: "Browse Storage",
    },
  },

  // MyOrders translations
  myOrders: {
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
  },

  // MyProfile translations
  myProfile: {
    tabs: {
      userDetails: {
        fi: "Profiilini",
        en: "My Profile",
      },
      orders: {
        fi: "Tilaukseni",
        en: "My Orders",
      },
    },
    personalDetails: {
      title: {
        fi: "Henkilötiedot",
        en: "Personal Details",
      },
      fullName: {
        label: {
          fi: "Koko nimi",
          en: "Full Name",
        },
      },
      email: {
        label: {
          fi: "Sähköposti",
          en: "Email",
        },
      },
      phone: {
        label: {
          fi: "Puhelin",
          en: "Phone",
        },
      },
      visibleName: {
        label: {
          fi: "Näkyvä nimi",
          en: "Visible Name",
        },
      },
    },
    addresses: {
      title: {
        fi: "Osoitteet",
        en: "Addresses",
      },
      noAddresses: {
        fi: "Sinulla ei ole tallennettuja osoitteita.",
        en: "You have no saved addresses.",
      },
      defaultAddress: {
        fi: "Oletusosoite",
        en: "Default Address",
      },
      streetAddress: {
        label: {
          fi: "Katuosoite",
          en: "Street Address",
        },
        placeholder: {
          fi: "Katuosoite",
          en: "Street Address",
        },
      },
      city: {
        label: {
          fi: "Kaupunki",
          en: "City",
        },
        placeholder: {
          fi: "Kaupunki",
          en: "City",
        },
      },
      postalCode: {
        label: {
          fi: "Postinumero",
          en: "Postal Code",
        },
        placeholder: {
          fi: "Postinumero",
          en: "Postal Code",
        },
      },
      country: {
        label: {
          fi: "Maa",
          en: "Country",
        },
        placeholder: {
          fi: "Maa",
          en: "Country",
        },
      },
      type: {
        label: {
          fi: "Tyyppi",
          en: "Type",
        },
        options: {
          both: {
            fi: "Molemmat",
            en: "Both",
          },
          billing: {
            fi: "Laskutus",
            en: "Billing",
          },
          shipping: {
            fi: "Toimitus",
            en: "Shipping",
          },
        },
      },
      remove: {
        fi: "Poista",
        en: "Remove",
      },
    },
    newAddress: {
      title: {
        fi: "Uusi osoite",
        en: "New Address",
      },
      selectType: {
        fi: "Valitse tyyppi",
        en: "Select type",
      },
      save: {
        fi: "Tallenna osoite",
        en: "Save Address",
      },
      cancel: {
        fi: "Peruuta",
        en: "Cancel",
      },
    },
    buttons: {
      addNewAddress: {
        fi: "Lisää uusi osoite",
        en: "Add New Address",
      },
      saveChanges: {
        fi: "Tallenna muutokset",
        en: "Save Changes",
      },
    },
    dangerZone: {
      title: {
        fi: "Vaarallinen alue",
        en: "Danger Zone",
      },
      description: {
        fi: "Voit poistaa tilisi täältä. Tämä toiminto on pysyvä, eikä sitä voi kumota.",
        en: "You can delete your account here. This action is permanent and cannot be undone.",
      },
      deleteAccount: {
        fi: "Poista tili",
        en: "Delete Account",
      },
    },
    toast: {
      updateSuccess: {
        fi: "Profiili päivitetty onnistuneesti!",
        en: "Profile updated successfully!",
      },
      updateError: {
        fi: "Profiilin päivitys epäonnistui.",
        en: "Failed to update profile.",
      },
      addressRemoved: {
        fi: "Osoite poistettu onnistuneesti.",
        en: "Address removed successfully.",
      },
      addressRemovalError: {
        fi: "Osoitteen poisto epäonnistui.",
        en: "Failed to remove address.",
      },
      fillAllRequiredFields: {
        fi: "Täytä kaikki pakolliset kentät.",
        en: "Please fill all required fields.",
      },
      addressAddSuccess: {
        fi: "Uusi osoite lisätty.",
        en: "New address added.",
      },
      addressAddError: {
        fi: "Uuden osoitteen lisäys epäonnistui.",
        en: "Failed to add new address.",
      },
    },
    deleteUser: {
      title: {
        fi: "Poista tilisi",
        en: "Delete Your Account",
      },
      description: {
        fi: "Tämä toiminto poistaa tilisi pysyvästi. Tätä toimintoa ei voi kumota.",
        en: "This action will permanently delete your account. This action is irreversible.",
      },
      confirmText: {
        fi: "Poista",
        en: "Delete",
      },
      cancelText: {
        fi: "Peruuta",
        en: "Cancel",
      },
      success: {
        fi: "Tilisi on poistettu onnistuneesti.",
        en: "Your account has been successfully deleted.",
      },
      error: {
        fi: "Tilin poisto epäonnistui.",
        en: "Failed to delete user account.",
      },
      missingId: {
        fi: "Käyttäjätunnus puuttuu. Tiliä ei voida poistaa.",
        en: "User ID is missing. Unable to delete account.",
      },
    },
  },

  // OrderConfirmation translations
  orderConfirmation: {
    title: {
      fi: "Tilaus luotu!",
      en: "Order Created!",
    },
    message: {
      fi: "Tilauksesi on onnistuneesti vastaanotettu. Saat vahvistusviestin sähköpostiisi pian.",
      en: "Your order has been successfully placed. You will receive a confirmation email shortly.",
    },
    loading: {
      fi: "Ladataan tilauksen tietoja...",
      en: "Loading order details...",
    },
    notAvailable: {
      fi: "Tilauksen tietoja ei ole saatavilla.",
      en: "Order details not available.",
    },
    orderNumber: {
      fi: "Tilausnumero:",
      en: "Order Number:",
    },
    buttons: {
      viewOrders: {
        fi: "Näytä tilaukseni",
        en: "View My Orders",
      },
      continueBrowsing: {
        fi: "Jatka selaamista",
        en: "Continue Browsing",
      },
    },
  },

  // TimeframeSelector translations
  timeframeSelector: {
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
    toast: {
      warning: {
        fi: "Päivämäärien muuttaminen tyhjentää ostoskorisi. Viimeistele tai tyhjennä nykyinen varauksesi ensin.",
        en: "Changing dates will clear your cart. Please complete or clear your current booking first.",
      },
    },
  },

  // Unauthorized translations
  unauthorized: {
    title: {
      fi: "Pääsy estetty",
      en: "Access Denied",
    },
    message: {
      fi: "Sinulla ei ole oikeutta nähdä tätä sivua.",
      en: "You do not have permission to view this page.",
    },
  },

  // UserGuide translations
  userGuide: {
    title: {
      user: {
        fi: "Käyttöopas",
        en: "User Guide",
      },
      admin: {
        fi: "Ylläpitäjän opas",
        en: "Admin Guide",
      },
      faq: {
        fi: "Usein kysytyt kysymykset",
        en: "Frequently Asked Questions",
      },
    },
    sections: {
      getStarted: {
        title: {
          fi: "Näin aloitat",
          en: "How to Get Started",
        },
        content: {
          fi: [
            "Siirry <strong>Kirjaudu</strong> -sivulle",
            "Voit rekisteröityä tai luoda tilisi Google-sähköpostilla.",
            "Kirjautumisen jälkeen siirry <strong>Varastonimikkeet</strong> -osioon.",
            "Käytä suodattimia tarpeidesi mukaan:",
            "Etsi nimikkeitä seuraavilla perusteilla:",
          ],
          en: [
            "Go to the <strong>Login</strong> page",
            "You can register or create your account using Google email.",
            "After logging in, navigate to the <strong>Storage Items</strong> section.",
            "Use filters based on your needs:",
            "Search items by:",
          ],
        },
        filters: {
          fi: ["Hinta", "Arvosana", "Tagit"],
          en: ["Price", "Rating", "Tags"],
        },
        search: {
          fi: ["Nimi", "Kategoria", "Tagit", "Kuvaus"],
          en: ["Name", "Category", "Tags", "Description"],
        },
        dateSelection: {
          fi: "Valitse <strong>Alkamispäivä</strong> ja <strong>Loppumispäivä</strong> tarkistaaksesi saatavuuden.",
          en: "Select the <strong>Start Date</strong> and <strong>End Date</strong> to check availability.",
        },
      },
      howToOrder: {
        title: {
          fi: "Kuinka tilata",
          en: "How to Order",
        },
        content: {
          fi: [
            "Selaa varastovaihtoehtojamme, valitse tuotteet ja lisää ne ostoskoriisi.",
            "<strong>Maksuprosessi:</strong> Kassalle siirtymisen jälkeen saat laskun PDF-muodossa.",
            "<strong>Varausvahvistus:</strong> Vahvistus sisältyy laskuun.",
            "<strong>Tuotteiden nouto:</strong> Tiimimme opastaa sinua noutomenettelyissä.",
            "<strong>Tuki:</strong> Kysymyksiin löydät apua 'Ohje'-osiosta.",
          ],
          en: [
            "Browse our storage options, select the items, and add them to your cart.",
            "<strong>Payment Process:</strong> After checkout, you will receive an invoice in PDF format.",
            "<strong>Booking Confirmation:</strong> Your confirmation will be included in the invoice.",
            "<strong>Item Pick-Up:</strong> Our team will guide you on collection procedures.",
            "<strong>Support:</strong> For questions, visit the 'Help' section.",
          ],
        },
      },
      dashboard: {
        title: {
          fi: "Hallintataulun yleiskatsaus",
          en: "Dashboard Overview",
        },
        content: {
          fi: "Napsauta <strong>Ylläpitäjän paneelia</strong> hallitaksesi:",
          en: "Click on <strong>Admin Panel</strong> to manage:",
        },
        items: {
          fi: ["Tilaukset", "Tuotteet", "Tagit", "Käyttäjät", "Asetukset"],
          en: ["Orders", "Items", "Tags", "Users", "Settings"],
        },
      },
      usersTeams: {
        title: {
          fi: "Käyttäjät ja tiimit",
          en: "Users & Teams",
        },
        users: {
          fi: "<strong>Käyttäjät:</strong> Lisää, muokkaa tai poista käyttäjiä.",
          en: "<strong>Users:</strong> Add, edit, or delete users.",
        },
        teams: {
          fi: "<strong>Tiimit:</strong> Hallinnoi tiimin jäseniä ja määritä rooleja.",
          en: "<strong>Teams:</strong> Manage team members and assign roles.",
        },
        actions: {
          fi: [
            "Lisää/Muokkaa/Poista jäseniä",
            "Määritä rooleja (Ylläpitäjä tai Pääylläpitäjä)",
            "Aseta nimi, sähköposti, puhelin ja rooli",
          ],
          en: [
            "Add/Edit/Delete members",
            "Assign roles (Admin or SuperAdmin)",
            "Set Name, Email, Phone, and Role",
          ],
        },
      },
      itemManagement: {
        title: {
          fi: "Tuotteiden ja tagien hallinta",
          en: "Item & Tag Management",
        },
        items: {
          fi: "<strong>Tuotteet:</strong> Lisää, muokkaa, piilota tai poista tuotteita.",
          en: "<strong>Items:</strong> Add, edit, hide, or remove items.",
        },
        details: {
          fi: "Sisällytä tiedot kuten nimi (EN/FI), sijainti, hinta, määrä, saatavuus ja tagit.",
          en: "Include details such as name (EN/FIN), location, price, quantity, availability, and tags.",
        },
        tags: {
          fi: "<strong>Tagit:</strong> Luo/muokkaa/poista tageja sekä englanniksi että suomeksi.",
          en: "<strong>Tags:</strong> Create/edit/delete tags in both English and Finnish.",
        },
      },
      orders: {
        title: {
          fi: "Tilaukset",
          en: "Orders",
        },
        actions: {
          fi: [
            "Näytä kaikki asiakastilaukset",
            "Päivitä tilausluettelo",
            "Tarkastele tai poista tiettyjä tilauksia",
          ],
          en: [
            "View all customer orders",
            "Refresh the order list",
            "View or delete specific orders",
          ],
        },
      },
    },
    faq: {
      q1: {
        question: {
          fi: "Toimitatteko LARP-tapahtumapaikoille?",
          en: "Do you deliver to LARP event locations?",
        },
        answer: {
          fi: "Kyllä! Tarjoamme toimitus- ja noutomahdollisuuksia useimpiin suuriin LARP-tapahtumiin Suomessa.",
          en: "Yes! We offer delivery and pickup options for most major LARP events in Finland.",
        },
      },
      q2: {
        question: {
          fi: "Voinko varata tuotteita etukäteen?",
          en: "Can I reserve items in advance?",
        },
        answer: {
          fi: "Ehdottomasti. Suosittelemme varaamaan vähintään 2 viikkoa ennen tapahtumaasi varmistaaksesi saatavuuden.",
          en: "Absolutely. We recommend booking at least 2 weeks before your event to ensure availability.",
        },
      },
      q3: {
        question: {
          fi: "Mitä tapahtuu, jos jokin rikkoutuu?",
          en: "What happens if something breaks?",
        },
        answer: {
          fi: "Vahinkoja sattuu. Arvioimme vahingot tapauskohtaisesti. Jonkin verran kulumista odotetaan, tahallinen vahingoittaminen voi aiheuttaa maksuja.",
          en: "Accidents happen. We assess damage case by case. Some wear is expected, malicious damage may incur fees.",
        },
      },
      q4: {
        question: {
          fi: "Jokin muu kysymys?",
          en: "Some other question?",
        },
        answer: {
          fi: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente magni placeat sed dolorem impedit voluptates iure possimus odit quam illum omnis ipsum, earum, reiciendis blanditiis itaque esse quidem porro vero.",
          en: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente magni placeat sed dolorem impedit voluptates iure possimus odit quam illum omnis ipsum, earum, reiciendis blanditiis itaque esse quidem porro vero.",
        },
      },
    },
  },

  // Admin translations
  //AddItemModal translations
  addItemModal: {
    title: {
      fi: "Lisää uusi tuote",
      en: "Add New Item",
    },
    description: {
      details: {
        fi: "Täytä tiedot luodaksesi uuden tuotteen",
        en: "Fill in the details to create a new item",
      },
      images: {
        fi: 'Lisää kuvia tuotteelle "{name}"',
        en: 'Add images for "{name}"',
      },
      createFirst: {
        fi: "Luo ensin tuote",
        en: "Please create an item first",
      },
    },
    tabs: {
      details: {
        fi: "Tiedot",
        en: "Details",
      },
      images: {
        fi: "Kuvat",
        en: "Images",
      },
    },
    tooltips: {
      createFirst: {
        fi: "Täytä ensin tuotteen tiedot",
        en: "Please fill in item details first",
      },
    },
    labels: {
      itemNameFi: {
        fi: "Tuotteen nimi (FI)",
        en: "Item Name (FI)",
      },
      itemNameEn: {
        fi: "Tuotteen nimi (EN)",
        en: "Item Name (EN)",
      },
      itemTypeFi: {
        fi: "Tuotteen tyyppi (FI)",
        en: "Item Type (FI)",
      },
      itemTypeEn: {
        fi: "Tuotteen tyyppi (EN)",
        en: "Item Type (EN)",
      },
      descriptionFi: {
        fi: "Kuvaus (FI)",
        en: "Description (FI)",
      },
      descriptionEn: {
        fi: "Kuvaus (EN)",
        en: "Description (EN)",
      },
      location: {
        fi: "Sijainti",
        en: "Location",
      },
      price: {
        fi: "Hinta",
        en: "Price",
      },
      active: {
        fi: "Aktiivinen",
        en: "Active",
      },
      totalQuantity: {
        fi: "Kokonaismäärä",
        en: "Total Quantity",
      },
      inStorage: {
        fi: "Varastossa",
        en: "Currently In Storage",
      },
      available: {
        fi: "Saatavilla",
        en: "Available Quantity",
      },
      assignTags: {
        fi: "Määritä tagit",
        en: "Assign Tags",
      },
    },
    buttons: {
      create: {
        fi: "Luo tuote",
        en: "Create Item",
      },
      creating: {
        fi: "Luodaan...",
        en: "Creating...",
      },
      done: {
        fi: "Valmis & Sulje",
        en: "Done & Close",
      },
      back: {
        fi: "Palaa tietoihin",
        en: "Go back to details",
      },
    },
    placeholders: {
      itemFi: {
        fi: "Tuote (FI)",
        en: "Item (FI)",
      },
      itemEn: {
        fi: "Tuote (EN)",
        en: "Item (EN)",
      },
      typeFi: {
        fi: "Tuotteen tyyppi (FI)",
        en: "Item Type (FI)",
      },
      typeEn: {
        fi: "Tuotteen tyyppi (EN)",
        en: "Item Type (EN)",
      },
      descriptionFi: {
        fi: "Kuvaus (FI)",
        en: "Description (FI)",
      },
      descriptionEn: {
        fi: "Kuvaus (EN)",
        en: "Description (EN)",
      },
      selectLocation: {
        fi: "Valitse sijainti",
        en: "Select a location",
      },
    },
    messages: {
      success: {
        fi: 'Tuote "{name}" luotu onnistuneesti! Voit nyt lisätä kuvia.',
        en: 'Item "{name}" created successfully! You can now add images.',
      },
      error: {
        fi: "Tuotteen luominen epäonnistui",
        en: "Failed to create item",
      },
      closeConfirm: {
        fi: "Haluatko varmasti sulkea? Kaikki tallentamattomat kuvamuutokset menetetään.",
        en: "Are you sure you want to close? Any unsaved image changes will be lost.",
      },
    },
  },

  //addTagModal translations
  addTagModal: {
    title: {
      fi: "Luo uusi tagi",
      en: "Create a New Tag",
    },
    labels: {
      fiName: {
        fi: "Suomenkielinen nimi",
        en: "Finnish Name",
      },
      enName: {
        fi: "Englanninkielinen nimi",
        en: "English Name",
      },
    },
    placeholders: {
      fiName: {
        fi: "esim. Suosittu",
        en: "e.g. Suosittu",
      },
      enName: {
        fi: "esim. Popular",
        en: "e.g. Popular",
      },
    },
    buttons: {
      create: {
        fi: "Luo tagi",
        en: "Create Tag",
      },
      creating: {
        fi: "Luodaan...",
        en: "Creating...",
      },
    },
    messages: {
      success: {
        fi: "Tagi luotu onnistuneesti!",
        en: "Tag created successfully!",
      },
      error: {
        fi: "Tagin luominen epäonnistui",
        en: "Failed to create tag.",
      },
      validationError: {
        fi: "Vähintään yksi käännös vaaditaan.",
        en: "At least one translation is required.",
      },
    },
  },

  //addUserModal translations
  addUserModal: {
    title: {
      fi: "Lisää uusi käyttäjä",
      en: "Add New User",
    },
    labels: {
      fullName: {
        fi: "Koko nimi",
        en: "Full Name",
      },
      visibleName: {
        fi: "Näkyvä nimi",
        en: "Visible Name",
      },
      email: {
        fi: "Sähköposti",
        en: "Email",
      },
      phone: {
        fi: "Puhelin",
        en: "Phone",
      },
      password: {
        fi: "Salasana",
        en: "Password",
      },
      role: {
        fi: "Rooli",
        en: "Role",
      },
    },
    placeholders: {
      fullName: {
        fi: "Koko nimi",
        en: "Full Name",
      },
      visibleName: {
        fi: "Näkyvä nimi",
        en: "Visible Name",
      },
      email: {
        fi: "Sähköposti",
        en: "Email",
      },
      phone: {
        fi: "Puhelinnumero",
        en: "Phone Number",
      },
      password: {
        fi: "Salasana",
        en: "Password",
      },
      selectRole: {
        fi: "Valitse rooli",
        en: "Select Role",
      },
    },
    roles: {
      user: {
        fi: "Käyttäjä",
        en: "User",
      },
      admin: {
        fi: "Ylläpitäjä",
        en: "Admin",
      },
      superVera: {
        fi: "Super Vera",
        en: "Super Vera",
      },
    },
    buttons: {
      create: {
        fi: "Lisää käyttäjä",
        en: "Add User",
      },
      creating: {
        fi: "Luodaan...",
        en: "Creating...",
      },
    },
    messages: {
      success: {
        fi: "Käyttäjä {email} luotu onnistuneesti!",
        en: "User {email} created successfully!",
      },
      passwordRequired: {
        fi: "Salasana vaaditaan.",
        en: "Password is required.",
      },
      invalidEmail: {
        fi: "Virheellinen sähköpostiosoite.",
        en: "Invalid email address.",
      },
    },
  },

  //adminDashboard translations
  adminDashboard: {
    cards: {
      users: {
        fi: "Käyttäjät",
        en: "Users",
      },
      items: {
        fi: "Tuotteet",
        en: "Items",
      },
      orders: {
        fi: "Tilaukset",
        en: "Orders",
      },
    },
    sections: {
      recentOrders: {
        fi: "Viimeisimmät tilaukset",
        en: "Recent Orders",
      },
      manageOrders: {
        fi: "Hallitse tilauksia",
        en: "Manage Orders",
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
      rejected: {
        fi: "Hylätty",
        en: "Rejected",
      },
      completed: {
        fi: "Valmis",
        en: "Completed",
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
      date: {
        fi: "Päivämäärä",
        en: "Date",
      },
    },
  },

  //adminItemsTable translations
  adminItemsTable: {
    title: {
      fi: "Hallinnoi varastotuotteita",
      en: "Manage Storage Items",
    },
    filters: {
      searchPlaceholder: {
        fi: "Hae nimellä tai tyypillä",
        en: "Search by name or type",
      },
      status: {
        all: {
          fi: "Kaikki",
          en: "All",
        },
        active: {
          fi: "Aktiiviset",
          en: "Active",
        },
        inactive: {
          fi: "Ei-aktiiviset",
          en: "Inactive",
        },
      },
      tags: {
        filter: {
          fi: "Suodata tageilla",
          en: "Filter by tags",
        },
        filtered: {
          fi: "Suodatettu {count} tagilla",
          en: "Filtered by {count} tag(s)",
        },
      },
      clear: {
        fi: "Tyhjennä suodattimet",
        en: "Clear Filters",
      },
    },
    buttons: {
      addNew: {
        fi: "Lisää uusi tuote",
        en: "Add New Item",
      },
    },
    columns: {
      namefi: {
        fi: "Tuotteen nimi (FI)",
        en: "Item Name (FI)",
      },
      typefi: {
        fi: "Tuotteen tyyppi (FI)",
        en: "Item Type (FI)",
      },
      location: {
        fi: "Sijainti",
        en: "Location",
      },
      price: {
        fi: "Hinta",
        en: "Price",
      },
      quantity: {
        fi: "Määrä",
        en: "Quantity",
      },
      active: {
        fi: "Aktiivinen",
        en: "Active",
      },
      actions: {
        fi: "Toiminnot",
        en: "Actions",
      },
    },
    tooltips: {
      cantDelete: {
        fi: "Ei voida poistaa, tuotteella on varauksia",
        en: "Can't delete, it has existing bookings",
      },
    },
    messages: {
      deletion: {
        title: {
          fi: "Vahvista poistaminen",
          en: "Confirm Deletion",
        },
        description: {
          fi: "Haluatko varmasti poistaa tämän tuotteen? (Pehmeä poisto)",
          en: "Are you sure you want to delete this item? (Soft Delete)",
        },
        confirm: {
          fi: "Vahvista",
          en: "Confirm",
        },
        cancel: {
          fi: "Peruuta",
          en: "Cancel",
        },
      },
      toast: {
        deleting: {
          fi: "Poistetaan tuotetta...",
          en: "Deleting item...",
        },
        deleteSuccess: {
          fi: "Tuote on poistettu onnistuneesti.",
          en: "Item has been successfully deleted.",
        },
        deleteFail: {
          fi: "Tuotteen poistaminen epäonnistui.",
          en: "Failed to delete item.",
        },
        deleteError: {
          fi: "Virhe tuotteen poistamisessa.",
          en: "Error deleting item.",
        },
        activateSuccess: {
          fi: "Tuote aktivoitu onnistuneesti",
          en: "Item activated successfully",
        },
        deactivateSuccess: {
          fi: "Tuote deaktivoitu onnistuneesti",
          en: "Item deactivated successfully",
        },
        statusUpdateFail: {
          fi: "Tuotteen tilan päivittäminen epäonnistui",
          en: "Failed to update item status",
        },
      },
      units: {
        fi: "kpl",
        en: "pcs",
      },
    },
  },
  // adminPanel translations
  adminPanel: {
    title: {
      fi: "Ylläpitäjän paneeli",
      en: "Admin Panel",
    },
    navigation: {
      dashboard: {
        fi: "Kojelauta",
        en: "Dashboard",
      },
      orders: {
        fi: "Tilaukset",
        en: "Orders",
      },
      items: {
        fi: "Tuotteet",
        en: "Items",
      },
      tags: {
        fi: "Tagit",
        en: "Tags",
      },
      users: {
        fi: "Käyttäjät",
        en: "Users",
      },
      team: {
        fi: "Tiimi",
        en: "Team",
      },
      settings: {
        fi: "Asetukset",
        en: "Settings",
      },
    },
  },

  assignTagsModal: {
    title: {
      fi: "Määritä Tagit",
      en: "Assign Tags",
    },
    loading: {
      fi: "Ladataan tageja...",
      en: "Loading tags...",
    },
    buttons: {
      cancel: {
        fi: "Peruuta",
        en: "Cancel",
      },
      assign: {
        fi: "Määritä",
        en: "Assign",
      },
    },
    messages: {
      success: {
        fi: "Tagit määritetty onnistuneesti!",
        en: "Tags assigned successfully!",
      },
      error: {
        fi: "Tagien määrittäminen epäonnistui",
        en: "Failed to assign tags",
      },
    },
  },

  itemImageManager: {
    title: {
      uploadNew: {
        fi: "Lataa uusi kuva",
        en: "Upload New Image",
      },
      gallery: {
        fi: "Tuotteen kuvat ({count})",
        en: "Item Images ({count})",
      },
      sections: {
        main: {
          fi: "Pääkuvat ({count})",
          en: "Main Images ({count})",
        },
        thumbnail: {
          fi: "Pikkukuvat ({count})",
          en: "Thumbnail Images ({count})",
        },
        detail: {
          fi: "Yksityiskohtakuvat ({count})",
          en: "Detail Images ({count})",
        },
      },
    },
    dropzone: {
      instructions: {
        fi: "Vedä ja pudota kuva tähän tai klikkaa selataksesi",
        en: "Drag and drop an image here or click to browse",
      },
      fileInfo: {
        fi: "JPG, PNG, WebP, GIF max 5MB",
        en: "JPG, PNG, WebP, GIF up to 5MB",
      },
    },
    labels: {
      imageType: {
        fi: "Kuvan tyyppi",
        en: "Image Type",
      },
      altText: {
        fi: "Vaihtoehtoinen teksti (Saavutettavuus)",
        en: "Alt Text (Accessibility)",
      },
    },
    placeholders: {
      altText: {
        fi: "Kuvaile kuva saavutettavuutta varten",
        en: "Describe the image for accessibility",
      },
    },
    options: {
      main: {
        fi: "Pääkuva",
        en: "Main",
      },
      thumbnail: {
        fi: "Pikkukuva",
        en: "Thumbnail",
      },
      detail: {
        fi: "Yksityiskohta",
        en: "Detail",
      },
    },
    buttons: {
      upload: {
        fi: "Lataa kuva",
        en: "Upload Image",
      },
      uploading: {
        fi: "Ladataan...",
        en: "Uploading...",
      },
      deleteImage: {
        fi: "Poista",
        en: "Delete",
      },
      cancel: {
        fi: "Peruuta",
        en: "Cancel",
      },
    },
    messages: {
      uploadComplete: {
        fi: "Valmis!",
        en: "Complete!",
      },
      noImages: {
        fi: "Ei ladattuja kuvia",
        en: "No images uploaded yet",
      },
      noDescription: {
        fi: "Ei kuvausta",
        en: "No description",
      },
      validation: {
        fileType: {
          fi: "Virheellinen tiedostotyyppi. Vain JPG, PNG, WebP ja GIF ovat sallittuja.",
          en: "Invalid file type. Only JPG, PNG, WebP, and GIF are allowed.",
        },
        fileSize: {
          fi: "Tiedosto on liian suuri. Maksimikoko on {size}MB.",
          en: "File is too large. Maximum size is {size}MB.",
        },
        noFile: {
          fi: "Valitse tiedosto ladattavaksi",
          en: "Please select a file to upload",
        },
      },
      toast: {
        upload: {
          loading: {
            fi: "Ladataan kuvaa...",
            en: "Uploading image...",
          },
          success: {
            fi: "Kuva ladattu onnistuneesti!",
            en: "Image uploaded successfully!",
          },
          error: {
            fi: "Kuvan lataaminen epäonnistui",
            en: "Failed to upload image",
          },
        },
        delete: {
          loading: {
            fi: "Poistetaan kuvaa...",
            en: "Deleting image...",
          },
          success: {
            fi: "Kuva poistettu onnistuneesti!",
            en: "Image deleted successfully!",
          },
          error: {
            fi: "Kuvan poistaminen epäonnistui",
            en: "Failed to delete image",
          },
        },
        loadError: {
          fi: "Kuvien lataaminen epäonnistui. Voit silti ladata uusia.",
          en: "Failed to load images. You can still upload new ones.",
        },
      },
      deleteConfirm: {
        title: {
          fi: "Oletko varma?",
          en: "Are you sure?",
        },
        description: {
          fi: "Tätä toimintoa ei voi kumota. Kuva poistetaan pysyvästi palvelimelta.",
          en: "This action cannot be undone. This will permanently delete the image from the server.",
        },
      },
    },
  },

  orderList: {
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
      }
    },
    loading: {
      fi: "Ladataan tilauksia...",
      en: "Loading orders...",
    },
  },

  pagination: {
    previous: {
      fi: "Edellinen",
      en: "Previous",
    },
    next: {
      fi: "Seuraava",
      en: "Next",
    },
    pageInfo: {
      fi: "Sivu {page} / {total}",
      en: "Page {page} of {total}",
    },
  },

  tagAssignForm: {
    title: {
      fi: "Määritä tagit tuotteelle",
      en: "Assign Tags to Item",
    },
    buttons: {
      save: {
        fi: "Tallenna",
        en: "Save",
      },
      saving: {
        fi: "Tallennetaan...",
        en: "Saving...",
      },
    },
    messages: {
      success: {
        fi: "Tagit määritetty onnistuneesti!",
        en: "Tags assigned successfully!",
      },
      error: {
        fi: "Tagien määrittäminen epäonnistui",
        en: "Failed to assign tags",
      },
    },
    noTags: {
      fi: "Tageja ei löytynyt",
      en: "No tags found",
    },
  },

  tagDelete: {
    messages: {
      invalidId: {
        fi: "Virheellinen tagin tunnus.",
        en: "Invalid tag ID.",
      },
      generalError: {
        fi: "Virhe poistettaessa tagia.",
        en: "Error deleting tag.",
      },
    },
    confirmation: {
      title: {
        fi: "Vahvista poistaminen",
        en: "Confirm Deletion",
      },
      description: {
        fi: "Tämä poistaa tagin pysyvästi ja poistaa sen kaikista liitetyistä kohteista. Oletko varma?",
        en: "This will permanently delete the tag and remove it from all associated items. Are you sure?",
      },
      confirmText: {
        fi: "Vahvista",
        en: "Confirm",
      },
      cancelText: {
        fi: "Peruuta",
        en: "Cancel",
      },
    },
    toast: {
      loading: {
        fi: "Poistetaan tagia...",
        en: "Deleting tag...",
      },
      success: {
        fi: "Tagi on poistettu onnistuneesti.",
        en: "Tag has been successfully deleted.",
      },
      error: {
        fi: "Tagin poistaminen epäonnistui.",
        en: "Failed to delete tag.",
      },
    },
    button: {
      title: {
        fi: "Poista tagi",
        en: "Delete Tag",
      },
    },
  },

  tagDetail: {
    title: {
      fi: "Tagi:",
      en: "Tag:",
    },
    assignedItems: {
      header: {
        fi: "Liitetyt tuotteet:",
        en: "Assigned Items:",
      },
      empty: {
        fi: "Tähän tagiin ei ole liitetty tuotteita.",
        en: "No items assigned to this tag.",
      },
    },
    loading: {
      fi: "Ladataan tuotteita...",
      en: "Loading items...",
    },
  },

  tagList: {
    title: {
      fi: "Hallinnoi tageja",
      en: "Manage Tags",
    },
    filters: {
      search: {
        fi: "Hae nimellä (FI tai EN)",
        en: "Search by name (FI or EN)",
      },
      assignment: {
        all: {
          fi: "Kaikki",
          en: "All",
        },
        assigned: {
          fi: "Liitetyt",
          en: "Assigned",
        },
        unassigned: {
          fi: "Ei liitetyt",
          en: "Unassigned",
        },
      },
      clear: {
        fi: "Tyhjennä suodattimet",
        en: "Clear Filters",
      },
    },
    columns: {
      nameFi: {
        fi: "Tagin nimi (FI)",
        en: "Tag Name (FI)",
      },
      nameEn: {
        fi: "Tagin nimi (EN)",
        en: "Tag Name (EN)",
      },
      createdAt: {
        fi: "Luotu",
        en: "Created At",
      },
      assigned: {
        fi: "Liitetty",
        en: "Assigned",
      },
      assignedTo: {
        fi: "Liitetty kohteisiin",
        en: "Assigned To",
      },
      actions: {
        fi: "Toiminnot",
        en: "Actions",
      },
    },
    assignment: {
      yes: {
        fi: "Kyllä",
        en: "Yes",
      },
      no: {
        fi: "Ei",
        en: "No",
      },
      count: {
        fi: "{count} kohdetta",
        en: "{count} items",
      },
    },
    buttons: {
      add: {
        fi: "Lisää uusi tagi",
        en: "Add New Tag",
      },
      edit: {
        fi: "Muokkaa tagia",
        en: "Edit Tag",
      },
    },
    editModal: {
      title: {
        fi: "Muokkaa tagia",
        en: "Edit Tag",
      },
      labels: {
        fiName: {
          fi: "Suomalainen nimi",
          en: "Finnish Name",
        },
        enName: {
          fi: "Englantilainen nimi",
          en: "English Name",
        },
      },
      placeholders: {
        fiName: {
          fi: "Tagin nimi suomeksi",
          en: "Tag name in Finnish",
        },
        enName: {
          fi: "Tagin nimi englanniksi",
          en: "Tag name in English",
        },
      },
      buttons: {
        save: {
          fi: "Tallenna muutokset",
          en: "Save Changes",
        },
      },
      messages: {
        success: {
          fi: "Tagi päivitetty onnistuneesti",
          en: "Tag updated successfully",
        },
        error: {
          fi: "Tagin päivittäminen epäonnistui",
          en: "Failed to update tag",
        },
      },
    },
  },

  teamList: {
    title: {
      fi: "Hallinnoi tiimiä",
      en: "Manage Team",
    },
    buttons: {
      addNew: {
        fi: "Lisää uusi tiimin jäsen",
        en: "Add New Team Member",
      },
      edit: {
        fi: "Muokkaa",
        en: "Edit",
      },
    },
    columns: {
      name: {
        fi: "Nimi",
        en: "Name",
      },
      phone: {
        fi: "Puhelinnumero",
        en: "Phone",
      },
      email: {
        fi: "Sähköposti",
        en: "Email",
      },
      userSince: {
        fi: "Käyttäjä alkaen",
        en: "User Since",
      },
      role: {
        fi: "Rooli",
        en: "Role",
      },
      edit: {
        fi: "Muokkaa",
        en: "Edit",
      },
      delete: {
        fi: "Poista",
        en: "Delete",
      },
    },
    status: {
      unverified: {
        fi: "Vahvistamaton",
        en: "Unverified",
      },
      na: {
        fi: "Ei saatavilla",
        en: "N/A",
      },
    },
    loading: {
      fi: "Ladataan tiimin tietoja...",
      en: "Loading team information...",
    },
    error: {
      unauthorized: {
        fi: "Ei käyttöoikeuksia tiimin hallintaan",
        en: "No permission to manage team",
      },
    },
  },

  updateItemModal: {
    title: {
      fi: "Muokkaa tuotetta",
      en: "Edit Item",
    },
    description: {
      fi: "Päivitä tuotteen tiedot alla.",
      en: "Update item details below.",
    },
    tabs: {
      details: {
        fi: "Tiedot",
        en: "Details",
      },
      images: {
        fi: "Kuvat",
        en: "Images",
      },
    },
    labels: {
      itemNameFi: {
        fi: "Tuotteen nimi (FI)",
        en: "Item Name (FI)",
      },
      itemNameEn: {
        fi: "Tuotteen nimi (EN)",
        en: "Item Name (EN)",
      },
      itemTypeFi: {
        fi: "Tuotteen tyyppi (FI)",
        en: "Item Type (FI)",
      },
      itemTypeEn: {
        fi: "Tuotteen tyyppi (EN)",
        en: "Item Type (EN)",
      },
      itemDescFi: {
        fi: "Tuotteen kuvaus (FI)",
        en: "Item Description (FI)",
      },
      itemDescEn: {
        fi: "Tuotteen kuvaus (EN)",
        en: "Item Description (EN)",
      },
      location: {
        fi: "Sijainti",
        en: "Location",
      },
      price: {
        fi: "Hinta",
        en: "Price",
      },
      active: {
        fi: "Aktiivinen",
        en: "Active",
      },
      totalQuantity: {
        fi: "Kokonaismäärä",
        en: "Total Quantity",
      },
      currentlyInStorage: {
        fi: "Varastossa",
        en: "Currently In Storage",
      },
      available: {
        fi: "Saatavilla",
        en: "Available",
      },
    },
    placeholders: {
      itemNameFi: {
        fi: "Tuote (FI)",
        en: "Item (FI)",
      },
      itemNameEn: {
        fi: "Tuote (EN)",
        en: "Item (EN)",
      },
      itemTypeFi: {
        fi: "Tuotteen tyyppi (FI)",
        en: "Item Type (FI)",
      },
      itemTypeEn: {
        fi: "Tuotteen tyyppi (EN)",
        en: "Item Type (EN)",
      },
      itemDescFi: {
        fi: "Tuotteen kuvaus (FI)",
        en: "Item Description (FI)",
      },
      itemDescEn: {
        fi: "Tuotteen kuvaus (EN)",
        en: "Item Description (EN)",
      },
      selectLocation: {
        fi: "Valitse sijainti",
        en: "Select a location",
      },
      price: {
        fi: "Hinta",
        en: "Price",
      },
      totalQuantity: {
        fi: "Kokonaismäärä",
        en: "Total quantity",
      },
      currentlyInStorage: {
        fi: "Varastossa oleva määrä",
        en: "Currently in storage",
      },
      available: {
        fi: "Saatavilla oleva määrä",
        en: "Available quantity",
      },
    },
    tags: {
      title: {
        fi: "Valitse tagit",
        en: "Assign Tags",
      },
    },
    buttons: {
      update: {
        fi: "Päivitä tuote",
        en: "Update Item",
      },
      updating: {
        fi: "Päivitetään...",
        en: "Updating...",
      },
    },
    messages: {
      success: {
        fi: "Tuote päivitetty onnistuneesti!",
        en: "Item updated successfully!",
      },
      error: {
        fi: "Tuotteen päivittäminen epäonnistui.",
        en: "Failed to update item.",
      },
    },
  },

  userEditModal: {
    title: {
      fi: "Muokkaa käyttäjää",
      en: "Edit User",
    },
    labels: {
      fullName: {
        fi: "Koko nimi",
        en: "Full Name",
      },
      email: {
        fi: "Sähköposti",
        en: "Email",
      },
      phone: {
        fi: "Puhelinnumero",
        en: "Phone Number",
      },
      role: {
        fi: "Rooli",
        en: "Role",
      },
      visibleName: {
        fi: "Näkyvä nimi",
        en: "Visible Name",
      },
      preferences: {
        fi: "Asetukset",
        en: "Preferences",
      },
      savedLists: {
        fi: "Tallennetut listat",
        en: "Saved Lists",
      },
    },
    placeholders: {
      fullName: {
        fi: "Koko nimi",
        en: "Full Name",
      },
      email: {
        fi: "Sähköposti",
        en: "Email",
      },
      phone: {
        fi: "Puhelinnumero",
        en: "Phone Number",
      },
      visibleName: {
        fi: "Näkyvä nimi",
        en: "Visible Name",
      },
      preference: {
        fi: "Syötä uusi asetus",
        en: "Enter a new preference",
      },
      selectRole: {
        fi: "Valitse rooli",
        en: "Select Role",
      },
    },
    roles: {
      admin: {
        fi: "Ylläpitäjä",
        en: "Admin",
      },
      user: {
        fi: "Käyttäjä",
        en: "User",
      },
      superVera: {
        fi: "Super Vera",
        en: "Super Vera",
      },
    },
    buttons: {
      save: {
        fi: "Tallenna muutokset",
        en: "Save Changes",
      },
      remove: {
        fi: "Poista",
        en: "Remove",
      },
      addPreference: {
        fi: "Lisää asetus",
        en: "Add Preference",
      },
    },
    messages: {
      success: {
        fi: "Käyttäjä päivitetty onnistuneesti!",
        en: "User updated successfully!",
      },
      error: {
        fi: "Käyttäjän päivitys epäonnistui. Yritä uudelleen.",
        en: "Failed to update user. Please try again.",
      },
    },
  },

  usersList: {
    title: {
      fi: "Hallinnoi käyttäjiä",
      en: "Manage Users",
    },
    filters: {
      search: {
        fi: "Hae nimellä tai sähköpostilla",
        en: "Search by name or email",
      },
      roles: {
        all: {
          fi: "Kaikki roolit",
          en: "All Roles",
        },
        user: {
          fi: "Käyttäjä",
          en: "User",
        },
        admin: {
          fi: "Ylläpitäjä",
          en: "Admin",
        },
        superVera: {
          fi: "Super Vera",
          en: "Super Vera",
        },
      },
      clear: {
        fi: "Tyhjennä suodattimet",
        en: "Clear Filters",
      },
    },
    buttons: {
      addNew: {
        fi: "Lisää uusi käyttäjä",
        en: "Add New User",
      },
    },
    columns: {
      name: {
        fi: "Nimi",
        en: "Name",
      },
      phone: {
        fi: "Puhelinnumero",
        en: "Phone",
      },
      email: {
        fi: "Sähköposti",
        en: "Email",
      },
      userSince: {
        fi: "Käyttäjä alkaen",
        en: "User Since",
      },
      role: {
        fi: "Rooli",
        en: "Role",
      },
      actions: {
        fi: "Toiminnot",
        en: "Actions",
      },
    },
    status: {
      unverified: {
        fi: "Vahvistamaton",
        en: "Unverified",
      },
      na: {
        fi: "Ei saatavilla",
        en: "N/A",
      },
    },
    loading: {
      fi: "Ladataan käyttäjiä...",
      en: "Loading users...",
    },
  },

  userDelete: {
    messages: {
      invalidId: {
        fi: "Virheellinen käyttäjän tunnus.",
        en: "Invalid user ID.",
      },
      generalError: {
        fi: "Virhe poistettaessa käyttäjää.",
        en: "Error deleting user.",
      },
    },
    confirmation: {
      title: {
        fi: "Vahvista käyttäjän poistaminen",
        en: "Confirm User Deletion",
      },
      description: {
        fi: "Tämä poistaa käyttäjän ja kaikki hänen tietonsa pysyvästi. Tätä toimintoa ei voi kumota. Oletko varma?",
        en: "This will permanently delete the user and all their data. This action cannot be undone. Are you sure?",
      },
      confirmText: {
        fi: "Poista käyttäjä",
        en: "Delete User",
      },
      cancelText: {
        fi: "Peruuta",
        en: "Cancel",
      },
    },
    toast: {
      loading: {
        fi: "Poistetaan käyttäjää...",
        en: "Deleting user...",
      },
      success: {
        fi: "Käyttäjä poistettu onnistuneesti.",
        en: "User deleted successfully.",
      },
      error: {
        fi: "Käyttäjän poistaminen epäonnistui.",
        en: "Failed to delete user.",
      },
    },
    button: {
      title: {
        fi: "Poista käyttäjä",
        en: "Delete User",
      },
    },
  },
};
