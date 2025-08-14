import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

const UserEditModal = ({ user }: { user: UserProfile }) => {
  const dispatch = useAppDispatch();
  // Translation
  const { lang } = useLanguage();

  // Column header keys for the role grid
  const columns = {
    org: t.userEditModal.columns?.organization?.[lang] ?? "Organization",
    role: t.userEditModal.columns?.role?.[lang] ?? "Role",
    active: t.userEditModal.columns?.active?.[lang] ?? "Active",
    actions: t.userEditModal.columns?.actions?.[lang] ?? "Actions",
  };

  const {
    availableRoles,
    allUserRoles,
    hasAnyRole,
    createRole,
    updateRole,
    permanentDeleteRole,
  } = useRoles();

  const canManageRoles = hasAnyRole(["super_admin", "superVera"]);
  const [formData, setFormData] = useState<UserFormData>({
    full_name: user.full_name || "",
    email: user.email || "",
    roles: [],
    phone: user.phone || "",
    visible_name: user.visible_name || "",
  });

  // Role assignments across organizations
  type RoleAssignment = {
    id: string | null; // row id if existing
    organization_id: string | null;
    role_name: string | null;
    is_active: boolean;
  };
  const [roleAssignments, setRoleAssignments] = useState<RoleAssignment[]>([]);

  // Org info
  const organizations = useAppSelector(selectOrganizations);
  // Populate initial role assignments once roles are loaded
  useEffect(() => {
    const userRoles = allUserRoles
      .filter((r) => r.user_id === user.id && r.organization_id && r.role_name)
      .map((r) => ({
        id: r.id,
        organization_id: r.organization_id as string,
        role_name: r.role_name as string,
        is_active: !!r.is_active,
      }));
    setRoleAssignments(userRoles);
  }, [allUserRoles, user.id]);

  // Ensure availableRoles are present (skipInitialFetch suppresses it in the hook)
  /*   useEffect(() => {
    if (canManageRoles && !availableRoles.length) {
      void refreshAvailableRoles();
    }
  }, [canManageRoles, availableRoles.length, refreshAvailableRoles]);
 */
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

  const addRoleAssignment = () => {
    if (!canManageRoles) return;
    setRoleAssignments((prev) => [
      ...prev,
      { id: null, organization_id: null, role_name: null, is_active: true },
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
              or.organization_id === ra.organization_id &&
              or.role_name === ra.role_name,
          ),
      );
      const toDelete = originalRoles.filter(
        (or) =>
          !roleAssignments.some(
            (ra) =>
              ra.organization_id === or.organization_id &&
              ra.role_name === or.role_name,
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
        if (!ra.organization_id || !ra.role_name) continue; // skip incomplete rows
        const roleDef = availableRoles.find((ar) => ar.role === ra.role_name);
        if (roleDef) {
          await createRole({
            user_id: user.id,
            organization_id: ra.organization_id,
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
          <DialogTitle className="mb-4 text-center">
            {t.userEditModal.title[lang]}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {t.userEditModal.description[lang]}
        </DialogDescription>

        <div className="space-y-4">
          <div>
            <Label htmlFor="full_name">
              {t.userEditModal.labels.fullName[lang]}
            </Label>
            <Input
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder={t.userEditModal.placeholders.fullName[lang]}
            />
          </div>
          <div>
            <Label htmlFor="email">{t.userEditModal.labels.email[lang]}</Label>
            <Input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t.userEditModal.placeholders.email[lang]}
            />
          </div>
          <div>
            <Label htmlFor="phone">{t.userEditModal.labels.phone[lang]}</Label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={t.userEditModal.placeholders.phone[lang]}
            />
          </div>

          <div>
            <Label>{t.userEditModal.labels.roles[lang]}</Label>

            {canManageRoles ? (
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
                        <span className="truncate">
                          {organizations.find(
                            (o) => o.id === ra.organization_id,
                          )?.name ?? ra.organization_id}
                        </span>
                      ) : (
                        <Select
                          onValueChange={(value) =>
                            handleRoleAssignmentChange(
                              index,
                              "organization_id",
                              value,
                            )
                          }
                          defaultValue={ra.organization_id ?? undefined}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={
                                t.userEditModal.placeholders.selectOrganization[
                                  lang
                                ]
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {organizations.map((org) => (
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
                          handleRoleAssignmentChange(index, "role_name", value)
                        }
                        defaultValue={ra.role_name ?? undefined}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              t.userEditModal.placeholders.selectRole[lang]
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRoles.map((r) => (
                            <SelectItem key={r.id} value={r.role}>
                              {formatRoleName(r.role)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Active toggle */}
                      <Switch
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

                <Button
                  className="mt-3 bg-background rounded-2xl text-secondary border-secondary border-1 hover:text-background hover:bg-secondary"
                  type="button"
                  size="sm"
                  onClick={addRoleAssignment}
                >
                  {t.userEditModal.buttons.addRole[lang]}
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-1">
                {roleAssignments.length > 0 ? (
                  roleAssignments.map((ra, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded w-max"
                    >
                      {organizations.find((o) => o.id === ra.organization_id)
                        ?.name ?? ra.organization_id}{" "}
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

          <div>
            <Label htmlFor="visible_name">
              {t.userEditModal.labels.visibleName[lang]}
            </Label>
            <Input
              name="visible_name"
              value={formData.visible_name}
              onChange={handleChange}
              placeholder={t.userEditModal.placeholders.visibleName[lang]}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            className="w-full bg-background rounded-2xl text-secondary border-secondary border-1 hover:text-background hover:bg-secondary"
            onClick={handleSave}
            size={"sm"}
          >
            {t.userEditModal.buttons.save[lang]}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserEditModal;
