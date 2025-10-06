import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { usersApi } from "@/api/services/users";
import { UserProfile } from "@common/user.types";
import { selectActiveRoleContext } from "@/store/slices/rolesSlice";
import { formatRoleName } from "@/utils/format";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Clipboard, RefreshCw } from "lucide-react";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { useRoles } from "@/hooks/useRoles";
import {
  selectOrganizations,
  fetchAllOrganizations,
} from "@/store/slices/organizationSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import UserBanHistory from "@/components/Admin/UserManagement/Banning/UserBanHistory";
import UserBan from "@/components/Admin/UserManagement/Banning/UserBan";
import UnbanUser from "@/components/Admin/UserManagement/Banning/UnbanUser";
import { toastConfirm } from "@/components/ui/toastConfirm";
import { Separator } from "@/components/ui/separator";
import { Address } from "@/types/address";
import { refreshSupabaseSession } from "@/store/utils/refreshSupabaseSession";
import { ViewUserRolesWithDetails } from "@common/role.types";
import {
  fetchUserBanHistory,
  checkUserBanStatus,
} from "@/store/slices/userBanningSlice";

const UsersDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // local state for the user being inspected so we don't overwrite the
  // global `selectedUser` used elsewhere in the app (e.g. nav/profile).
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const { formatDate } = useFormattedDate();
  const { lang } = useLanguage();
  // copy-to-clipboard state for email
  const [copiedEmail, setCopiedEmail] = useState(false);
  const copyEmailToClipboard = async (email?: string) => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 2000);
    } catch (err) {
      console.error("Failed to copy email", err);
    }
  };
  const {
    availableRoles,
    allUserRoles,
    hasAnyRole,
    createRole,
    updateRole,
    replaceRole,
    permanentDeleteRole,
    hasRole,
    refreshAllUserRoles,
    refreshAvailableRoles,
    syncSessionAndRoles,
  } = useRoles();
  const organizations = useAppSelector(selectOrganizations);

  // Role assignment state and helpers
  type RoleAssignment = {
    id: string | null;
    org_id: string | null;
    role_name: string | null;
    is_active: boolean;
    org_name: string;
    isNewRole: boolean;
  };
  const [roleAssignments, setRoleAssignments] = useState<RoleAssignment[]>([]);

  const [activeTab, setActiveTab] = useState<"history" | "ban" | "unban">(
    "history",
  );
  const [banRefreshKey, setBanRefreshKey] = useState(0);
  const lastRoleEntry = roleAssignments[roleAssignments.length - 1];
  const isAssigningRole =
    roleAssignments.length > 0 &&
    (!lastRoleEntry?.role_name || !lastRoleEntry?.org_id);

  const { organizationId: activeOrgId } = useAppSelector(
    selectActiveRoleContext,
  );
  const isSuperAdmin = hasRole("super_admin");
  const canManageRoles = hasAnyRole(
    ["tenant_admin", "super_admin"],
    activeOrgId!,
  );
  const assignedOrgIds = useMemo(
    () => new Set(roleAssignments.map((r) => r.org_id)),
    [roleAssignments],
  );

  const getSelectableRoles = (orgId: string | null) => {
    // Only super_admins can assign the super_admin or tenant_admin role
    if (!isSuperAdmin) {
      return availableRoles.filter(
        (role) => role.role !== "super_admin" && role.role !== "tenant_admin",
      );
    }
    // No organization selected yet, return all roles
    if (!orgId) {
      return availableRoles;
    }

    // Find the organization by ID to check if it's the High Council
    const org = organizations.find((o) => o.id === orgId);
    // Is new role's org High council?
    const isHighCouncil =
      org?.name?.toLowerCase() === "high council".toLowerCase();

    // For High Council, only return super_admin role
    if (isHighCouncil) {
      return availableRoles.filter((role) => role.role === "super_admin");
    }

    // For other organizations, return all roles except super_admin
    return availableRoles.filter((role) => role.role !== "super_admin");
  };

  // populate role assignments for the user
  useEffect(() => {
    if (!user) return;
    // For tenant admins only show roles inside their active org; supers see all
    const userRoles = allUserRoles
      .filter(
        (r) =>
          r.user_id === user.id &&
          r.organization_id &&
          r.role_name &&
          (isSuperAdmin || r.organization_id === activeOrgId),
      )
      .map((r) => ({
        id: r.id,
        org_id: r.organization_id as string,
        role_name: r.role_name as string,
        is_active: !!r.is_active,
        org_name: r.organization_name!,
        isNewRole: false,
      }));
    setRoleAssignments(userRoles);
  }, [allUserRoles, user, isSuperAdmin, activeOrgId]);

  // ensure organizations loaded
  useEffect(() => {
    if (organizations.length === 0) {
      void dispatch(fetchAllOrganizations({ page: 1, limit: 30 }));
    }
  }, [organizations.length, dispatch]);

  const handleBanStateChange = useCallback(async () => {
    if (!user?.id) return;
    await dispatch(fetchUserBanHistory(user.id));
    await dispatch(checkUserBanStatus(user.id));
    setBanRefreshKey((prev) => prev + 1);
  }, [dispatch, user?.id]);

  const handleRoleAssignmentChange = (
    index: number,
    field: "organization_id" | "role_name",
    value: string | null,
  ) => {
    if (!canManageRoles) return;

    if (field === "role_name") {
      const currentAssignment = roleAssignments[index];
      const org = organizations.find((o) => o.id === currentAssignment.org_id);
      const isHighCouncil =
        org?.name?.toLowerCase() === "high council".toLowerCase();

      // If trying to assign non-super_admin role to High Council, prevent it
      if (isHighCouncil && value !== "super_admin") {
        toast.error(t.usersDetailsPage.toasts.highCouncilRestriction[lang]);
        return;
      }

      // If trying to assign super_admin role to non-High Council org, prevent it
      if (!isHighCouncil && value === "super_admin") {
        toast.error(t.usersDetailsPage.toasts.superAdminRestriction[lang]);
        return;
      }
    }

    // Standard role change
    setRoleAssignments((prev) =>
      prev.map((ra, i) =>
        i === index
          ? field === "organization_id" && ra.id
            ? ra
            : { ...ra, [field]: value }
          : ra,
      ),
    );
  };

  const handleOrgChange = (index: number, orgId: string) => {
    const org = organizations.find((o) => o.id === orgId);
    if (!org) return;

    // Get the current role assignment
    const currentAssignment = roleAssignments[index];
    const isHighCouncil =
      org.name?.toLowerCase() === "high council".toLowerCase();

    // If switching to High Council but role isn't super_admin, reset role
    if (isHighCouncil && currentAssignment.role_name !== "super_admin") {
      setRoleAssignments((prev) =>
        prev.map((ra, i) =>
          i === index
            ? { ...ra, org_id: orgId, org_name: org.name, role_name: null }
            : ra,
        ),
      );
      toast.info(t.usersDetailsPage.toasts.highCouncilRestriction[lang]);
      return;
    }

    // If switching away from High Council and role is super_admin, reset role
    if (!isHighCouncil && currentAssignment.role_name === "super_admin") {
      setRoleAssignments((prev) =>
        prev.map((ra, i) =>
          i === index
            ? { ...ra, org_id: orgId, org_name: org.name, role_name: null }
            : ra,
        ),
      );
      toast.info(t.usersDetailsPage.toasts.superAdminRestriction[lang]);
      return;
    }

    // Standard organization change
    setRoleAssignments((prev) =>
      prev.map((ra, i) =>
        i === index ? { ...ra, org_id: orgId, org_name: org.name } : ra,
      ),
    );
  };

  const addRoleAssignment = () => {
    if (!canManageRoles) return;

    // Check if there's already an incomplete entry
    if (isAssigningRole) {
      toast.warning(t.usersDetailsPage.toasts.completeCurrentRole[lang]);
      return;
    }

    // Add a new empty role assignment
    setRoleAssignments((prev) => [
      ...prev,
      {
        id: null,
        org_id: null,
        role_name: null,
        is_active: true,
        org_name: t.usersDetailsPage.placeholders.selectOrganization[lang],
        isNewRole: true,
      },
    ]);
  };

  const toggleRoleActive = (index: number) => {
    if (!canManageRoles) return;
    setRoleAssignments((prev) =>
      prev.map((ra, i) =>
        i === index ? { ...ra, is_active: !ra.is_active } : ra,
      ),
    );
  };

  const removeRoleAssignment = (index: number) => {
    if (!canManageRoles) return;
    const ra = roleAssignments[index];
    const roleLabel = ra?.role_name ? formatRoleName(ra.role_name) : "role";
    const orgLabel = ra?.org_name ?? ra?.org_id ?? "organization";

    toastConfirm({
      title: `Remove ${roleLabel}`,
      description: `Do you want to remove ${roleLabel} from ${user?.full_name ?? "this user"} in ${orgLabel}?`,
      confirmText: "Remove",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          if (ra.id) {
            // If the role has an ID, it exists in the database and should be deleted
            await permanentDeleteRole(ra.id);

            // Refresh JWT and roles data
            await refreshSupabaseSession();
            await refreshAllUserRoles(true);

            toast.success(`Removed ${roleLabel} from ${orgLabel}`);
          } else {
            // If the role doesn't have an ID, it's only in local state
            setRoleAssignments((prev) => prev.filter((_, i) => i !== index));
            toast.success(
              `Removed ${roleLabel} from ${orgLabel} (local change)`,
            );
          }

          // Update the role assignments in the state to reflect the change
          // This is needed even for database deletes to keep the UI in sync
          setRoleAssignments((prev) => prev.filter((_, i) => i !== index));
        } catch (err) {
          console.error("Failed to remove role:", err);
          toast.error(`Failed to remove ${roleLabel}. Please try again.`);
        }
      },
      onCancel: () => {},
    });
  };

  // compute whether there are unsaved role changes (creates/deletes/active toggles)
  const hasRoleChanges = useMemo(() => {
    if (!user) return false;
    const originalRoles = allUserRoles.filter(
      (r) =>
        r.user_id === user.id &&
        r.organization_id &&
        r.role_name &&
        (isSuperAdmin || r.organization_id === activeOrgId),
    );

    const created = roleAssignments.some(
      (ra) =>
        ra.org_id &&
        ra.role_name &&
        !originalRoles.some(
          (or) =>
            or.organization_id === ra.org_id && or.role_name === ra.role_name,
        ),
    );

    const deleted = originalRoles.some(
      (or) =>
        !roleAssignments.some(
          (ra) =>
            ra.org_id === or.organization_id && ra.role_name === or.role_name,
        ),
    );

    const updated = roleAssignments.some((ra) => {
      if (!ra.id) return false;
      const orig = originalRoles.find((or) => or.id === ra.id);
      if (!orig) return false;
      // consider active flag changes or role_name changes as updates
      return (
        Boolean(orig.is_active) !== Boolean(ra.is_active) ||
        (orig.role_name ?? null) !== (ra.role_name ?? null)
      );
    });

    return created || deleted || updated;
  }, [roleAssignments, allUserRoles, user, activeOrgId, isSuperAdmin]);

  const handleSave = async () => {
    if (!user) return;
    try {
      const originalRoles = allUserRoles.filter((r) => r.user_id === user.id);

      // Group roles by organization to enforce "one active role per org" rule
      const userOrgRoles = new Map<string, ViewUserRolesWithDetails[]>();
      originalRoles.forEach((role) => {
        if (!role.organization_id) return;

        if (!userOrgRoles.has(role.organization_id)) {
          userOrgRoles.set(role.organization_id, []);
        }
        userOrgRoles.get(role.organization_id)!.push(role);
      });

      // Create a loading toast that will be updated with progress
      const loadingToast = toast.loading(
        t.usersDetailsPage.toasts.loading[lang],
      );

      // Track operations for reporting
      let updatedCount = 0;
      let createdCount = 0;
      let deletedCount = 0;
      const replacedRoleIds = new Set<string>();

      // Process roles that need to be updated (role type change)
      for (const ra of roleAssignments.filter((ra) => {
        if (!ra.org_id || !ra.role_name || !ra.id) return false;

        const origRole = originalRoles.find((r) => r.id === ra.id);
        return origRole && origRole.role_name !== ra.role_name;
      })) {
        // This is a role replacement (different role type in same org)
        const roleDef = availableRoles.find((ar) => ar.role === ra.role_name);

        if (roleDef && ra.id && ra.org_id) {
          try {
            await replaceRole(ra.id, {
              user_id: user.id,
              organization_id: ra.org_id, // TypeScript knows this is non-null now
              role_id: roleDef.id,
            });
            updatedCount++;
            replacedRoleIds.add(ra.id); // Mark this role as already replaced
          } catch (err) {
            console.error("Failed to replace role:", err, {
              role: ra.role_name,
              org: ra.org_name,
            });
          }
        }
      }

      // Process standard updates (is_active toggle only)
      const standardUpdates = roleAssignments.filter((ra) => {
        const orig = originalRoles.find((or) => or.id === ra.id);
        return (
          ra.id &&
          orig &&
          orig.is_active !== ra.is_active &&
          orig.role_name === ra.role_name
        );
      });

      for (const ru of standardUpdates) {
        await updateRole(ru.id as string, { is_active: ru.is_active });
        updatedCount++;
      }

      // Process new role creations
      for (const ra of roleAssignments.filter(
        (ra) => ra.org_id && !userOrgRoles.has(ra.org_id) && ra.role_name,
      )) {
        if (!ra.org_id || !ra.role_name) continue;
        const roleDef = availableRoles.find((ar) => ar.role === ra.role_name);
        if (roleDef) {
          await createRole({
            user_id: user.id,
            organization_id: ra.org_id,
            role_id: roleDef.id,
          });
          createdCount++;
        }
      }

      // Process deletions
      for (const rd of originalRoles.filter(
        (or) =>
          !roleAssignments.some(
            (ra) =>
              ra.org_id === or.organization_id && ra.role_name === or.role_name,
          ) && !replacedRoleIds.has(or.id!), // Skip roles that were already replaced,
      )) {
        if (rd.id) {
          await permanentDeleteRole(rd.id);
          deletedCount++;
        }
      }

      // Refresh JWT and force reload roles data
      await syncSessionAndRoles();

      // Update the loading toast with success message
      const translatedMessage = t.usersDetailsPage.toasts.roleChangesSaved[lang]
        .replace("{created}", String(createdCount))
        .replace("{updated}", String(updatedCount))
        .replace("{deleted}", String(deletedCount));
      toast.success(translatedMessage, { id: loadingToast });
    } catch (err) {
      console.error("Failed saving roles", err);
      toast.error(t.usersDetailsPage.messages.error[lang]);
    }
  };

  // Split the effects - one for initial roles refresh and one for user data loading

  // First useEffect: One-time roles refresh on mount with a ref to prevent loops
  const hasRefreshedRoles = useRef(false);

  useEffect(() => {
    if (!id) return;

    if (!hasRefreshedRoles.current) {
      hasRefreshedRoles.current = true;

      if (canManageRoles) {
        Promise.all([
          refreshAllUserRoles(true),
          refreshAvailableRoles(true),
        ]).catch((err) => {
          console.error("Failed to refresh role data:", err);
        });
      }
    }
  }, [id, canManageRoles, refreshAllUserRoles, refreshAvailableRoles]);

  // Second useEffect: Handle user data loading separately
  useEffect(() => {
    if (!id) return;

    let mounted = true;
    setLoading(true);

    usersApi
      .getUserById(id)
      .then((u) => {
        if (!mounted) return;
        setUser(u);

        // fetch addresses for this user
        setAddressesLoading(true);
        usersApi
          .getAddresses(u.id)
          .then((addrs) => {
            if (!mounted) return;
            setAddresses(addrs ?? []);
          })
          .catch((err) => console.error("Failed fetching addresses", err))
          .finally(() => {
            if (mounted) setAddressesLoading(false);
          });
      })
      .catch((err) => {
        console.error("Failed to fetch user", err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id, canManageRoles, refreshAllUserRoles]);

  if (loading || !user) {
    return <Spinner containerClasses="py-10" />;
  }

  return (
    <div className="mt-4 mx-10">
      <div>
        <Button
          onClick={() => navigate(-1)}
          className="text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
        >
          <ChevronLeft /> {t.usersDetailsPage.buttons.back[lang]}
        </Button>
      </div>

      <div className="mt-6 max-w-5xl">
        <h2 className="text-xl font-semibold mb-4">{user.full_name}</h2>
        {/* User details section */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-lg">
              {t.usersDetailsPage.labels.email[lang]}
            </Label>{" "}
            <div className="inline-flex items-center gap-2">
              <span>{user.email ?? "-"}</span>
              <button
                type="button"
                onClick={() => copyEmailToClipboard(user.email ?? "")}
                title={t.usersDetailsPage.copy.title[lang]}
                aria-label={t.usersDetailsPage.copy.title[lang]}
                className="p-1 rounded hover:bg-gray-200"
              >
                <Clipboard className="h-4 w-4 text-gray-600" />
              </button>
              {copiedEmail && (
                <span className="text-xs text-green-600">
                  {t.usersDetailsPage.copy.copied[lang]}
                </span>
              )}
            </div>
          </div>
          <div>
            <Label className="text-lg">
              {t.usersDetailsPage.labels.phone[lang]}
            </Label>{" "}
            {user.phone ?? "-"}
          </div>
          <div>
            <Label className="text-lg">
              {t.usersDetailsPage.labels.created[lang]}
            </Label>{" "}
            {user.created_at
              ? formatDate(new Date(user.created_at), "d MMM yyyy")
              : "-"}
          </div>
          {/* Addresses */}
          <div>
            <Label className="text-lg">
              {t.usersDetailsPage.labels.addresses[lang] ?? "Addresses"}
            </Label>
            {addressesLoading ? (
              <div className="text-sm">Loading...</div>
            ) : addresses.length === 0 ? (
              <div className="text-md text-slate-500">
                {t.usersDetailsPage.labels.noAddresses[lang]}
              </div>
            ) : (
              <div className="space-y-2 mt-2">
                {addresses.map((a) => (
                  <div key={a.id} className="text-md">
                    <div>
                      {a.street_address}, {a.city}, {a.postal_code}, {a.country}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Roles management section */}
        <div className="mt-6">
          <div className="flex justify-between items-start">
            <Label className="text-lg">
              {t.usersDetailsPage.labels.roles[lang]}
            </Label>

            <div className="flex items-center gap-2">
              {/* Add refresh button */}
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await refreshSupabaseSession();
                    await refreshAllUserRoles(true);
                    toast.success(
                      t.usersDetailsPage.toasts.roleRefreshSuccess[lang],
                    );
                  } catch (err) {
                    console.error("Failed to refresh roles:", err);
                    toast.error(
                      t.usersDetailsPage.toasts.roleRefreshError[lang],
                    );
                  }
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {t.usersDetailsPage.buttons.refresh[lang]}
              </Button>

              {isSuperAdmin && (
                <Button
                  variant="outline"
                  className="border-1-grey"
                  type="button"
                  size="sm"
                  onClick={addRoleAssignment}
                  disabled={isAssigningRole}
                >
                  {t.usersDetailsPage.buttons.addRole[lang]}
                </Button>
              )}

              {/* Existing save button */}
              {canManageRoles && hasRoleChanges && (
                <Button variant="outline" onClick={handleSave} size={"sm"}>
                  {t.usersDetailsPage.buttons.save[lang]}
                </Button>
              )}
            </div>
          </div>

          {canManageRoles ? (
            <>
              {roleAssignments.length > 0 ? (
                <div className="border rounded-md overflow-y-auto mt-2">
                  <div className="grid grid-cols-[1fr_1fr_80px_auto] gap-2 px-3 py-2 text-xs font-medium text-muted-foreground sticky top-0 bg-background z-10">
                    <span>{t.usersDetailsPage.columns.organization[lang]}</span>
                    <span>{t.usersDetailsPage.columns.role[lang]}</span>
                    <span>{t.usersDetailsPage.columns.active[lang]}</span>
                    <span>{t.usersDetailsPage.columns.actions[lang]}</span>
                  </div>

                  {roleAssignments.map((ra, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[1fr_1fr_80px_auto] gap-2 px-3 py-2 items-center"
                    >
                      {ra.id ? (
                        <span className="truncate text-sm pl-2">
                          {organizations.find((o) => o.id === ra.org_id)
                            ?.name ?? ra.org_id}
                        </span>
                      ) : (
                        <Select
                          disabled={!isSuperAdmin && ra.org_id !== activeOrgId}
                          onValueChange={(value) =>
                            handleOrgChange(index, value)
                          }
                          defaultValue={ra.org_id ?? undefined}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={
                                t.usersDetailsPage.placeholders
                                  .selectOrganization[lang]
                              }
                            >
                              {ra.org_name}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {(isSuperAdmin
                              ? organizations.filter(
                                  (org) => !assignedOrgIds.has(org.id),
                                )
                              : organizations.filter(
                                  (o) => o.id === activeOrgId,
                                )
                            ).map((org) => (
                              <SelectItem key={org.id} value={org.id}>
                                {org.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      <Select
                        onValueChange={(value) =>
                          handleRoleAssignmentChange(index, "role_name", value)
                        }
                        disabled={
                          (!isSuperAdmin && ra.org_id !== activeOrgId) ||
                          (ra.org_name === "Global" && Boolean(ra.role_name)) ||
                          (isAssigningRole && !lastRoleEntry.org_id)
                        }
                        defaultValue={ra.role_name ?? ""}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              t.usersDetailsPage.placeholders.selectRole[lang]
                            }
                          >
                            {formatRoleName(ra.role_name ?? "")}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {getSelectableRoles(ra.org_id).map((r) => (
                            <SelectItem key={r.id} value={r.role}>
                              {formatRoleName(r.role)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Switch
                        disabled={ra.org_id !== activeOrgId && !isSuperAdmin}
                        checked={ra.is_active}
                        onCheckedChange={() => toggleRoleActive(index)}
                        className="justify-self-center"
                      />

                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="justify-self-end"
                        onClick={() => removeRoleAssignment(index)}
                      >
                        {t.usersDetailsPage.buttons.remove[lang]}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm mt-4 text-center mb-2">
                  {t.usersDetailsPage.labels.noRoles[lang]}
                </p>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-1 mt-2">
              {roleAssignments.length > 0 ? (
                roleAssignments.map((ra, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded w-max"
                  >
                    {organizations.find((o) => o.id === ra.org_id)?.name ??
                      ra.org_id}{" "}
                    — {ra.role_name}
                  </span>
                ))
              ) : (
                <span className="text-slate-500">
                  {t.usersDetailsPage.status.noRoles[lang]}
                </span>
              )}
            </div>
          )}
        </div>
        <Separator className="mt-40" />

        {/* Danger zone: banning actions */}
        <div className="mt-6">
          <Accordion type="single" collapsible>
            <AccordionItem value="danger-zone">
              <AccordionTrigger className="text-red-300">
                {t.usersDetailsPage.buttons.dangerZone[lang]} -{" "}
                {t.usersDetailsPage.userBanning.history.title[lang]}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6">
                  {/* Banning sub-section */}
                  <div className="space-y-4">
                    <Tabs
                      value={activeTab}
                      onValueChange={(v) =>
                        setActiveTab(v as "history" | "ban" | "unban")
                      }
                    >
                      <TabsList className="w-full">
                        <TabsTrigger value="history" className="w-1/3">
                          {t.usersDetailsPage.userBanning.tabs.history[lang]}
                        </TabsTrigger>
                        <TabsTrigger value="ban" className="w-1/3">
                          {t.usersDetailsPage.userBanning.tabs.ban[lang]}
                        </TabsTrigger>
                        <TabsTrigger value="unban" className="w-1/3">
                          {t.usersDetailsPage.userBanning.tabs.unban[lang]}
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="history">
                        <div className="max-h-64 overflow-y-auto">
                          <UserBanHistory
                            user={user}
                            refreshKey={banRefreshKey}
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="ban">
                        <div className="pt-2">
                          <UserBan
                            user={user}
                            onSuccess={async () => {
                              await handleBanStateChange();
                              setActiveTab("history");
                            }}
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="unban">
                        <div className="pt-2">
                          <UnbanUser
                            user={user}
                            refreshKey={banRefreshKey}
                            onSuccess={async () => {
                              await handleBanStateChange();
                              setActiveTab("history");
                            }}
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default UsersDetailsPage;
