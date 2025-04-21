import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAppDispatch } from "@/store/hooks";
import { updateItem } from "@/store/slices/itemsSlice";
import { Item } from "@/types/item";
import { toast } from "sonner";
import { Switch } from '@/components/ui/switch';
import {
  fetchAllTags,
  fetchTagsForItem,
  assignTagToItem,
  selectAllTags,
  selectSelectedTags,
} from '@/store/slices/tagSlice';
import { useAppSelector } from '@/store/hooks';
import { Checkbox } from '@/components/ui/checkbox';

type UpdateItemModalProps = {
  onClose: () => void;
  initialData: Item;  // Assume initialData is always passed for updating
};

const UpdateItemModal = ({ onClose, initialData }: UpdateItemModalProps) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<Item>(initialData);  // Initialize directly from initialData
  const [loading, setLoading] = useState(false);
  const tags = useAppSelector(selectAllTags);
  const selectedTags = useAppSelector(selectSelectedTags);
  const [localSelectedTags, setLocalSelectedTags] = useState<string[]>([]);

  // Prefill the form with initial data if available
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);  // Set form data directly from initialData
    }
  }, [initialData]);

  useEffect(() => {
    dispatch(fetchAllTags());
    dispatch(fetchTagsForItem(formData.id)); // fetch tags for this item
  }, [dispatch, formData.id]);

  useEffect(() => {
    if (selectedTags) {
      setLocalSelectedTags(selectedTags.map(tag => tag.id));
    }
  }, [selectedTags]);

  const handleTagToggle = (tagId: string) => {
    setLocalSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
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
      // Exclude tags from updateItem payload
      const { storage_item_tags, ...cleanedData } = formData;
  
      await dispatch(updateItem({ id: formData.id, data: cleanedData })).unwrap();
      await dispatch(assignTagToItem({ itemId: formData.id, tagIds: localSelectedTags })).unwrap();
  
      toast.success('Item updated successfully!');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update item.');
    } finally {
      setLoading(false);
    }
  };  

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>Update item details below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Price */}
          <div>
            <label htmlFor="price">Price</label>
            <Input
              id="price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              placeholder="Price"
              required
            />
          </div>

          {/* Item Translation Fields */}
          <div>
            <h3 className="text-lg font-medium">Translations</h3>

            {/* Finnish Translation */}
            <div>
              <h4 className="text-sm font-medium">Finnish (fi)</h4>
              <label htmlFor="translations.fi.item_name">Item Name</label>
              <Input
                id="translations.fi.item_name"
                name="translations.fi.item_name"
                value={formData.translations.fi.item_name}
                onChange={handleChange}
                placeholder="Item Name (fi)"
                required
              />
              <label htmlFor="translations.fi.item_description">Item Description</label>
              <Input
                id="translations.fi.item_description"
                name="translations.fi.item_description"
                value={formData.translations.fi.item_description}
                onChange={handleChange}
                placeholder="Item Description (fi)"
                required
              />
            </div>

            {/* English Translation */}
            <div>
              <h4 className="text-sm font-medium">English (en)</h4>
              <label htmlFor="translations.en.item_name">Item Name</label>
              <Input
                id="translations.en.item_name"
                name="translations.en.item_name"
                value={formData.translations.en.item_name}
                onChange={handleChange}
                placeholder="Item Name (en)"
                required
              />
              <label htmlFor="translations.en.item_description">Item Description</label>
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

          {/* Tag Selection */}
          <div>
            <h3 className="text-lg font-medium">Assign Tags</h3>
            <div className="flex flex-col space-y-2">
              {tags.map((tag) => (
                <label key={tag.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={localSelectedTags.includes(tag.id)}
                    onCheckedChange={() => handleTagToggle(tag.id)}
                  />
                  <span>{tag.translations?.fi?.name || tag.translations?.en?.name || 'Unnamed'}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex flex-col">
            <label htmlFor="is_active" className="text-secondary font-medium">
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

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Item"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateItemModal;