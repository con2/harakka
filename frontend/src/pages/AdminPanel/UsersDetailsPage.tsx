import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  updateUser,
  getUserById,
  selectSelectedUser,
  selectSelectedUserLoading,
  clearSelectedUser,
} from "@/store/slices/usersSlice";
import { selectActiveRoleContext } from "@/store/slices/rolesSlice";
import { formatRoleName } from "@/utils/format";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Clipboard } from "lucide-react";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import DeleteUserButton from "@/components/Admin/UserManagement/UserDeleteButton";
// Ban flows are now handled inline on this page (no modals)
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
// Ban history handled by the UserBanHistory component
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

const UsersDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectSelectedUser);
  const loading = useAppSelector(selectSelectedUserLoading);
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
  // Banning state
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
    if (!canManageRoles) return;
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
    setRoleAssignments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      await dispatch(
        updateUser({
          id: user.id,
          data: { id: user.id, full_name: user.full_name },
        }),
      ).unwrap();
      toast.success(t.usersDetailsPage.messages.success[lang]);

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
        }
      }
    } catch {
      toast.error(t.usersDetailsPage.messages.error[lang]);
    }
  };

  useEffect(() => {
    if (id) {
      void dispatch(getUserById(id));
    }
    return () => {
      // clear selected user when leaving the page
      dispatch(clearSelectedUser());
    };
  }, [id, dispatch]);

  // Ban history is loaded by the UserBanHistory component when it's mounted.

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
          <Label className="text-lg">
            {t.usersDetailsPage.labels.roles[lang]}
          </Label>

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

          <div className="flex justify-between items-center mt-4">
            <Button
              variant="default"
              className="border-1-grey"
              type="button"
              size="sm"
              onClick={addRoleAssignment}
              disabled={isAssigningRole}
            >
              {t.usersDetailsPage.buttons.addRole[lang]}
            </Button>

            <div className="flex items-center gap-4">
              <DeleteUserButton id={user.id} closeModal={() => navigate(-1)} />
              <Button variant="outline" onClick={handleSave} size={"sm"}>
                {t.usersDetailsPage.buttons.save[lang]}
              </Button>
            </div>
          </div>
        </div>

        {/* Banning section - lazy load ban history inside accordion */}
        <div className="mt-6">
          <Accordion type="single" collapsible>
            <AccordionItem value="banning">
              <AccordionTrigger className="text-lg">
                {t.userBanning.history.title[lang]}
              </AccordionTrigger>
              <AccordionContent>
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
                        {/* Render ban history component only when this tab is active */}
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
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default UsersDetailsPage;
