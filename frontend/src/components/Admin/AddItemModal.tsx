import { useEffect, useState, useRef } from 'react';
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
import { Loader2, Upload, X, ImageIcon } from 'lucide-react';
import { ItemFormData } from '@/types';
import { Checkbox } from '../ui/checkbox';
// Import the upload action
import { uploadItemImage } from '@/store/slices/itemImagesSlice';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Constants for file upload
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

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

  // Image upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageType, setImageType] = useState<'main' | 'thumbnail' | 'detail'>(
    'main',
  );
  const [altText, setAltText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Display errors when they occur
  useEffect(() => {
    if (error && errorContext === 'create') {
      toast.error(error);
    }
  }, [error, errorContext]);

  // Create preview when file is selected
  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setImagePreview(null);
    }
  }, [selectedFile]);

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
    setSelectedFile(null);
    setImagePreview(null);
    setAltText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // File validation
  const validateFile = (file: File): boolean => {
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error(
        'Invalid file type. Only JPG, PNG, WebP, and GIF are allowed.',
      );
      return false;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        `File is too large. Maximum size is ${
          MAX_FILE_SIZE / (1024 * 1024)
        }MB.`,
      );
      return false;
    }

    return true;
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);

        // Auto-generate alt text from filename
        const nameWithoutExt = file.name.split('.').slice(0, -1).join('.');
        const formattedName = nameWithoutExt
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());

        setAltText(formattedName);
      }
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);

        // Auto-generate alt text from filename
        const nameWithoutExt = file.name.split('.').slice(0, -1).join('.');
        const formattedName = nameWithoutExt
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());

        setAltText(formattedName);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      // First create the item
      const createdItem = await dispatch(
        createItem({ ...formData, tagIds: selectedTags }),
      ).unwrap();

      // If there's a file selected, upload it to the newly created item
      if (selectedFile && createdItem.id) {
        setUploadingImage(true);
        try {
          const metadata = {
            image_type: imageType,
            display_order: 1,
            alt_text: altText,
          };

          await dispatch(
            uploadItemImage({
              itemId: createdItem.id,
              file: selectedFile,
              metadata,
            }),
          ).unwrap();

          toast.success('Item and image uploaded successfully!');
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.error('Item created but failed to upload image.');
        } finally {
          setUploadingImage(false);
        }
      } else {
        toast.success('Item created successfully!');
      }

      resetForm();
      setOpen(false);
    } catch (error) {
      // Error is already handled by the redux slice and displayed via useEffect
      console.error('Error creating item:', error);
    }
  };

  useEffect(() => {
    if (open) {
      dispatch(fetchAllTags()); // Fetch all tags when modal opens
    }
  }, [dispatch, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center mb-4">Add New Item</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Image Upload Section */}
          <div className="col-span-full bg-white p-4 rounded-md border">
            <h3 className="text-lg font-medium mb-4">Item Image (Optional)</h3>

            {/* Drag & Drop Area */}
            <div
              className={`border-2 border-dashed rounded-md p-6 mb-4 text-center transition-colors ${
                isDragging
                  ? 'border-secondary bg-secondary/5'
                  : 'border-gray-300 hover:border-secondary'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mx-auto max-h-40 object-contain mb-2"
                  />
                  <button
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setImagePreview(null);
                      setAltText('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <p className="text-sm text-gray-500">{selectedFile?.name}</p>
                </div>
              ) : (
                <div>
                  <ImageIcon className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    Drag and drop an image here or click to browse
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG, WebP, GIF up to 5MB
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                id="imageInput"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Image settings */}
            {selectedFile && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="imageType">Image Type</Label>
                  <Select
                    value={imageType}
                    onValueChange={(val: 'main' | 'thumbnail' | 'detail') =>
                      setImageType(val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">Main</SelectItem>
                      <SelectItem value="thumbnail">Thumbnail</SelectItem>
                      <SelectItem value="detail">Detail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="altText">Alt Text (Accessibility)</Label>
                  <Input
                    id="altText"
                    placeholder="Describe the image for accessibility"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

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

            {/* Tags Section */}
            <div>
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
        </div>

        <DialogFooter>
          <Button
            className="w-full bg-background rounded-2xl text-secondary border-secondary border-1 hover:text-background hover:bg-secondary"
            onClick={handleSubmit}
            disabled={loading || uploadingImage}
            size={'sm'}
          >
            {loading || uploadingImage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {selectedFile ? 'Creating and uploading...' : 'Creating...'}
              </>
            ) : (
              'Add Item'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemModal;
