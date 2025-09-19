import { common } from "./common";

export const currentUserRoles = {
  title: {
    en: "Roles",
    fi: "Roolit",
  },
  unknownRole: {
    en: "Unknown role",
    fi: "Tuntematon rooli",
  },
  roleAliases: {
    user: {
      en: common.roles.user.en,
      fi: common.roles.user.fi,
    },
    storage_manager: {
      en: common.roles.storageManager.en,
      fi: common.roles.storageManager.fi,
    },
    tenant_admin: {
      en: common.roles.tenantAdmin.en,
      fi: common.roles.tenantAdmin.fi,
    },
    super_admin: {
      en: common.roles.superAdmin.en,
      fi: common.roles.superAdmin.fi,
    },
    requester: {
      en: common.roles.requester.en,
      fi: common.roles.requester.fi,
    },
    admin: {
      en: common.roles.admin.en,
      fi: common.roles.admin.fi,
    },
  },
  active: {
    en: common.active.en,
    fi: common.active.fi,
  },
  inactive: {
    en: common.inactive.en,
    fi: common.inactive.fi,
  },
  toasts: {
    leaveOrgSuccess: {
      en: "You have left the organization",
      fi: "Olet poistunut organisaatiosta",
    },
    leaveOrgError: {
      en: "Failed to leave organization",
      fi: "Organisaatiosta poistuminen epäonnistui",
    },
    leaveOrg: {
      en: "Leave organization?",
      fi: "Poistu organisaatiosta?",
    },
    leaveOrgDescription: {
      en: "Are you sure you want to leave this organization?",
      fi: "Haluatko varmasti poistua tästä organisaatiosta?",
    },
    leaveOrgConfirmText: {
      en: "Leave",
      fi: "Poistu",
    },
    leaveOrgCancelText: {
      en: common.cancel.en,
      fi: common.cancel.fi,
    },
  },
};
