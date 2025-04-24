import { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/store/hooks';
import { createItem } from '@/store/slices/itemsSlice';
import { toast } from 'sonner';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';

const initialFormState = {
  location_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', //TODO: same for all new items, change later
  compartment_id: '0ffa5562-82a9-4352-b804-1adebbb7d80c', //TODO: same for all new items, change later
  items_number_total: 1, //1 by default
  items_number_available: 1, //1 by default
  price: 0,
  is_active: true,
  translations: {
    fi: {
      item_type: '',
      item_name: '',
      item_description: '',
    },
    en: {
      item_type: '',
      item_name: '',
      item_description: '',
    },
  },
};

const AddItemModal = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState(initialFormState);
  const [open, setOpen] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    // Handle nested fields
    if (name.includes('.')) {
      const [parent, child, field] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent as keyof typeof formData],
          [child]: {
            ...formData[parent as keyof typeof formData][
              child as keyof (typeof formData)[typeof parent]
            ],
            [field]: value,
          },
        },
      });
    } else {
      // Handle numeric values
      if (
        name === 'price' ||
        name === 'items_number_total' ||
        name === 'items_number_available'
      ) {
        setFormData({ ...formData, [name]: parseFloat(value) || 0 });
      } else {
        setFormData({ ...formData, [name]: value });
      }
    }
  };

  const handleToggleChange = (checked: boolean) => {
    setFormData({ ...formData, is_active: checked });
  };

  const resetForm = () => {
    setFormData(initialFormState);
  };

  const handleSubmit = async () => {
    try {
      await dispatch(createItem(formData)).unwrap();
      toast.success('Item created successfully!');
      resetForm();
      setOpen(false);
    } catch (error: any) {
      toast.error(typeof error === 'string' ? error : 'Failed to create item.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center mb-4">Add New Item</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Finnish Information */}
            <div>
              <h3 className="font-medium mb-2">Finnish</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="translations.fi.item_name">
                    Item Name (FI)
                  </Label>
                  <Input
                    id="translations.fi.item_name"
                    name="translations.fi.item_name"
                    value={formData.translations.fi.item_name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="translations.fi.item_type">
                    Item Type (FI)
                  </Label>
                  <Input
                    id="translations.fi.item_type"
                    name="translations.fi.item_type"
                    value={formData.translations.fi.item_type}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="translations.fi.item_description">
                    Description (FI)
                  </Label>
                  <Textarea
                    id="translations.fi.item_description"
                    name="translations.fi.item_description"
                    value={formData.translations.fi.item_description}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* English Information */}
            <div>
              <h3 className="font-medium mb-2">English</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="translations.en.item_name">
                    Item Name (EN)
                  </Label>
                  <Input
                    id="translations.en.item_name"
                    name="translations.en.item_name"
                    value={formData.translations.en.item_name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="translations.en.item_type">
                    Item Type (EN)
                  </Label>
                  <Input
                    id="translations.en.item_type"
                    name="translations.en.item_type"
                    value={formData.translations.en.item_type}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="translations.en.item_description">
                    Description (EN)
                  </Label>
                  <Textarea
                    id="translations.en.item_description"
                    name="translations.en.item_description"
                    value={formData.translations.en.item_description}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Item Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="location_id">Location ID</Label>
              <Input
                id="location_id"
                name="location_id"
                value={formData.location_id}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="compartment_id">Compartment ID</Label>
              <Input
                id="compartment_id"
                name="compartment_id"
                value={formData.compartment_id}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="price">Price (€)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="items_number_total">Total Quantity</Label>
              <Input
                id="items_number_total"
                name="items_number_total"
                type="number"
                value={formData.items_number_total}
                onChange={handleChange}
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="items_number_available">Available Quantity</Label>
              <Input
                id="items_number_available"
                name="items_number_available"
                type="number"
                value={formData.items_number_available}
                onChange={handleChange}
                min="0"
                max={formData.items_number_total}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={handleToggleChange}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            className="w-full bg-background rounded-2xl text-secondary border-secondary border-1 hover:text-background hover:bg-secondary"
            onClick={handleSubmit}
          >
            Add Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemModal;