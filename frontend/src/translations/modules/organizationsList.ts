export const organizationList = {
  title: {
    fi: "Hallinnoi organisaatioita",
    en: "Manage Organizations",
  },
  createButton: {
    fi: "Luo organisaatio",
    en: "Create Organization",
  },
  filters: {
    search: {
      fi: "Hae organisaation nimeä",
      en: "Search organization name",
    },
  },
  columns: {
    name: {
      fi: "Nimi",
      en: "Name",
    },
    slug: {
      fi: "Slug",
      en: "Slug",
    },
    description: {
      fi: "Kuvaus",
      en: "Description",
    },
    isActive: {
      fi: "Aktiivinen",
      en: "Active",
    },
    createdAt: {
      fi: "Luotu",
      en: "Created At",
    },
  },
  values: {
    isActive: {
      yes: {
        fi: "Kyllä",
        en: "Yes",
      },
      no: {
        fi: "Ei",
        en: "No",
      },
    },
  },
  modal: {
    title: {
      fi: "Organisaatio",
      en: "Organization",
    },
    labels: {
      name: {
        fi: "Nimi",
        en: "Name",
      },
      slug: {
        fi: "Slug",
        en: "Slug",
      },
      description: {
        fi: "Kuvaus",
        en: "Description",
      },
    },
    placeholders: {
      name: {
        fi: "esim. Ropecon ry",
        en: "e.g. Ropecon ry",
      },
      description: {
        fi: "Valinnainen",
        en: "Optional",
      },
    },
    buttons: {
      cancel: {
        fi: "Peruuta",
        en: "Cancel",
      },
      save: {
        fi: "Tallenna",
        en: "Save",
      },
    },
  },
  validation: {
    nameRequired: {
      fi: "Nimi on pakollinen",
      en: "Name is required",
    },
  },
  toasts: {
    created: {
      fi: "Organisaatio luotu!",
      en: "Organization created!",
    },
    updated: {
      fi: "Organisaatio päivitetty!",
      en: "Organization updated!",
    },
    creationFailed: {
      fi: "Organisaation luonti epäonnistui.",
      en: "Failed to create organization.",
    },
  },
  messages: {
    created: {
      fi: "Organisaatio luotu!",
      en: "Organization created!",
    },
    updated: {
      fi: "Organisaatio päivitetty!",
      en: "Organization updated!",
    },
    failed: {
      fi: "Organisaation luominen epäonnistui.",
      en: "Failed to create organization.",
    },
  },
  view: {
    fi: "Näytä",
    en: "View",
  },
};

export const organizationDelete = {
  button: {
    title: {
      en: "Delete organization",
      fi: "Poista organisaatio",
    },
  },
  confirmation: {
    title: {
      en: "Are you sure?",
      fi: "Oletko varma?",
    },
    description: {
      en: "This will permanently delete the organization.",
      fi: "Tämä poistaa organisaation pysyvästi.",
    },
    confirmText: {
      en: "Delete",
      fi: "Poista",
    },
    cancelText: {
      en: "Cancel",
      fi: "Peruuta",
    },
  },
  toast: {
    loading: {
      en: "Deleting organization...",
      fi: "Poistetaan organisaatiota...",
    },
    success: {
      en: "Organization deleted successfully.",
      fi: "Organisaatio poistettu onnistuneesti.",
    },
    error: {
      en: "Failed to delete organization.",
      fi: "Organisaation poistaminen epäonnistui.",
    },
  },
  messages: {
    invalidId: {
      en: "Invalid organization ID.",
      fi: "Virheellinen organisaation tunnus.",
    },
    generalError: {
      en: "Something went wrong.",
      fi: "Jotain meni pieleen.",
    },
  },
};
