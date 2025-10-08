export const addItemForm = {
  placeholders: {
    searchTags: {
      en: "Search tags",
      fi: "Hae tunnisteita",
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
    category: {
      fi: "Kategoria",
      en: "Category",
    },
    active: {
      fi: "Aktiivinen",
      en: "Active",
    },
    totalQuantity: {
      fi: "Kokonaismäärä",
      en: "Total Quantity",
    },
    placement: {
      fi: "Sijoittelun kuvaus",
      en: "Placement Description",
    },
  },
  buttons: {
    addItem: {
      en: "Add Item",
      fi: "Lisää tuote",
    },
    updateItem: {
      en: "Update Item",
      fi: "Päivitä tuote",
    },
    goToSummary: {
      en: "Go to summary",
      fi: "Siirry yhteenvetoon",
    },
    loadMoreTags: {
      en: "more",
      fi: "lisää",
    },
  },
  headings: {
    itemDetails: {
      en: "Item Details",
      fi: "Tuotteen tiedot",
    },
    assignTags: {
      en: "Assign Tags",
      fi: "Lisää tunnisteita",
    },
    addImages: {
      en: "Add Images",
      fi: "Lisää kuvia",
    },
  },
  subheadings: {
    selectedTags: {
      en: "Selected Tags",
      fi: "Valitut tunnisteet",
    },
  },
  paragraphs: {
    activeDescription: {
      en: "Users can view and book the item immediately",
      fi: "Käyttäjät voivat nähdä ja varata tuotteen heti",
    },
    tagPrompt: {
      en: "Tags help users find items using search or filter functions.",
      fi: "Tunnisteet auttavat käyttäjiä löytämään tuotteita haun tai suodattimien avulla.",
    },
    noTagsSelected: {
      en: "No tags selected.",
      fi: "Ei tageja valittuna.",
    },
    imagePrompt: {
      en: "We recommend uploading at least one image for the item.",
      fi: "Suosittelemme lisäämään vähintään yhden kuvan tuotteelle.",
    },
    unfinishedItems: {
      en: "You have unfinished items. Upload or remove these to change organization",
      fi: "Sinulla on keskeneräisiä tuotteita. Lataa tai poista ne vaihtaaksesi organisaatiota",
    },
    placementDescription: {
      en: "Describe where in the storage the item can be found",
      fi: "Kuvaile, mistä varastosta tuote löytyy",
    },
  },
  formDescription: {
    category: {
      prompt: {
        en: "Can't find a matching category?",
        fi: "Etkö löydä sopivaa kategoriaa?",
      },
      createOne: {
        en: "Create one here",
        fi: "Luo uusi tästä",
      },
      then: {
        en: "then",
        fi: "sitten",
      },
      refresh: {
        en: "refresh",
        fi: "päivitä",
      },
    },
  },
  messages: {
    validation: {
      multipleErrors: {
        en: "Incorrect values provided for {amount} fields",
        fi: "Virheellisiä arvoja annettu {amount} kentässä",
      },
      item_name: {
        too_small: {
          en: "Missing item name",
          fi: "Tuotteen nimi puuttuu",
        },
        too_big: {
          en: "Item name too long, please keep under 100 characters",
          fi: "Tuotteen nimi on liian pitkä, pituus saa olla enintään 100 merkkiä",
        },
      },
      item_description: {
        too_small: {
          en: "Missing item description",
          fi: "Tuotteen kuvaus puuttuu",
        },
        too_big: {
          en: "Item description too long, please keep under 250 characters",
          fi: "Tuotteen kuvaus on liian pitkä, pituus saa olla enintään 250 merkkiä",
        },
      },
      quantity: {
        too_small: {
          en: "The value for quantity must be at least 1",
          fi: "Määrän arvon on oltava vähintään 1",
        },
      },
      placement_description: {
        too_small: {
          en: "Missing placement description",
          fi: "Sijoittelun kuvaus puuttuu",
        },
        too_big: {
          en: "Placement description is too long, please keep it under 200 characters.",
          fi: "Sijoittelun kuvaus on liian pitkä, pituus saa olla enintään 200 merkkiä.",
        },
        invalid_type: {
          en: "Placement description is required.",
          fi: "Sijoittelun kuvaus on pakollinen.",
        },
      },
      location: {
        invalid_type: {
          en: "Location is required.",
          fi: "Sijainti on pakollinen.",
        },
        invalid_string: {
          en: "Location is invalid.",
          fi: "Sijainti on virheellinen.",
        },
      },
      category_id: {
        invalid_string: {
          en: "Category is required",
          fi: "Kategoria on pakollinen",
        },
      },
      invalid_type: {
        en: "An invalid type was provided for {field}",
        fi: "Virheellinen tyyppi annettu kentälle {field}",
      },
      invalid_input: {
        en: "Field is not valid.",
        fi: "Kenttä ei ole kelvollinen.",
      },
      images: {
        en: "An unexpected error occured with the item images. Try re-uploading them. If that does not help contact support.",
        fi: "Kuvissa tapahtui odottamaton virhe. Yritä ladata ne uudelleen. Jos se ei auta, ota yhteyttä tukeen.",
      },
    },
    error: {
      fallbackFormError: {
        en: "An unexpected error occurred. Try again, or contact support if the error persists.",
        fi: "Odottamaton virhe tapahtui. Yritä uudelleen tai ota yhteyttä tukeen, jos virhe toistuu.",
      },
    },
  },
};
