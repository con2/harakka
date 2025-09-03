import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { usersApi } from "@/api/services/users";
import { UserProfile } from "@common/user.types";
import { selectActiveRoleContext } from "@/store/slices/rolesSlice";
import { formatRoleName } from "@/utils/format";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Clipboard } from "lucide-react";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import DeleteUserButton from "@/components/Admin/UserManagement/UserDeleteButton";
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

const UsersDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // local state for the user being inspected so we don't overwrite the
  // global `selectedUser` used elsewhere in the app (e.g. nav/profile).
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

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
    permanentDeleteRole,
    hasRole,
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
  const lastRoleEntry = roleAssignments[roleAssignments.length - 1];
  const isAssigningRole =
    roleAssignments.length > 0 &&
    (!lastRoleEntry?.role_name || !lastRoleEntry?.org_id);

  const { organizationId: activeOrgId, organizationName: activeOrgName } =
    useAppSelector(selectActiveRoleContext);
  const SUPER_ROLES = ["super_admin", "superVera"];
  const isSuper = hasAnyRole(SUPER_ROLES, activeOrgId!);
  const isTenantAdmin = hasRole("tenant_admin", activeOrgId!);
  const canManageRoles = isSuper || isTenantAdmin;

  const assignedOrgIds = useMemo(
    () => new Set(roleAssignments.map((r) => r.org_id)),
    [roleAssignments],
  );

  const TENANT_ALLOWED_ROLES = ["user", "requester", "storage_manager"];

  const getSelectableRoles = (ra: RoleAssignment, rowIndex: number) => {
    // Exclude roles already assigned for the same org (except this row)
    const assignedInOrg = new Set(
      roleAssignments
        .filter(
          (r, i) => r.org_id === ra.org_id && i !== rowIndex && r.role_name,
        )
        .map((r) => r.role_name),
    );
    if (isTenantAdmin) {
      return availableRoles.filter(
        (r) =>
          TENANT_ALLOWED_ROLES.includes(r.role) && !assignedInOrg.has(r.role),
      );
    }

    if (ra.org_name === "High council")
      return availableRoles.filter((r) => SUPER_ROLES.includes(r.role));
    if (ra.org_name === "Global")
      return availableRoles.filter((r) => r.role === "user");
    return availableRoles.filter(
      (r) => r.role !== "user" && !SUPER_ROLES.includes(r.role),
    );
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
          (isSuper || r.organization_id === activeOrgId),
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
  }, [allUserRoles, user, isSuper, activeOrgId]);

  // ensure organizations loaded
  useEffect(() => {
    if (organizations.length === 0) {
      void dispatch(fetchAllOrganizations({ page: 1, limit: 30 }));
    }
  }, [organizations.length, dispatch]);

  const handleRoleAssignmentChange = (
    index: number,
    field: "organization_id" | "role_name",
    value: string | null,
  ) => {
    if (!canManageRoles) return;
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
    setRoleAssignments((prev) =>
      prev.map((ra, i) =>
        i === index ? { ...ra, org_id: orgId, org_name: org.name } : ra,
      ),
    );
  };

  const addRoleAssignment = () => {
    // Only super users can add new role assignments; tenant_admins can only edit existing roles
    if (!isSuper) return;
    setRoleAssignments((prev) => [
      ...prev,
      {
        id: null,
        org_id: isSuper ? null : activeOrgId,
        role_name: null,
        is_active: true,
        org_name: isSuper ? "" : activeOrgName || "",
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
      onConfirm: () => {
        setRoleAssignments((prev) => prev.filter((_, i) => i !== index));
        toast.success(
          "" + roleLabel + " removed locally. Click Save to persist changes.",
        );
      },
      onCancel: () => {},
    });
  };

  // compute whether there are unsaved role changes (creates/deletes/active toggles)
  const hasRoleChanges = useMemo(() => {
    if (!user) return false;
    const originalRoles = allUserRoles.filter((r) => r.user_id === user.id);

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
      return Boolean(orig.is_active) !== Boolean(ra.is_active);
    });

    return created || deleted || updated;
  }, [roleAssignments, allUserRoles, user]);

  const handleSave = async () => {
    if (!user) return;
    try {
      const originalRoles = allUserRoles.filter((r) => r.user_id === user.id);

      // compute diffs: roles to create and to delete
      let toCreate = roleAssignments.filter(
        (ra) =>
          !originalRoles.some(
            (or) =>
              or.organization_id === ra.org_id && or.role_name === ra.role_name,
          ),
      );

      let toDelete = originalRoles.filter(
        (or) =>
          !roleAssignments.some(
            (ra) =>
              ra.org_id === or.organization_id && ra.role_name === or.role_name,
          ),
      );

      // If tenant admin, restrict create/delete operations to the active organization only
      if (isTenantAdmin && activeOrgId) {
        toCreate = toCreate.filter((ra) => ra.org_id === activeOrgId);
        toDelete = toDelete.filter((or) => or.organization_id === activeOrgId);
      }

      const toUpdate = roleAssignments.filter((ra) => {
        const orig = originalRoles.find((or) => or.id === ra.id);
        return ra.id && orig && orig.is_active !== ra.is_active;
      });

      for (const ru of toUpdate) {
        await updateRole(ru.id as string, { is_active: ru.is_active });
      }

      for (const ra of toCreate) {
        if (!ra.org_id || !ra.role_name) continue;
        const roleDef = availableRoles.find((ar) => ar.role === ra.role_name);
        if (roleDef) {
          await createRole({
            user_id: user.id,
            organization_id: ra.org_id,
            role_id: roleDef.id,
          });
        }
      }

      for (const rd of toDelete) {
        if (rd.id) {
          await permanentDeleteRole(rd.id);
          try {
            toast.success(
              "Removed role " +
                (rd.role_name ?? "") +
                " from " +
                (rd.organization_name ?? rd.organization_id),
            );
          } catch (e) {
            console.error("Failed to show removal toast", e);
          }
        }
      }

      toast.success(t.usersDetailsPage.messages.success[lang]);
    } catch (err) {
      console.error("Failed saving roles", err);
      toast.error(t.usersDetailsPage.messages.error[lang]);
    }
  };

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    usersApi
      .getUserById(id)
      .then((u) => {
        if (!mounted) return;
        setUser(u);
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
  }, [id]);

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
        </div>

        {/* Roles management section */}
        <div className="mt-6">
          <div className="flex justify-between items-start">
            <Label className="text-lg">
              {t.usersDetailsPage.labels.roles[lang]}
            </Label>

            <div className="flex items-center gap-2">
              {isSuper && (
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
                          disabled={!isSuper && ra.org_id !== activeOrgId}
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
                            {(isSuper
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
                          (!isSuper && ra.org_id !== activeOrgId) ||
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
                          {getSelectableRoles(ra, index).map((r) => (
                            <SelectItem key={r.id} value={r.role}>
                              {formatRoleName(r.role)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Switch
                        disabled={ra.org_id !== activeOrgId && !isSuper}
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
                  User has no current roles
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

        {/* Danger zone: banning and delete actions */}
        <div className="mt-6">
          <Accordion type="single" collapsible>
            <AccordionItem value="danger-zone">
              <AccordionTrigger className="text-lg text-red-600">
                Danger zone
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6">
                  {/* Banning sub-section */}
                  <div>
                    <h3 className="font-semibold mb-2">
                      {t.userBanning.history.title[lang]}
                    </h3>
                    <div className="space-y-4">
                      <Tabs
                        value={activeTab}
                        onValueChange={(v) =>
                          setActiveTab(v as "history" | "ban" | "unban")
                        }
                      >
                        <TabsList className="w-full">
                          <TabsTrigger value="history" className="w-1/3">
                            {t.userBanning.tabs.history[lang]}
                          </TabsTrigger>
                          <TabsTrigger value="ban" className="w-1/3">
                            {t.userBanning.tabs.ban[lang]}
                          </TabsTrigger>
                          <TabsTrigger value="unban" className="w-1/3">
                            {t.userBanning.tabs.unban[lang]}
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="history">
                          <div className="max-h-64 overflow-y-auto">
                            <UserBanHistory user={user} />
                          </div>
                        </TabsContent>

                        <TabsContent value="ban">
                          <div className="pt-2">
                            <UserBan
                              user={user}
                              onSuccess={() => setActiveTab("history")}
                            />
                          </div>
                        </TabsContent>

                        <TabsContent value="unban">
                          <div className="pt-2">
                            <UnbanUser
                              user={user}
                              onSuccess={() => setActiveTab("history")}
                            />
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>

                  {/* Delete user sub-section */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-red-600">Delete user</h4>
                    <p className="text-sm text-muted-foreground mt-2">
                      This action cannot be undone.
                    </p>
                    <div className="mt-4">
                      <DeleteUserButton
                        id={user.id}
                        closeModal={() => navigate(-1)}
                      />
                    </div>
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
