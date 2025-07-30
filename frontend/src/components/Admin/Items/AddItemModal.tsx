import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectItemsError,
  selectItemsErrorContext,
} from "@/store/slices/itemsSlice";
import { toast } from "sonner";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Switch } from "../../ui/switch";
import {
  fetchAllTags,
  selectAllTags,
  selectTagsLoading,
} from "@/store/slices/tagSlice";
import { ItemFormData } from "@/types";
import { Checkbox } from "../../ui/checkbox";
import ItemImageManager from "./ItemImageManager";
import {
  openItemModal,
  closeItemModal,
  selectItemModalState,
} from "@/store/slices/uiSlice";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Import translation utilities
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { selectCurrentOrgLocations } from "@/store/slices/organizationLocationsSlice";
import { createItemDto } from "@/store/utils/validate";

const initialFormState: ItemFormData = {
  id: "",
  location_id: "",
  location_details: {
    name: "",
    address: "",
  },
  items_number_total: 1,
  items_number_currently_in_storage: 1,
  price: 0,
  is_active: true,
  translations: {
    fi: {
      item_type: "",
      item_name: "",
      item_description: "",
    },
    en: {
      item_type: "",
      item_name: "",
      item_description: "",
    },
  },
  tagIds: [],
};

type AddItemModalProps = {
  onAdd: (item: ItemFormData) => void;
  storage: { name: string; id: string; address: string } | null | undefined;
  children?: React.ReactNode;
};

const AddItemModal = (props: AddItemModalProps) => {
  const dispatch = useAppDispatch();
  const availableTags = useAppSelector(selectAllTags);
  const error = useAppSelector(selectItemsError);
  const errorContext = useAppSelector(selectItemsErrorContext);
  const { lang } = useLanguage(); // Get current language
  const tags = useAppSelector(selectAllTags);
  const { onAdd, children, storage } = props;
  const orgLocations = useAppSelector(selectCurrentOrgLocations)!;
  const loading = useAppSelector(selectTagsLoading);

  // Use global modal state from Redux
  const modalState = useAppSelector(selectItemModalState);

  const [formData, setFormData] = useState<ItemFormData>({
    ...initialFormState,
    location_id: storage?.id ?? orgLocations?.[0].storage_location_id,
    location_details: {
      name: storage?.name ?? orgLocations?.[0].storage_locations.name ?? "",
      address:
        storage?.address ?? orgLocations?.[0].storage_locations.name ?? "",
    },
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"details" | "images">("details");

  // Display errors when they occur
  useEffect(() => {
    if (error && errorContext === "create") {
      toast.error(error);
    }
  }, [error, errorContext]);

  useEffect(() => {
    const location_details = orgLocations.find(
      (loc) => loc.storage_location_id === formData.location_id,
    );
    if (location_details && "storage_locations" in location_details) {
      setFormData({
        ...formData,
        location_id: location_details.storage_location_id,
        location_details: {
          name:
            location_details?.storage_locations?.name ??
            `Location #${formData.location_id}`,
          address: location_details?.storage_locations?.address ?? "",
        },
      });
    }
  }, [formData.location_id]);

  useEffect(() => {
    if (tags.length === 0) void dispatch(fetchAllTags({ limit: 20 }));
  }, [dispatch, modalState.isOpen, tags.length]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    // Handle nested fields for translations (FI and EN)
    if (name.includes(".")) {
      const [parent, child, field] = name.split(".");

      if (parent === "translations") {
        if (child === "fi" || child === "en") {
          setFormData({
            ...formData,
            translations: {
              ...formData.translations,
              [child]: {
                ...formData.translations[child],
                [field]: value,
              },
            },
          });
        }
      }
    } else {
      // Handle numeric values
      if (
        name === "price" ||
        name === "items_number_total" ||
        name === "items_number_currently_in_storage"
      ) {
        setFormData({
          ...formData,
          [name]: parseFloat(value) || 0,
        } as ItemFormData);
      } else if (name === "location_id" || name === "compartment_id") {
        setFormData({
          ...formData,
          [name]: value,
        } as ItemFormData);
      }
    }
  };

  const handleToggleChange = (checked: boolean) => {
    setFormData({
      ...formData,
      is_active: checked,
    });
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  useEffect(
    () => setFormData({ ...formData, id: crypto.randomUUID() }),
    [] /* eslint-disable-line */,
  );

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const result = createItemDto.safeParse(formData);

    if (!result.success) {
      toast.error(result.error.errors[0].message);
      const fieldErrors = result.error.flatten().fieldErrors;
      console.log("Validation errors:", fieldErrors);
      return;
    }

    onAdd(formData);
    resetForm();
    dispatch(closeItemModal());
  };

  // Reset form and close modal
  const resetForm = () => {
    setSelectedTags([]);
    setActiveTab("details");
    dispatch(closeItemModal());
  };

  return (
    <Dialog
      open={modalState.isOpen}
      onOpenChange={(isOpen) => {
        if (isOpen) {
          dispatch(openItemModal());
        } else {
          // Handle close confirmation
          if (activeTab === "images" && modalState.createdItemId) {
            if (confirm(t.addItemModal.messages.closeConfirm[lang])) {
              resetForm();
            }
          } else {
            resetForm();
          }
        }
      }}
    >
      <DialogTrigger asChild onClick={() => dispatch(openItemModal())}>
        {children}
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="mb-0">
            {t.addItemModal.title[lang]}
          </DialogTitle>
          <DialogDescription className="text-center"></DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex border-b mb-2">
          <button
            className={`px-4 py-1 text-sm ${
              activeTab === "details"
                ? "border-b-2 border-secondary font-medium"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("details")}
          >
            {t.addItemModal.tabs.details[lang]}
          </button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`px-4 py-1 text-sm ${
                    activeTab === "images"
                      ? "border-b-2 border-secondary font-medium"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("images")}
                >
                  {t.addItemModal.tabs.images[lang]}
                </button>
              </TooltipTrigger>
              {!modalState.createdItemId && (
                <TooltipContent side="top">
                  {t.addItemModal.tooltips.createFirst[lang]}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        {activeTab === "details" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit(e);
            }}
            className="space-y-4"
          >
            {/* Item Translation Fields */}
            <div className="space-y-4">
              {/* Item Names - Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="translations.fi.item_name">
                    {t.addItemModal.labels.itemNameFi[lang]}
                  </Label>
                  <Input
                    id="translations.fi.item_name"
                    name="translations.fi.item_name"
                    value={formData.translations.fi.item_name}
                    onChange={handleChange}
                    placeholder={t.addItemModal.placeholders.itemFi[lang]}
                    className="placeholder:text-xs p-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="translations.en.item_name">
                    {t.addItemModal.labels.itemNameEn[lang]}
                  </Label>
                  <Input
                    id="translations.en.item_name"
                    name="translations.en.item_name"
                    value={formData.translations.en.item_name}
                    onChange={handleChange}
                    placeholder={t.addItemModal.placeholders.itemEn[lang]}
                    className="placeholder:text-xs p-2"
                    required
                  />
                </div>
              </div>

              {/* Item Types - Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="translations.fi.item_type">
                    {t.addItemModal.labels.itemTypeFi[lang]}
                  </Label>
                  <Input
                    id="translations.fi.item_type"
                    name="translations.fi.item_type"
                    value={formData.translations.fi.item_type}
                    onChange={handleChange}
                    placeholder={t.addItemModal.placeholders.typeFi[lang]}
                    className="placeholder:text-xs p-2"
                  />
                </div>
                <div>
                  <Label htmlFor="translations.en.item_type">
                    {t.addItemModal.labels.itemTypeEn[lang]}
                  </Label>
                  <Input
                    id="translations.en.item_type"
                    name="translations.en.item_type"
                    value={formData.translations.en.item_type}
                    onChange={handleChange}
                    placeholder={t.addItemModal.placeholders.typeEn[lang]}
                    className="placeholder:text-xs p-2"
                  />
                </div>
              </div>

              {/* Item Descriptions - Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="translations.fi.item_description">
                    {t.addItemModal.labels.descriptionFi[lang]}
                  </Label>
                  <Textarea
                    id="translations.fi.item_description"
                    name="translations.fi.item_description"
                    value={formData.translations.fi.item_description}
                    onChange={handleChange}
                    placeholder={
                      t.addItemModal.placeholders.descriptionFi[lang]
                    }
                    className="placeholder:text-xs p-2 shadow-sm ring-1 ring-inset ring-muted"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="translations.en.item_description">
                    {t.addItemModal.labels.descriptionEn[lang]}
                  </Label>
                  <Textarea
                    id="translations.en.item_description"
                    name="translations.en.item_description"
                    value={formData.translations.en.item_description}
                    onChange={handleChange}
                    placeholder={
                      t.addItemModal.placeholders.descriptionEn[lang]
                    }
                    className="placeholder:text-xs p-2 shadow-sm ring-1 ring-inset ring-muted"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="flex flex-row items-baseline space-x-2">
                  <Label htmlFor="location_id">
                    {t.addItemModal.labels.location[lang]}
                  </Label>
                  <Select
                    value={storage?.id ?? orgLocations?.[0].storage_location_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, location_id: value })
                    }
                  >
                    <SelectTrigger
                      className="w-40"
                      disabled={storage ? true : false}
                    >
                      <SelectValue
                        placeholder={
                          t.addItemModal.placeholders.selectLocation[lang]
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {orgLocations.map((loc) => (
                        <SelectItem
                          disabled={storage ? true : false}
                          key={loc.id}
                          value={loc.storage_location_id}
                        >
                          {loc.storage_locations.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price and Active Status */}
                <div className="flex flex-row items-baseline space-x-2">
                  <Label htmlFor="price" className="font-medium">
                    {t.addItemModal.labels.price[lang]}
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder={t.addItemModal.labels.price[lang]}
                    required
                    className="w-40"
                  />
                </div>
                <div className="flex flex-row items-center space-x-2">
                  <Label htmlFor="is_active" className="font-medium">
                    {t.addItemModal.labels.active[lang]}
                  </Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={handleToggleChange}
                  />
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="items_number_total">
                  {t.addItemModal.labels.totalQuantity[lang]}
                </Label>
                <Input
                  id="items_number_total"
                  name="items_number_total"
                  type="number"
                  value={formData.items_number_total}
                  onChange={handleChange}
                  min="1"
                  placeholder={t.addItemModal.labels.totalQuantity[lang]}
                  className="value:text-xs"
                />
              </div>

              <div>
                <Label htmlFor="items_number_currently_in_storage">
                  {t.addItemModal.labels.inStorage[lang]}
                </Label>
                <Input
                  id="items_number_currently_in_storage"
                  name="items_number_currently_in_storage"
                  type="number"
                  value={formData.items_number_currently_in_storage}
                  onChange={handleChange}
                  min="0"
                  max={formData.items_number_total}
                  placeholder={t.addItemModal.labels.inStorage[lang]}
                  className="value:text-xs"
                />
              </div>
            </div>

            {/* Tag Selection */}
            <div className="space-y-2">
              <Label>{t.addItemModal.labels.assignTags[lang]}</Label>
              <div className="grid grid-cols-2 max-h-60 overflow-y-auto">
                {availableTags.map((tag) => (
                  <label key={tag.id} className="flex items-center">
                    <Checkbox
                      className="m-0.75 border-secondary text-primary data-[state=checked]:bg-secondary data-[state=checked]:text-white"
                      checked={selectedTags.includes(tag.id)}
                      onCheckedChange={() => handleTagToggle(tag.id)}
                    />
                    <span className="text-sm">
                      {tag.translations?.[lang]?.name ||
                        tag.translations?.[lang === "fi" ? "en" : "fi"]?.name ||
                        "Unnamed"}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant={"secondary"}
                onClick={handleSubmit}
                className="w-full"
                disabled={loading}
                size="sm"
              >
                Add
              </Button>
            </DialogFooter>
          </form>
        ) : modalState.createdItemId ? (
          <>
            <ItemImageManager itemId={modalState.createdItemId} />

            <DialogFooter className="mt-4">
              <Button
                variant={"secondary"}
                onClick={resetForm}
                className="w-full"
                size="sm"
              >
                {t.addItemModal.buttons.done[lang]}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="text-center py-12">
            <p>{t.addItemModal.description.createFirst[lang]}</p>
            <Button
              variant={"secondary"}
              className="w-full"
              onClick={() => setActiveTab("details")}
              size="sm"
            >
              {t.addItemModal.buttons.back[lang]}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddItemModal;
