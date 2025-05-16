import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAppDispatch } from "@/store/hooks";
import { fetchAllItems, updateItem } from "@/store/slices/itemsSlice";
import { Item } from "@/types";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  fetchAllTags,
  fetchTagsForItem,
  assignTagToItem,
  selectAllTags,
  selectSelectedTags,
} from "@/store/slices/tagSlice";
import { useAppSelector } from "@/store/hooks";
import { Checkbox } from "@/components/ui/checkbox";
import ItemImageManager from "./ItemImageManager";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchAllLocations,
  selectAllLocations,
} from "@/store/slices/locationsSlice";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

type UpdateItemModalProps = {
  onClose: () => void;
  initialData: Item; // Assume initialData is always passed for updating
};

const UpdateItemModal = ({ onClose, initialData }: UpdateItemModalProps) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<Item>(initialData); // Initialize directly from initialData
  const [loading, setLoading] = useState(false);
  const tags = useAppSelector(selectAllTags);
  const selectedTags = useAppSelector(selectSelectedTags);
  const [localSelectedTags, setLocalSelectedTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"details" | "images">("details");
  const locations = useAppSelector(selectAllLocations);
  // Translation
  const { lang } = useLanguage();

  // Prefill the form with initial data if available
  useEffect(() => {
    if (initialData) {
      setFormData(initialData); // Set form data directly from initialData
    }
  }, [initialData]);

  useEffect(() => {
    dispatch(fetchAllTags());
    dispatch(fetchTagsForItem(formData.id)); // fetch tags for this item
    dispatch(fetchAllLocations());
  }, [dispatch, formData.id]);

  useEffect(() => {
    if (selectedTags) {
      setLocalSelectedTags(selectedTags.map((tag) => tag.id));
    }
  }, [selectedTags]);

  const handleTagToggle = (tagId: string) => {
    setLocalSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  // Handle changes in input fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Handle nested fields (like translations) separately
    if (name.startsWith("translations")) {
      const language = name.split(".")[1] as keyof typeof formData.translations;
      setFormData((prev) => ({
        ...prev,
        translations: {
          ...prev.translations,
          [language]: {
            ...prev.translations[language],
            [name.split(".")[2]]: value,
          },
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle form submission (only for updating)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create a clean copy of the data without the properties that should not be sent
      const cleanedData = { ...formData };
      // Remove properties that don't exist as columns in the database table
      delete cleanedData.storage_item_tags;
      delete cleanedData.tagIds;
      delete (cleanedData as any).storage_locations;

      // Explicitly ensure location_id is included
      const updateData = {
        ...cleanedData,
        location_id: formData.location_id,
      };

      console.log("Sending update with location_id:", formData.location_id);

      await dispatch(
        updateItem({ id: formData.id, data: updateData }),
      ).unwrap();
      await dispatch(
        assignTagToItem({ itemId: formData.id, tagIds: localSelectedTags }),
      ).unwrap();
      dispatch(fetchAllItems());
      toast.success(t.updateItemModal.messages.success[lang]);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(t.updateItemModal.messages.error[lang]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.updateItemModal.title[lang]}</DialogTitle>
          <DialogDescription className="text-center">
            {t.updateItemModal.description[lang]}
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 ${
              activeTab === "details"
                ? "border-b-2 border-secondary font-medium"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("details")}
          >
            {t.updateItemModal.tabs.details[lang]}
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "images"
                ? "border-b-2 border-secondary font-medium"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("images")}
          >
            {t.updateItemModal.tabs.images[lang]}
          </button>
        </div>

        {activeTab === "details" ? (
          // Your existing form content
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Item Translation Fields */}
              <div className="space-y-4">
                {/* Item Names - Side by Side */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="translations.fi.item_name">
                      {t.updateItemModal.labels.itemNameFi[lang]}
                    </Label>
                    <Input
                      id="translations.fi.item_name"
                      name="translations.fi.item_name"
                      value={formData.translations.fi.item_name}
                      onChange={handleChange}
                      placeholder={
                        t.updateItemModal.placeholders.itemNameFi[lang]
                      }
                      className="placeholder:text-xs p-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="translations.en.item_name">
                      {t.updateItemModal.labels.itemNameEn[lang]}
                    </Label>
                    <Input
                      id="translations.en.item_name"
                      name="translations.en.item_name"
                      value={formData.translations.en.item_name}
                      onChange={handleChange}
                      placeholder={
                        t.updateItemModal.placeholders.itemNameEn[lang]
                      }
                      className="placeholder:text-xs p-2"
                      required
                    />
                  </div>
                </div>

                {/* Item Types - Side by Side (if they exist in your schema) */}
                {(formData.translations.fi.item_type !== undefined ||
                  formData.translations.en.item_type !== undefined) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="translations.fi.item_type">
                        {t.updateItemModal.labels.itemTypeFi[lang]}
                      </Label>
                      <Input
                        id="translations.fi.item_type"
                        name="translations.fi.item_type"
                        value={formData.translations.fi.item_type || ""}
                        onChange={handleChange}
                        placeholder={
                          t.updateItemModal.placeholders.itemTypeFi[lang]
                        }
                        className="placeholder:text-xs p-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="translations.en.item_type">
                        {t.updateItemModal.labels.itemTypeEn[lang]}
                      </Label>
                      <Input
                        id="translations.en.item_type"
                        name="translations.en.item_type"
                        value={formData.translations.en.item_type || ""}
                        placeholder={
                          t.updateItemModal.placeholders.itemTypeEn[lang]
                        }
                        className="placeholder:text-xs p-2"
                      />
                    </div>
                  </div>
                )}

                {/* Item Descriptions - Side by Side */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="translations.fi.item_description">
                      {t.updateItemModal.labels.itemDescFi[lang]}
                    </Label>
                    <Input
                      id="translations.fi.item_description"
                      name="translations.fi.item_description"
                      value={formData.translations.fi.item_description}
                      onChange={handleChange}
                      placeholder={
                        t.updateItemModal.placeholders.itemDescFi[lang]
                      }
                      className="placeholder:text-xs p-2 shadow-sm ring-1 ring-inset ring-muted"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="translations.en.item_description">
                      {t.updateItemModal.labels.itemDescEn[lang]}
                    </Label>
                    <Input
                      id="translations.en.item_description"
                      name="translations.en.item_description"
                      value={formData.translations.en.item_description}
                      onChange={handleChange}
                      placeholder={
                        t.updateItemModal.placeholders.itemDescEn[lang]
                      }
                      className="placeholder:text-xs p-2 shadow-sm ring-1 ring-inset ring-muted"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location_id">
                  {t.updateItemModal.labels.location[lang]}
                </Label>
                <Select
                  value={formData.location_id || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, location_id: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        t.updateItemModal.placeholders.selectLocation[lang]
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price */}
              <div className="flex flex-row items-baseline space-y-4 space-x-4">
                <div className="flex flex-row items-baseline space-x-2">
                  <Label htmlFor="price" className="font-medium">
                    {t.updateItemModal.labels.price[lang]}
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder={t.updateItemModal.placeholders.price[lang]}
                    required
                    className="w-60"
                  />
                </div>
                {/* Active Toggle */}
                <div className="flex flex-row items-center space-x-2">
                  <Label htmlFor="is_active" className="font-medium">
                    {t.updateItemModal.labels.active[lang]}
                  </Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked: boolean) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_active: checked,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Quantity Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="items_number_total">
                      {t.updateItemModal.labels.totalQuantity[lang]}
                    </Label>
                    <Input
                      id="items_number_total"
                      name="items_number_total"
                      type="number"
                      value={formData.items_number_total}
                      onChange={handleChange}
                      placeholder={
                        t.updateItemModal.placeholders.totalQuantity[lang]
                      }
                      className="value:text-xs"
                    />
                  </div>

                  <div>
                    <Label htmlFor="items_number_currently_in_storage">
                      {t.updateItemModal.labels.currentlyInStorage[lang]}
                    </Label>
                    <Input
                      id="items_number_currently_in_storage"
                      name="items_number_currently_in_storage"
                      type="number"
                      value={formData.items_number_currently_in_storage || 0}
                      onChange={handleChange}
                      placeholder={
                        t.updateItemModal.placeholders.currentlyInStorage[lang]
                      }
                      className="value:text-xs"
                    />
                  </div>

                  <div>
                    <Label htmlFor="items_number_available">
                      {t.updateItemModal.labels.available[lang]}
                    </Label>
                    <Input
                      id="items_number_available"
                      name="items_number_available"
                      type="number"
                      value={formData.items_number_available}
                      onChange={handleChange}
                      placeholder={
                        t.updateItemModal.placeholders.available[lang]
                      }
                      className="value:text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Tag Selection */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  {t.updateItemModal.tags.title[lang]}
                </h3>
                <div className="grid grid-cols-2 max-h-60 overflow-y-auto">
                  {tags.map((tag) => (
                    <label key={tag.id} className="flex items-center">
                      <Checkbox
                        className="m-0.75 border-secondary text-primary data-[state=checked]:bg-secondary data-[state=checked]:text-white"
                        checked={localSelectedTags.includes(tag.id)}
                        onCheckedChange={() => handleTagToggle(tag.id)}
                      />
                      <span className="text-sm">
                        {tag.translations?.fi?.name ||
                          tag.translations?.en?.name ||
                          "Unnamed"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
                disabled={loading}
                size={"sm"}
              >
                {loading
                  ? t.updateItemModal.buttons.updating[lang]
                  : t.updateItemModal.buttons.update[lang]}
              </Button>
            </form>
          </div>
        ) : (
          // Image manager component
          <>
            <ItemImageManager itemId={formData.id} />
            <DialogFooter>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
                size={"sm"}
              >
                {loading
                  ? t.updateItemModal.buttons.updating[lang]
                  : t.updateItemModal.buttons.update[lang]}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UpdateItemModal;
