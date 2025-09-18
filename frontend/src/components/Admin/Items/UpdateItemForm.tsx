import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Item } from "@/types/item";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import ItemImageManager from "@/components/Admin/Items/ItemImageManager";
import { LoaderCircle } from "lucide-react";
import {
  fetchAllTags,
  selectAllTags,
  selectSelectedTags,
  selectTagsLoading,
} from "@/store/slices/tagSlice";
import {
  fetchAllLocations,
  selectAllLocations,
} from "@/store/slices/locationsSlice";
import {
  fetchAllOrgLocations,
  selectOrgLocations,
} from "@/store/slices/organizationLocationsSlice";
import { selectActiveOrganizationId } from "@/store/slices/rolesSlice";
import { updateItem } from "@/store/slices/itemsSlice";
import { fetchTagsForItem as fetchTagsForItemAction } from "@/store/slices/tagSlice";
import { toast } from "sonner";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import "@/store/utils/validate";
import {
  buildCandidateFrom as buildCandidateFromHelper,
  validateCandidateWithMessages,
} from "@/utils/updateItemHelpers";
import { Separator } from "@/components/ui/separator";
import {
  fetchAllCategories,
  selectCategories,
} from "@/store/slices/categoriesSlice";

type Props = {
  initialData: Item | null;
  editable: boolean;
  onSaved?: () => void;
  onActiveTabChange?: (tab: "details" | "images") => void;
};

const UpdateItemForm: React.FC<Props> = ({
  initialData,
  editable,
  onSaved,
  onActiveTabChange,
}) => {
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();
  const tags = useAppSelector(selectAllTags);
  const categories = useAppSelector(selectCategories);
  const selectedTags = useAppSelector(selectSelectedTags);
  const tagsLoading = useAppSelector(selectTagsLoading);
  const locations = useAppSelector(selectAllLocations);
  const orgLocations = useAppSelector(selectOrgLocations);
  const orgId = useAppSelector(selectActiveOrganizationId);

  const [formData, setFormData] = useState<Item | null>(initialData);
  const [localSelectedTags, setLocalSelectedTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"details" | "images">("details");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  useEffect(() => {
    if (!initialData) return;
    if (tags.length === 0) void dispatch(fetchAllTags({ limit: 20 }));
    if (locations.length === 0) void dispatch(fetchAllLocations({ limit: 20 }));
    if (orgLocations.length === 0 && orgId)
      void dispatch(fetchAllOrgLocations({ orgId: orgId, pageSize: 100 }));
  }, [
    dispatch,
    initialData,
    tags.length,
    locations.length,
    orgLocations.length,
    orgId,
    categories,
  ]);

  useEffect(() => {
    void dispatch(fetchAllCategories({ limit: 20 }));
  }, []); // eslint-disable-line

  useEffect(() => {
    if (selectedTags) setLocalSelectedTags(selectedTags.map((t) => t?.id));
  }, [selectedTags]);

  useEffect(() => {
    onActiveTabChange?.(activeTab);
  }, [activeTab, onActiveTabChange]);

  useEffect(() => {
    if (!editable) {
      setFormData(initialData);
      setLocalSelectedTags((selectedTags || []).map((t) => t?.id));
      setActiveTab("details");
    }
  }, [editable, initialData, selectedTags]);

  if (!formData) return null;

  const handleSubmit = async () => {
    if (!formData) return;
    if (editable && activeTab === "details") {
      setActiveTab("images");
      toast(
        "Please switch to the Images tab and confirm image changes before saving.",
      );
      return;
    }
    if (!orgId) return toast.error(t.updateItemForm.messages.missingOrg[lang]);

    // Validate using centralized helper
    const candidate = buildCandidateFromHelper(
      formData,
      localSelectedTags,
      orgLocations,
    );

    if (!validateCandidateWithMessages(candidate, lang)) return;

    try {
      setLoading(true);
      const payload: Partial<{
        [k: string]: unknown;
      }> = {
        ...formData,
        tags: localSelectedTags,
        location_details: formData.location_details ?? undefined,
      };

      await dispatch(
        updateItem({
          orgId: orgId,
          item_id: String(formData.id),
          data: payload,
        }),
      ).unwrap();

      await dispatch(fetchTagsForItemAction(String(formData.id))).unwrap();
      toast.success(t.updateItemForm.messages.success[lang]);
      onSaved?.();
    } catch (err) {
      console.error(err);
      toast.error(t.updateItemForm.messages.error[lang]);
    } finally {
      setLoading(false);
    }
  };

  const validateBeforeImages = (): boolean => {
    if (!formData) return false;

    const candidate = buildCandidateFromHelper(
      formData,
      localSelectedTags,
      orgLocations,
    );

    return validateCandidateWithMessages(candidate, lang);
  };

  return (
    <div>
      <div className="flex border-b mb-8">
        <button
          className={`px-4 py-1 ${
            activeTab === "details"
              ? "border-b-2 border-secondary font-medium"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("details")}
          type="button"
        >
          {t.updateItemForm.tabs.details[lang]}
        </button>
        <button
          className={`px-4 py-1 ${
            activeTab === "images"
              ? "border-b-2 border-secondary font-medium"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("images")}
          type="button"
        >
          {t.updateItemForm.tabs.images[lang]}
        </button>
      </div>

      {activeTab === "details" ? (
        <div className="space-y-6 max-w-6xl">
          {tagsLoading && (
            <div className="flex justify-center p-4">
              <LoaderCircle className="h-4 w-4 animate-spin" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t.updateItemForm.labels.itemNameFi[lang]}</Label>
              <Input
                value={formData.translations.fi.item_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...(prev as Item),
                    translations: {
                      ...(prev as Item).translations,
                      fi: {
                        ...(prev as Item).translations.fi,
                        item_name: e.target.value,
                      },
                    },
                  }))
                }
                disabled={!editable}
              />
            </div>
            <div>
              <Label>{t.updateItemForm.labels.itemNameEn[lang]}</Label>
              <Input
                value={formData.translations.en.item_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...(prev as Item),
                    translations: {
                      ...(prev as Item).translations,
                      en: {
                        ...(prev as Item).translations.en,
                        item_name: e.target.value,
                      },
                    },
                  }))
                }
                disabled={!editable}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t.updateItemForm.labels.itemDescFi[lang]}</Label>
              <Textarea
                value={formData.translations.fi.item_description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...(prev as Item),
                    translations: {
                      ...(prev as Item).translations,
                      fi: {
                        ...(prev as Item).translations.fi,
                        item_description: e.target.value,
                      },
                    },
                  }))
                }
                disabled={!editable}
                className="h-24"
              />
            </div>
            <div>
              <Label>{t.updateItemForm.labels.itemDescEn[lang]}</Label>
              <Textarea
                value={formData.translations.en.item_description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...(prev as Item),
                    translations: {
                      ...(prev as Item).translations,
                      en: {
                        ...(prev as Item).translations.en,
                        item_description: e.target.value,
                      },
                    },
                  }))
                }
                disabled={!editable}
                className="h-24"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <Label>{t.updateItemForm.labels.category[lang]}</Label>
              <Select
                value={formData.category_id || ""}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...(prev as Item),
                    category_id: value,
                  }))
                }
                disabled={!editable}
              >
                <SelectTrigger className="w-60 bg-white">
                  <SelectValue>
                    {categories.find((c) => c.id === formData.category_id)
                      ?.translations[lang] || "---"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.translations[lang]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t.updateItemForm.labels.location[lang]}</Label>
              <Select
                value={formData.location_id || ""}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...(prev as Item),
                    location_id: value,
                  }))
                }
                disabled={!editable}
              >
                <SelectTrigger className="w-60 bg-white">
                  <SelectValue
                    placeholder={
                      t.updateItemForm.placeholders.selectLocation[lang]
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {orgLocations.map((location) => (
                    <SelectItem
                      key={location.id}
                      value={location.storage_location_id}
                    >
                      {location.storage_locations?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t.adminItemsTable.columns.quantity[lang]}</Label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...(prev as Item),
                    quantity: Number(e.target.value),
                  }))
                }
                disabled={!editable}
                className="w-60 bg-white"
              />
            </div>

            <div className="flex flex-col items-start space-x-2">
              <Label>{t.adminItemsTable.columns.active[lang]}</Label>
              <Switch
                checked={Boolean(formData.is_active)}
                onCheckedChange={(v) =>
                  setFormData((prev) => ({
                    ...(prev as Item),
                    is_active: Boolean(v),
                  }))
                }
                disabled={!editable}
                className="mt-2"
              />
            </div>
          </div>
          <Separator />
          {/* tags checkboxes */}
          <div>
            <strong>{t.updateItemForm.tags.title[lang] ?? "Tags"}: </strong>
            <div className="grid grid-cols-5 mt-2">
              {tags.map((tag) => (
                <label key={tag.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={localSelectedTags.includes(tag.id)}
                    onCheckedChange={() =>
                      setLocalSelectedTags((prev) =>
                        prev.includes(tag.id)
                          ? prev.filter((id) => id !== tag.id)
                          : [...prev, tag.id],
                      )
                    }
                    disabled={!editable}
                  />
                  <span>
                    {tag.translations?.[lang]?.name ??
                      tag.translations?.fi?.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {editable ? (
            <div className="flex justify-end mt-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    const ok = validateBeforeImages();
                    if (ok) setActiveTab("images");
                  }}
                >
                  {t.updateItemForm.buttons.goToImages?.[lang] ??
                    "Proceed to Images"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-36 h-8"></div>
          )}
        </div>
      ) : (
        <div>
          {formData && (
            <>
              <ItemImageManager itemId={String(formData.id)} />

              {editable && (
                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    variant={"outline"}
                    onClick={() => void handleSubmit()}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        {t.updateItemForm.buttons.update[lang]}
                        <LoaderCircle className="h-4 w-4 animate-spin ml-2" />
                      </>
                    ) : (
                      t.updateItemForm.buttons.update[lang]
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UpdateItemForm;
