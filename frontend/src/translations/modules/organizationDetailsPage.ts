import { common } from "../modules/common";

export const organizationDetailsPage = {
  title: {
    fi: "Organisaation tiedot",
    en: "Organization Details",
  },
  createTitle: {
    fi: "Luo uusi organisaatio",
    en: "Create New Organization",
  },
  backButton: {
    fi: "Takaisin",
    en: "Back",
  },
  notFound: {
    fi: "Organisaatiota ei löytynyt",
    en: "Organization not found",
  },
  protected: {
    fi: "Suojattu",
    en: "Protected",
  },
  tooltips: {
    logoPlaceholder: {
      fi: "Logo voidaan lisätä myöhemmin organisaation luonnin jälkeen",
      en: "Logo can be added later after creating the organization",
    },
  },
  buttons: {
    edit: {
      fi: "Muokkaa",
      en: "Edit",
    },
    cancel: {
      fi: common.cancel.fi,
      en: common.cancel.en,
    },
    save: {
      fi: "Tallenna muutokset",
      en: "Save Changes",
    },
    deleteOrg: {
      fi: "Poista organisaatio",
      en: "Delete Organization",
    },
  },
  fields: {
    name: {
      fi: common.personalData.name.fi,
      en: common.personalData.name.en,
    },
    slug: {
      fi: "Tunniste",
      en: "Slug",
    },
    description: {
      fi: "Kuvaus",
      en: "Description",
    },
    noDescription: {
      fi: "Ei kuvausta annettu",
      en: "No description provided",
    },
    status: {
      fi: "Tila",
      en: "Status",
    },
    active: {
      fi: "Aktiivinen",
      en: "Active",
    },
    inactive: {
      fi: "Ei-aktiivinen",
      en: "Inactive",
    },
    createdAt: {
      fi: "Luotu",
      en: "Created At",
    },
    updatedAt: {
      fi: "Päivitetty",
      en: "Updated At",
    },
    createdBy: {
      fi: "Luonut",
      en: "Created By",
    },
    updatedBy: {
      fi: "Päivittänyt",
      en: "Updated By",
    },
  },
  toasts: {
    updateSuccess: {
      fi: "Organisaatio päivitetty!",
      en: "Organization updated!",
    },
    updateError: {
      fi: "Jotain meni pieleen.",
      en: "Something went wrong.",
    },
    protectedEditError: {
      fi: "Ei voida muokata Global tai High Council organisaatioita",
      en: "Cannot edit Global or High Council organizations",
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
  confirmation: {
    statusChange: {
      activateTitle: {
        fi: "Aktivoi organisaatio",
        en: "Activate Organization",
      },
      deactivateTitle: {
        fi: "Deaktivoi organisaatio",
        en: "Deactivate Organization",
      },
      activateDescription: {
        fi: "Organisaation aktivointi tekee sen ja sen tuotteet näkyviksi koko sovelluksessa. Haluatko jatkaa?",
        en: "Activating the organization will make it and its items visible app-wide. Do you want to continue?",
      },
      deactivateDescription: {
        fi: "Organisaation deaktivointi piilottaa sen ja sen tuotteet koko sovelluksesta. Haluatko jatkaa?",
        en: "Deactivating the organization will hide it and its items app-wide. Do you want to continue?",
      },
      confirm: {
        fi: "Vahvista",
        en: "Confirm",
      },
      cancel: {
        fi: common.cancel.fi,
        en: common.cancel.en,
      },
    },
  },
  accessibility: {
    labels: {
      nameField: {
        fi: "Organisaation nimi",
        en: "Organization name",
      },
      descriptionField: {
        fi: "Organisaation kuvaus",
        en: "Organization description",
      },
      descriptionHelp: {
        fi: "Valinnainen kuvaus organisaatiolle",
        en: "Optional description for the organization",
      },
    },
    toggleStatus: {
      activate: {
        fi: "Aktivoi {orgName} organisaatio",
        en: "Activate {orgName} organization",
      },
      deactivate: {
        fi: "Deaktivoi {orgName} organisaatio",
        en: "Deactivate {orgName} organization",
      },
      protected: {
        fi: " (suojattu organisaatio)",
        en: " (protected organization)",
      },
    },
  },
};
