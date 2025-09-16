import { useLanguage } from "@/context/LanguageContext";
import { useRoles } from "@/hooks/useRoles";
import { t } from "@/translations";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { toastConfirm } from "@/components/ui/toastConfirm";
import { leaveOrg } from "@/store/slices/rolesSlice";
import { useAppDispatch } from "@/store/hooks";

export const CurrentUserRoles: React.FC = () => {
  const { currentUserRoles } = useRoles();
  const { lang } = useLanguage();
  const dispatch = useAppDispatch();

  // Make role aliases
  const getRoleAlias = (roleName: string) => {
    if (!roleName) return t.currentUserRoles.unknownRole?.[lang];
    const aliases = t.currentUserRoles.roleAliases;
    if (roleName in aliases) {
      // Type assertion ensures TypeScript knows roleName is a valid key
      return aliases[roleName as keyof typeof aliases]?.[lang];
    }
    // fallback: prettify the role name
    return roleName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  //Render
  return (
    <div className="flex flex-col md:flex-1 space-y-6 p-2 w-full">
      {/* Disables fields for roles */}
      <h3 className="text-md font-semibold text-gray-700">
        {t.currentUserRoles.title?.[lang]}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentUserRoles.map((role) => (
          <div key={role.id}>
            <label
              htmlFor="role"
              className="block text-xs font-medium text-gray-700"
            >
              {role.organization_name}{" "}
              <span
                className={`inline-block px-2 py-1 text-xs rounded ${
                  role.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-200 text-gray-600"
                }`}
              >
                {role.is_active
                  ? t.currentUserRoles.active?.[lang]
                  : t.currentUserRoles.inactive?.[lang]}
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="role"
                type="text"
                value={getRoleAlias(role.role_name || "Unknown role")}
                disabled
                className="p-3 w-full border border-gray-300 rounded-md text-sm text-gray-600 focus:ring-2 focus:ring-secondary focus:outline-none"
              />
              {/* Leave button: only for active roles and not the Global 'user' role */}
              {role.is_active &&
                !(
                  role.role_name === "user" &&
                  role.organization_name === "Global"
                ) && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="ml-2"
                    onClick={() =>
                      toastConfirm({
                        title:
                          t.currentUserRoles.toasts.leaveOrg?.[lang] ||
                          "Leave organization?",
                        description:
                          t.currentUserRoles.toasts.leaveOrgDescription?.[
                            lang
                          ] ||
                          "Are you sure you want to leave this organization?",
                        confirmText:
                          t.currentUserRoles.toasts.leaveOrg?.[lang] || "Leave",
                        cancelText:
                          t.currentUserRoles.toasts.leaveOrg?.[lang] ||
                          "Cancel",
                        onConfirm: async () => {
                          try {
                            await dispatch(
                              leaveOrg(role.id as string),
                            ).unwrap();
                            toast.success(
                              t.currentUserRoles.toasts.leaveOrgSuccess?.[
                                lang
                              ] || "You have left the organization",
                            );
                          } catch (err) {
                            console.error("leaveOrg failed:", err);
                            toast.error(
                              t.currentUserRoles.toasts.leaveOrgError?.[lang] ||
                                "Failed to leave organization",
                            );
                          }
                        },
                      })
                    }
                  >
                    <Trash2 className="mr-1" />
                    {"Leave"}
                  </Button>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
