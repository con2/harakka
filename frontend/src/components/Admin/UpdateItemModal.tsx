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

  // Prefill the form with initial data if available
  useEffect(() => {
    if (initialData) {
      setFormData(initialData); // Set form data directly from initialData
    }
  }, [initialData]);

  useEffect(() => {
    dispatch(fetchAllTags());
    dispatch(fetchTagsForItem(formData.id)); // fetch tags for this item
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

      await dispatch(
        updateItem({ id: formData.id, data: cleanedData }),
      ).unwrap();
      await dispatch(
        assignTagToItem({ itemId: formData.id, tagIds: localSelectedTags }),
      ).unwrap();
      dispatch(fetchAllItems());
      toast.success("Item updated successfully!");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription className="text-center">
            Update item details below.
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
            Details
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "images"
                ? "border-b-2 border-secondary font-medium"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("images")}
          >
            Images
          </button>
        </div>

        {activeTab === "details" ? (
          // Your existing form content
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Item Translation Fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Translations</h3>

                {/* Item Names - Side by Side */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="translations.fi.item_name">
                      Item Name (FI)
                    </label>
                    <Input
                      id="translations.fi.item_name"
                      name="translations.fi.item_name"
                      value={formData.translations.fi.item_name}
                      onChange={handleChange}
                      placeholder="Item Name (fi)"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="translations.en.item_name">
                      Item Name (EN)
                    </label>
                    <Input
                      id="translations.en.item_name"
                      name="translations.en.item_name"
                      value={formData.translations.en.item_name}
                      onChange={handleChange}
                      placeholder="Item Name (en)"
                      required
                    />
                  </div>
                </div>

                {/* Item Types - Side by Side (if they exist in your schema) */}
                {(formData.translations.fi.item_type !== undefined ||
                  formData.translations.en.item_type !== undefined) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="translations.fi.item_type">
                        Item Type (FI)
                      </label>
                      <Input
                        id="translations.fi.item_type"
                        name="translations.fi.item_type"
                        value={formData.translations.fi.item_type || ""}
                        onChange={handleChange}
                        placeholder="Item Type (fi)"
                      />
                    </div>
                    <div>
                      <label htmlFor="translations.en.item_type">
                        Item Type (EN)
                      </label>
                      <Input
                        id="translations.en.item_type"
                        name="translations.en.item_type"
                        value={formData.translations.en.item_type || ""}
                        onChange={handleChange}
                        placeholder="Item Type (en)"
                      />
                    </div>
                  </div>
                )}

                {/* Item Descriptions - Side by Side */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="translations.fi.item_description">
                      Item Description (FI)
                    </label>
                    <Input
                      id="translations.fi.item_description"
                      name="translations.fi.item_description"
                      value={formData.translations.fi.item_description}
                      onChange={handleChange}
                      placeholder="Item Description (fi)"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="translations.en.item_description">
                      Item Description (EN)
                    </label>
                    <Input
                      id="translations.en.item_description"
                      name="translations.en.item_description"
                      value={formData.translations.en.item_description}
                      onChange={handleChange}
                      placeholder="Item Description (en)"
                      required
                    />
                  </div>
                </div>
              </div>
              {/* Price */}
              <div className="flex flex-row items-center space-x-4">
                <label htmlFor="price">Price</label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Price"
                  required
                  className="w-60"
                />
                {/* Active Toggle */}
                <label
                  htmlFor="is_active"
                  className="text-secondary font-medium"
                >
                  Active
                </label>
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

              {/* Tag Selection */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Assign Tags</h3>
                <div className="grid grid-cols-2 max-h-60 overflow-y-auto">
                  {tags.map((tag) => (
                    <label key={tag.id} className="flex items-center space-x-2">
                      <Checkbox
                        className="border-secondary text-primary data-[state=checked]:bg-secondary data-[state=checked]:text-white"
                        checked={localSelectedTags.includes(tag.id)}
                        onCheckedChange={() => handleTagToggle(tag.id)}
                      />
                      <span>
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
                {loading ? "Updating..." : "Update Item"}
              </Button>
            </form>
          </div>
        ) : (
          // Image manager component
          <ItemImageManager itemId={formData.id} />
        )}

        <DialogFooter>
          {activeTab === "details" && (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
              size={"sm"}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateItemModal;
