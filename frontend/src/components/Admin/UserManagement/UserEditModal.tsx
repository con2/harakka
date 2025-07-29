import { Button } from "@/components/ui/button";
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
import { MultiSelect } from "../../ui/multi-select";
import { UserProfile } from "@common/user.types";
import {
  selectOrganizations,
  fetchAllOrganizations,
} from "@/store/slices/organizationSlice";
import { useRoles } from "@/hooks/useRoles";

const UserEditModal = ({ user }: { user: UserProfile }) => {
  const dispatch = useAppDispatch();
  // Translation
  const { lang } = useLanguage();

  const {
    availableRoles,
    allUserRoles,
    createRole,
    permanentDeleteRole,
    isSuperAdmin,
    isSuperVera,
  } = useRoles({ skipInitialFetch: true });

  const canManageRoles = isSuperAdmin || isSuperVera;
  const [formData, setFormData] = useState<UserFormData>({
    full_name: user.full_name || "",
    email: user.email || "",
    roles: [],
    phone: user.phone || "",
    visible_name: user.visible_name || "",
    preferences:
      user.preferences &&
      typeof user.preferences === "object" &&
      !Array.isArray(user.preferences)
        ? (Object.fromEntries(
            Object.entries(user.preferences).filter(
              ([_, v]) => typeof v === "string",
            ),
          ) as Record<string, string>)
        : {},
    saved_lists:
      Array.isArray(user.saved_lists) &&
      user.saved_lists.every((item: unknown) => typeof item === "string")
        ? user.saved_lists
        : [],
  });

  // Role assignments across organizations
  type RoleAssignment = {
    organization_id: string | null;
    role_name: string | null;
  };
  const [roleAssignments, setRoleAssignments] = useState<RoleAssignment[]>([]);

  // Org info
  const organizations = useAppSelector(selectOrganizations);
  // Populate initial role assignments once roles are loaded
  useEffect(() => {
    const userRoles = allUserRoles
      .filter((r) => r.user_id === user.id && r.organization_id && r.role_name)
      .map((r) => ({
        organization_id: r.organization_id as string,
        role_name: r.role_name as string,
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

  // Handle changes for preferences input (key-value pairs)
  const handlePreferencesChange = (key: string, value: string) => {
    setFormData({
      ...formData,
      preferences: { ...formData.preferences, [key]: value },
    });
  };

  // Add a new preference field
  const addPreference = () => {
    const newPreferenceKey = `new_key_${Date.now()}`;
    setFormData({
      ...formData,
      preferences: { ...formData.preferences, [newPreferenceKey]: "" },
    });
  };

  // Remove a preference field by its key
  const removePreference = (key: string) => {
    const newPreferences = { ...formData.preferences };
    delete newPreferences[key];
    setFormData({ ...formData, preferences: newPreferences });
  };

  // Handle changes for saved lists (multi-select)
  const handleSavedListsChange = (newSavedLists: string[]) => {
    setFormData({ ...formData, saved_lists: newSavedLists });
  };

  // Role assignment helpers
  const handleRoleAssignmentChange = (
    index: number,
    field: "organization_id" | "role_name",
    value: string | null,
  ) => {
    if (!canManageRoles) return;
    setRoleAssignments((prev) =>
      prev.map((ra, i) => (i === index ? { ...ra, [field]: value } : ra)),
    );
  };

  const addRoleAssignment = () => {
    if (!canManageRoles) return;
    setRoleAssignments((prev) => [
      ...prev,
      { organization_id: null, role_name: null },
    ]);
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
                {roleAssignments.map((ra, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    {/* Organization picker */}
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
                      <SelectTrigger className="w-[160px]">
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

                    {/* Role picker */}
                    <Select
                      onValueChange={(value) =>
                        handleRoleAssignmentChange(index, "role_name", value)
                      }
                      defaultValue={ra.role_name ?? undefined}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue
                          placeholder={
                            t.userEditModal.placeholders.selectRole[lang]
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map((r) => (
                          <SelectItem key={r.id} value={r.role}>
                            {r.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Remove row */}
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => removeRoleAssignment(index)}
                    >
                      {t.userEditModal.buttons.remove[lang]}
                    </Button>
                  </div>
                ))}

                <Button
                  className="bg-background rounded-2xl text-secondary border-secondary border-1 hover:text-background hover:bg-secondary"
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

          <div>
            <Label>{t.userEditModal.labels.preferences[lang]}</Label>
            {Object.keys(formData.preferences).map((key) => (
              <div key={key} className="flex space-x-2">
                <Input
                  className="mb-2"
                  name={`preference_${key}`}
                  value={formData.preferences[key]}
                  onChange={(e) => handlePreferencesChange(key, e.target.value)}
                  placeholder={t.userEditModal.placeholders.preference[lang]}
                />
                <Button
                  type="button"
                  className="deleteBtn"
                  onClick={() => removePreference(key)}
                  size={"sm"}
                >
                  {t.userEditModal.buttons.remove[lang]}
                </Button>
              </div>
            ))}
            <Button
              className="bg-background rounded-2xl text-secondary border-secondary border-1 hover:text-background hover:bg-secondary"
              type="button"
              onClick={addPreference}
              size={"sm"}
            >
              {t.userEditModal.buttons.addPreference[lang]}
            </Button>
          </div>

          <div>
            <Label>{t.userEditModal.labels.savedLists[lang]}</Label>
            <MultiSelect
              selected={formData.saved_lists || []}
              options={["List 1", "List 2", "List 3", "List 4"]} // Replace with actual saved list options
              onChange={handleSavedListsChange}
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
