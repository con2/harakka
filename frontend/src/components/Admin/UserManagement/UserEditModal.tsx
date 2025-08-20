import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/context/LanguageContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateUser } from "@/store/slices/usersSlice";
import { t } from "@/translations";
import { UserFormData } from "@/types";
import { Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Label } from "../../ui/label";
import { UserProfile } from "@common/user.types";
import {
  selectOrganizations,
  fetchAllOrganizations,
} from "@/store/slices/organizationSlice";
import { useRoles } from "@/hooks/useRoles";
import { formatRoleName } from "@/utils/format";
import { selectActiveRoleContext } from "@/store/slices/rolesSlice";

// Role assignments across organizations
type RoleAssignment = {
  id: string | null; // row id if existing
  org_id: string | null;
  role_name: string | null;
  is_active: boolean;
  org_name: string;
  isNewRole: boolean;
};

const UserEditModal = ({ user }: { user: UserProfile }) => {
  const dispatch = useAppDispatch();
  const {
    availableRoles,
    allUserRoles,
    hasAnyRole,
    createRole,
    updateRole,
    permanentDeleteRole,
    hasRole,
  } = useRoles();

  // Translation
  const { lang } = useLanguage();
  const { organizationId: activeOrgId, organizationName: activeOrgName } =
    useAppSelector(selectActiveRoleContext);

  // Column header keys for the role grid
  const columns = {
    org: t.userEditModal.columns?.organization?.[lang] ?? "Organization",
    role: t.userEditModal.columns?.role?.[lang] ?? "Role",
    active: t.userEditModal.columns?.active?.[lang] ?? "Active",
    actions: t.userEditModal.columns?.actions?.[lang] ?? "Actions",
  };
  const [roleAssignments, setRoleAssignments] = useState<RoleAssignment[]>([]);
  const lastRoleEntry = roleAssignments[roleAssignments.length - 1];
  const isAssigningRole =
    roleAssignments.length > 0 &&
    (!lastRoleEntry?.role_name || !lastRoleEntry?.org_id);

  // Can Manage Roles:
  // Any "Super" role or tenant_admin of current org
  const SUPER_ROLES = ["super_admin", "superVera"];
  const isSuper = hasAnyRole(SUPER_ROLES, activeOrgId!);
  const isTenantAdmin = hasRole("tenant_admin", activeOrgId!);
  const canManageRoles = isSuper || isTenantAdmin;
  const assignedOrgIds = new Set(roleAssignments.map((r) => r.org_id));

  const [formData, setFormData] = useState<UserFormData>({
    full_name: user.full_name || "",
    email: user.email || "",
    roles: [],
    phone: user.phone || "",
    visible_name: user.visible_name || "",
  });

  const organizations = useAppSelector(selectOrganizations);
  // Populate initial role assignments once roles are loaded
  useEffect(() => {
    const userRoles = allUserRoles
      .filter((r) => r.user_id === user.id && r.organization_id && r.role_name)
      .map((r) => ({
        id: r.id,
        org_id: r.organization_id as string,
        role_name: r.role_name as string,
        is_active: !!r.is_active,
        org_name: r.organization_name!,
        isNewRole: false,
      }));
    setRoleAssignments(userRoles);
  }, [allUserRoles, user.id]);

  // Ensure organizations list is loaded for the org picker
  useEffect(() => {
    if (organizations.length === 0) {
      void dispatch(fetchAllOrganizations({ page: 1, limit: 30 }));
    }
  }, [organizations.length, dispatch]);

  // Handle changes for normal input fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // useEffect(() => {
  //   if (roleAssignments[roleAssignments.length - 1].org_name === "High council") setRoleAssignments({})
  // }, [roleAssignments]);

  // Role assignment helpers
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
            ? ra // keep as‑is; org edit disabled
            : { ...ra, [field]: value }
          : ra,
      ),
    );
  };

  const handleOrgChange = (index: number, orgId: string) => {
    const org = organizations.find((org) => org.id === orgId);
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
        org_name: isSuper ? "" : activeOrgName!,
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
    try {
      // Remove "roles" key—the column no longer exists in user_profiles
      const { roles: _roles, ...profileData } = formData;
      await dispatch(
        updateUser({ id: user.id, data: { ...profileData, id: user.id } }),
      ).unwrap();
      toast.success(t.userEditModal.messages.success[lang]);

      // --- Sync role assignments with backend ---
      const originalRoles = allUserRoles.filter((r) => r.user_id === user.id);
      const toCreate = roleAssignments.filter(
        (ra) =>
          !originalRoles.some(
            (or) =>
              or.organization_id === ra.org_id && or.role_name === ra.role_name,
          ),
      );
      const toDelete = originalRoles.filter(
        (or) =>
          !roleAssignments.some(
            (ra) =>
              ra.org_id === or.organization_id && ra.role_name === or.role_name,
          ),
      );

      // Detect rows whose active flag changed
      const toUpdate = roleAssignments.filter((ra) => {
        const orig = originalRoles.find((or) => or.id === ra.id);
        return ra.id && orig && orig.is_active !== ra.is_active;
      });

      for (const ru of toUpdate) {
        await updateRole(ru.id as string, { is_active: ru.is_active });
      }

      for (const ra of toCreate) {
        if (!ra.org_id || !ra.role_name) continue; // skip incomplete rows
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
      toast.error(t.userEditModal.messages.error[lang]);
    }
  };

  const unassignedOrgs = organizations.filter(
    (org) => !assignedOrgIds.has(org.id),
  );
  const orgChoices = isSuper
    ? unassignedOrgs
    : organizations.filter((o) => o.id === activeOrgId);
  const TENANT_ADMIN_ROLE_CHOICES = [
    "tenant_admin",
    "storage_manager",
    "requester",
  ];
  const roleChoices = isSuper
    ? availableRoles
    : availableRoles.filter((role) =>
        TENANT_ADMIN_ROLE_CHOICES.includes(role.role),
      );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size={"sm"}
          title={t.userEditModal.title[lang]}
          className="text-highlight2/80 hover:text-highlight2 hover:bg-highlight2/20"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-start text-2xl">
            {t.userEditModal.title[lang]}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 gap-y-4 flex flex-wrap ">
          <div className="flex-grow-1 w-6/12 ">
            <Label htmlFor="full_name">
              {t.userEditModal.labels.fullName[lang]}
            </Label>
            <Input
              className="w-11/12"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder={t.userEditModal.placeholders.fullName[lang]}
            />
          </div>
          <div className="flex-grow-1 w-6/12">
            <Label htmlFor="email">{t.userEditModal.labels.email[lang]}</Label>
            <Input
              className="w-11/12"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t.userEditModal.placeholders.email[lang]}
            />
          </div>
          <div className="flex-grow-1 w-6/12">
            <Label htmlFor="phone">{t.userEditModal.labels.phone[lang]}</Label>
            <Input
              className="w-11/12"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={t.userEditModal.placeholders.phone[lang]}
            />
          </div>
          <div className="flex-grow-1 w-6/12">
            <Label htmlFor="visible_name">
              {t.userEditModal.labels.visibleName[lang]}
            </Label>
            <Input
              className="w-11/12"
              name="visible_name"
              value={formData.visible_name}
              onChange={handleChange}
              placeholder={t.userEditModal.placeholders.visibleName[lang]}
            />
          </div>

          <div className="flex-grow-1">
            <Label>{t.userEditModal.labels.roles[lang]}</Label>

            {canManageRoles ? (
              <>
                {roleAssignments.length > 0 ? (
                  <>
                    <div className="border rounded-md max-h-64 overflow-y-auto">
                      {/* header */}
                      <div className="grid grid-cols-[1fr_1fr_80px_auto] gap-2 px-3 py-2 text-xs font-medium text-muted-foreground sticky top-0 bg-background z-10">
                        <span>{columns.org}</span>
                        <span>{columns.role}</span>
                        <span>{columns.active}</span>
                        <span>{columns.actions}</span>
                      </div>

                      {/* rows */}
                      {roleAssignments.map((ra, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-[1fr_1fr_80px_auto] gap-2 px-3 py-2 items-center"
                        >
                          {/* Organization column */}
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
                                    t.userEditModal.placeholders
                                      .selectOrganization[lang]
                                  }
                                >
                                  {ra.org_name}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {orgChoices.map((org) => (
                                  <SelectItem key={org.id} value={org.id}>
                                    {org.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                          {/* Role picker */}
                          <Select
                            onValueChange={(value) =>
                              handleRoleAssignmentChange(
                                index,
                                "role_name",
                                value,
                              )
                            }
                            disabled={
                              (!isSuper && ra.org_id !== activeOrgId) ||
                              (ra.org_name === "Global" &&
                                Boolean(ra.role_name)) ||
                              (isAssigningRole && !lastRoleEntry.org_id)
                            }
                            defaultValue={ra.role_name ?? ""}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={
                                  t.userEditModal.placeholders.selectRole[lang]
                                }
                              >
                                {formatRoleName(ra.role_name ?? "")}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {(ra.org_name === "High council"
                                ? roleChoices.filter((r) =>
                                    SUPER_ROLES.includes(r.role),
                                  )
                                : ra.org_name === "Global"
                                  ? roleChoices.filter((r) => r.role === "user")
                                  : roleChoices.filter(
                                      (r) =>
                                        r.role !== "user" &&
                                        !SUPER_ROLES.includes(r.role),
                                    )
                              ).map((r) => (
                                <SelectItem key={r.id} value={r.role}>
                                  {formatRoleName(r.role)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Active toggle */}
                          <Switch
                            disabled={ra.org_id !== activeOrgId && !isSuper}
                            checked={ra.is_active}
                            onCheckedChange={() => toggleRoleActive(index)}
                            className="justify-self-center"
                          />

                          {/* Remove */}
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="justify-self-end"
                            onClick={() => removeRoleAssignment(index)}
                          >
                            {t.userEditModal.buttons.remove[lang]}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm mt-4 text-center mb-2">
                    User has no current roles
                  </p>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-1">
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
                    {t.userEditModal.status.noRoles[lang]}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="justify-between w-full">
          <Button
            variant="default"
            className="border-1-grey"
            type="button"
            size="sm"
            onClick={addRoleAssignment}
            disabled={
              isAssigningRole || (!isSuper && assignedOrgIds.has(activeOrgId))
            }
          >
            {t.userEditModal.buttons.addRole[lang]}
          </Button>

          <Button variant="outline" onClick={handleSave} size={"sm"}>
            {t.userEditModal.buttons.save[lang]}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserEditModal;
