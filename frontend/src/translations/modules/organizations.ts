import { common } from "../modules/common";

export const organizations = {
  title: {
    fi: "Hallinnoi organisaatioita",
    en: "Manage Organizations",
  },
  createButton: {
    fi: "Luo organisaatio",
    en: "Create Organization",
  },
  columns: {
    logo: {
      fi: "Logo",
      en: "Logo",
    },
    name: {
      fi: common.personalData.name.fi,
      en: common.personalData.name.en,
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
      fi: common.active.fi,
      en: common.active.en,
    },
    createdAt: {
      fi: "Luotu",
      en: "Created At",
    },
  },
  values: {
    isActive: {
      yes: {
        fi: common.yes.fi,
        en: common.yes.en,
      },
      no: {
        fi: common.no.fi,
        en: common.no.en,
      },
    },
  },
  modal: {
    title: {
      fi: common.organizations.organization.fi,
      en: common.organizations.organization.en,
    },
    labels: {
      name: {
        fi: common.personalData.name.fi,
        en: common.personalData.name.en,
      },
      slug: {
        fi: "Slug",
        en: "Slug",
      },
      description: {
        fi: "Kuvaus",
        en: "Description",
      },
      active: {
        fi: common.active.fi,
        en: common.active.en,
      },
      createdBy: {
        fi: "Luonut",
        en: "Created by",
      },
      updatedBy: {
        fi: "Päivittänyt",
        en: "Updated by",
      },
      createdAt: {
        fi: "Luotu",
        en: "Created at",
      },
      updatedAt: {
        fi: "Päivitetty",
        en: "Updated at",
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
        fi: common.cancel.fi,
        en: common.cancel.en,
      },
      save: {
        fi: common.save.fi,
        en: common.save.en,
      },
      close: {
        fi: common.close.fi,
        en: common.close.en,
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
    activateSuccess: {
      fi: "Organisaatio aktivoitu onnistuneesti",
      en: "Organization activated successfully",
    },
    deactivateSuccess: {
      fi: "Organisaatio deaktivoitu onnistuneesti",
      en: "Organization deactivated successfully",
    },
    statusUpdateError: {
      fi: "Tilan päivitys epäonnistui",
      en: "Failed to update status",
    },
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
      en: common.delete.en,
      fi: common.delete.fi,
    },
    cancelText: {
      en: common.cancel.en,
      fi: common.cancel.fi,
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
