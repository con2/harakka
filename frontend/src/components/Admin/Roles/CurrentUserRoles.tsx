import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useRoles } from "@/hooks/useRoles";
import { t } from "@/translations";
// ...existing code...
import { Trash2, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { toastConfirm } from "@/components/ui/toastConfirm";
import { leaveOrg } from "@/store/slices/rolesSlice";
import { useAppDispatch } from "@/store/hooks";

export const CurrentUserRoles: React.FC = () => {
  const { currentUserRoles } = useRoles();
  const { lang } = useLanguage();
  const dispatch = useAppDispatch();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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
    <div className="flex flex-col md:flex-1 space-y-6 w-full">
      {/* Disables fields for roles */}
      <h3 className="text-xl font-semibold text-gray-700 mb-[1rem]">
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
              {/* Leave menu: only for active roles and not the Global 'user' role */}
              {role.is_active &&
                !(
                  role.role_name === "user" &&
                  role.organization_name === "Global"
                ) && (
                  <div
                    className="relative ml-2 inline-block"
                    data-role-id={role.id}
                  >
                    <button
                      type="button"
                      aria-haspopup="true"
                      aria-expanded={openMenuId === (role.id as string)}
                      className="p-1 rounded hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId((prev) =>
                          prev === (role.id as string)
                            ? null
                            : (role.id as string),
                        );
                      }}
                    >
                      <MoreVertical aria-hidden className="w-5 h-5" />
                    </button>

                    {openMenuId === (role.id as string) && (
                      <div
                        className="absolute right-0 mt-2 w-44 bg-white border rounded-md"
                        data-role-menu-open
                      >
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-red-50 flex items-center gap-2 text-sm text-red-700"
                          onClick={() => {
                            // keep menu open while confirming, close after
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
                                t.currentUserRoles.toasts.leaveOrgConfirmText?.[
                                  lang
                                ] || "Leave",
                              cancelText:
                                t.currentUserRoles.toasts.leaveOrgCancelText?.[
                                  lang
                                ] || "Cancel",
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
                                    t.currentUserRoles.toasts.leaveOrgError?.[
                                      lang
                                    ] || "Failed to leave organization",
                                  );
                                } finally {
                                  setOpenMenuId(null);
                                }
                              },
                            });
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>
                            {t.currentUserRoles.toasts.leaveOrgConfirmText?.[
                              lang
                            ] || "Leave"}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
