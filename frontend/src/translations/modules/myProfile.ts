import { common } from "./common";

export const myProfile = {
  tabs: {
    userDetails: {
      fi: "Profiilini",
      en: "My Profile",
    },
    bookings: {
      fi: "Tilaukseni",
      en: "My Bookings",
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
};
