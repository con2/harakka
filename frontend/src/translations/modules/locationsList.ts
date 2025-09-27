import { common } from "./common";

export const locationsList = {
  noLocations: {
    fi: "Ei sijainteja saatavilla.",
    en: "No locations available.",
  },
  active: {
    fi: common.active.fi,
    en: common.active.en,
  },
  inactive: {
    fi: common.inactive.fi,
    en: common.inactive.en,
  },
  address: {
    fi: common.personalData.address.fi,
    en: common.personalData.address.en,
  },
  noAddress: {
    fi: "Ei osoitetta saatavilla",
    en: "No address available",
  },
  organization: {
    fi: common.organizations.organization.fi,
    en: common.organizations.organization.en,
  },
  created: {
    fi: "Luotu",
    en: "Created",
  },
  edit: {
    fi: common.edit.fi,
    en: common.edit.en,
  },
  aria: {
    labels: {
      editLocation: {
        en: "Edit location",
        fi: "Muokkaa sijaintia",
      },
    },
  },
};
