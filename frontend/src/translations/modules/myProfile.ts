import { common } from "./common";

export const myProfile = {
  tabs: {
    userDetails: {
      fi: "Profiilini",
      en: "My Profile",
    },
    bookings: {
      myBookings: {
        fi: "Tilaukseni",
        en: "My Bookings",
      },
      orgBookings: {
        en: "My Organization Bookings",
        fi: "Organisaation varaukset",
      },
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
        fi: common.personalData.email.fi,
        en: common.personalData.email.en,
      },
    },
    phone: {
      label: {
        fi: common.personalData.phone.fi,
        en: common.personalData.phone.en,
      },
    },
    visibleName: {
      label: {
        fi: common.personalData.visibleName.fi,
        en: common.personalData.visibleName.en,
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
        fi: common.personalData.street.fi,
        en: common.personalData.street.en,
      },
      placeholder: {
        fi: common.personalData.street.fi,
        en: common.personalData.street.en,
      },
    },
    city: {
      label: {
        fi: common.personalData.city.fi,
        en: common.personalData.city.en,
      },
      placeholder: {
        fi: common.personalData.city.fi,
        en: common.personalData.city.en,
      },
    },
    postalCode: {
      label: {
        fi: common.personalData.postalCode.fi,
        en: common.personalData.postalCode.en,
      },
      placeholder: {
        fi: common.personalData.postalCode.fi,
        en: common.personalData.postalCode.en,
      },
    },
    country: {
      label: {
        fi: common.personalData.country.fi,
        en: common.personalData.country.en,
      },
      placeholder: {
        fi: common.personalData.country.fi,
        en: common.personalData.country.en,
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
      fi: common.remove.fi,
      en: common.remove.en,
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
      fi: common.cancel.fi,
      en: common.cancel.en,
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
      fi: common.delete.fi,
      en: common.delete.en,
    },
    cancelText: {
      fi: common.cancel.fi,
      en: common.cancel.en,
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
};
