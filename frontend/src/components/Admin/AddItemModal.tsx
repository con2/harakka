import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  createItem,
  selectItemsLoading,
  selectItemsError,
  selectItemsErrorContext,
} from '@/store/slices/itemsSlice';
import { toast } from 'sonner';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { fetchAllTags, selectAllTags } from '@/store/slices/tagSlice';
import { Loader2 } from 'lucide-react';
import { ItemFormData, Item } from '@/types';
import { Checkbox } from '../ui/checkbox';
import ItemImageManager from './ItemImageManager';

const initialFormState: ItemFormData = {
  location_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  compartment_id: '0ffa5562-82a9-4352-b804-1adebbb7d80c',
  items_number_total: 1,
  items_number_available: 1,
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
  tagIds: [],
};

const AddItemModal = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const availableTags = useAppSelector(selectAllTags);
  const loading = useAppSelector(selectItemsLoading);
  const error = useAppSelector(selectItemsError);
  const errorContext = useAppSelector(selectItemsErrorContext);

  const [formData, setFormData] = useState<ItemFormData>(initialFormState);
  const [open, setOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Tab management
  const [activeTab, setActiveTab] = useState<'details' | 'images'>('details');

  // State to track created item for image management
  const [createdItem, setCreatedItem] = useState<Item | null>(null);

  // Display errors when they occur
  useEffect(() => {
    if (error && errorContext === 'create') {
      toast.error(error);
    }
  }, [error, errorContext]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    // Handle nested fields for translations (FI and EN)
    if (name.includes('.')) {
      const [parent, child, field] = name.split('.');

      if (parent === 'translations') {
        if (child === 'fi' || child === 'en') {
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
        name === 'price' ||
        name === 'items_number_total' ||
        name === 'items_number_available'
      ) {
        setFormData({
          ...formData,
          [name]: parseFloat(value) || 0,
        } as ItemFormData); // Type assertion helps TypeScript understand
      } else if (name === 'location_id' || name === 'compartment_id') {
        setFormData({
          ...formData,
          [name]: value,
        } as ItemFormData); // Type assertion helps TypeScript understand
      }
    }
  };

  const handleToggleChange = (checked: boolean) => {
    setFormData({
      ...formData,
      is_active: checked,
    });
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedTags([]);
    setCreatedItem(null);
    setActiveTab('details');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      // Create the item
      const newItem = await dispatch(
        createItem({ ...formData, tagIds: selectedTags }),
      ).unwrap();

      // Log the newly created item to verify what's returned
      console.log('Item created successfully:', newItem);

      // Store the created item and move to image management
      setCreatedItem(newItem);
      toast.success('Item created successfully! You can now add images.');
      setActiveTab('images');

      // Make sure modal stays open - don't call setOpen(false) here!
    } catch (error) {
      // Error is already handled by redux slice and displayed via useEffect
      console.error('Error creating item:', error);
    }
  };

  // Handle modal close with confirmation if needed
  const handleClose = () => {
    if (activeTab === 'images' && createdItem) {
      if (
        window.confirm(
          'Are you sure you want to close? Any unsaved image changes will be lost.',
        )
      ) {
        resetForm();
        setOpen(false);
      }
    } else {
      resetForm();
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) {
      dispatch(fetchAllTags()); // Fetch all tags when modal opens
    }
  }, [dispatch, open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        // If trying to close
        if (!isOpen) {
          // Only if we're not in the middle of item creation/image management workflow
          if (
            !(activeTab === 'images' && createdItem) ||
            window.confirm(
              'Are you sure you want to close? Any unsaved image changes will be lost.',
            )
          ) {
            resetForm();
            setOpen(false);
          }
        } else {
          setOpen(true);
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {createdItem ? 'Manage Item Images' : 'Add New Item'}
          </DialogTitle>
          {createdItem && (
            <DialogDescription className="text-center">
              Item "{createdItem.translations.en.item_name}" created
              successfully. You can now add images.
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 ${
              activeTab === 'details'
                ? 'border-b-2 border-secondary font-medium'
                : 'text-gray-500'
            } ${createdItem ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => {
              if (!createdItem) setActiveTab('details');
            }}
            disabled={!!createdItem}
          >
            Details
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === 'images'
                ? 'border-b-2 border-secondary font-medium'
                : 'text-gray-500'
            } ${!createdItem ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => {
              if (createdItem) {
                setActiveTab('images');
              } else {
                toast.error('Please create an item first before adding images');
              }
            }}
            disabled={!createdItem}
          >
            Images
          </button>
        </div>

        {activeTab === 'details' ? (
          // Details Form Tab
          <form onSubmit={handleSubmit} className="space-y-6">
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
                      required
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
                      required
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
                <Label htmlFor="items_number_available">
                  Available Quantity
                </Label>
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

              {/* Tags Section */}
              <div className="col-span-2">
                <h3 className="text-lg font-medium">Assign Tags</h3>
                <div className="rounded max-h-60 overflow-y-auto">
                  <div className="grid grid-cols-2 grid-flow-row">
                    {availableTags.map((tag) => (
                      <label
                        key={tag.id}
                        htmlFor={tag.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          className="border-secondary text-primary data-[state=checked]:bg-secondary data-[state=checked]:text-white"
                          checked={selectedTags.includes(tag.id)}
                          onCheckedChange={() => {
                            if (selectedTags.includes(tag.id)) {
                              setSelectedTags(
                                selectedTags.filter((id) => id !== tag.id),
                              );
                            } else {
                              setSelectedTags([...selectedTags, tag.id]);
                            }
                          }}
                        />
                        <span>
                          {tag.translations?.fi?.name ||
                            tag.translations?.en?.name ||
                            'Unnamed Tag'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="submit"
                className="w-full bg-background rounded-2xl text-secondary border-secondary border-1 hover:text-background hover:bg-secondary"
                disabled={loading}
                size={'sm'}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Item'
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : // Image Manager Tab
        createdItem ? (
          <ItemImageManager
            itemId={createdItem.id}
            setAvailabilityInfo={(info) => {
              // Optional callback - can provide feedback on availability
              console.log('Image availability updated:', info);
            }}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Please create an item first before managing images
            </p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => setActiveTab('details')}
            >
              Go back to item details
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddItemModal;
