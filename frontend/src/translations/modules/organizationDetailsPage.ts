import { common } from "../modules/common";

export const organizationDetailsPage = {
  title: {
    fi: "Organisaation tiedot",
    en: "Organization Details",
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
};
