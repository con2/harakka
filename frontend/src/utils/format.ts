import { BookingStatus } from "@/types";

/**
 * Format snake_case role names into more legible, presentable strings
 * @param roleName e.g. "super_admin", "storage_manager"
 * @returns a formatted string, "Super Admin", "Storage Manager"
 */
export function formatRoleName(roleName: string = ""): string {
  let formatted = roleName?.replace(/_/g, " ");
  formatted = formatted?.replace(/([a-z])([A-Z])/g, "$1 $2");
  formatted = formatted?.replace(/\b\w/g, (char) => char.toUpperCase());

  return formatted;
}

/**
 * Specific to <RoleContextSwitcher />
 * Format the selection fields depending on org, role and user name.
 * @param userName
 * @param roleName
 * @param orgName
 * @returns
 */
export function getOrgLabel(
  userName: string,
  roleName: string,
  orgName: string,
): string {
  if (orgName === "Global") return userName ?? "User";
  if (roleName === "super_admin") return "Super Admin";
  return `${formatRoleName(roleName)} at ${orgName}`;
}

export function formatBookingStatus(
  status: BookingStatus,
  capitalize: boolean = false,
) {
  const formatted = status?.replace("_", " ");

  if (capitalize && formatted) {
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  return formatted;
}
