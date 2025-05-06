import { useEffect, useState, useRef } from "react";
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
  createItem,
  selectItemsError,
  selectItemsErrorContext,
} from "@/store/slices/itemsSlice";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { fetchAllTags, selectAllTags } from "@/store/slices/tagSlice";
import { Loader2 } from "lucide-react";
import { ItemFormData } from "@/types";
import { Checkbox } from "../ui/checkbox";
import ItemImageManager from "./ItemImageManager";
import {
  openItemModal,
  closeItemModal,
  setItemModalStep,
  setCreatedItemId,
  selectItemModalState,
} from "@/store/slices/uiSlice";

const initialFormState: ItemFormData = {
  location_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  compartment_id: "0ffa5562-82a9-4352-b804-1adebbb7d80c",
  items_number_total: 1,
  items_number_available: 1,
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

const AddItemModal = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const availableTags = useAppSelector(selectAllTags);
  const error = useAppSelector(selectItemsError);
  const errorContext = useAppSelector(selectItemsErrorContext);

  // Use global modal state from Redux
  const modalState = useAppSelector(selectItemModalState);

  const [formData, setFormData] = useState<ItemFormData>(initialFormState);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch the created item from Redux store when we have the ID
  const createdItem = useAppSelector((state) =>
    modalState.createdItemId
      ? state.items.items.find((item) => item.id === modalState.createdItemId)
      : null,
  );

  // Display errors when they occur
  useEffect(() => {
    if (error && errorContext === "create") {
      toast.error(error);
    }
  }, [error, errorContext]);

  useEffect(() => {
    if (modalState.isOpen) {
      dispatch(fetchAllTags()); // Fetch all tags when modal opens
    }
  }, [dispatch, modalState.isOpen]);

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
        name === "items_number_available"
      ) {
        setFormData({
          ...formData,
          [name]: parseFloat(value) || 0,
        } as ItemFormData); // Type assertion helps TypeScript understand
      } else if (name === "location_id" || name === "compartment_id") {
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

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setLoading(true);

    try {
      // Create the item
      const newItem = await dispatch(
        createItem({ ...formData, tagIds: selectedTags }),
      ).unwrap();

      console.log("Item created successfully:", newItem);

      // Update the global state
      dispatch(setCreatedItemId(newItem.id));
      dispatch(setItemModalStep("images"));

      toast.success(
        `Item "${newItem.translations.en.item_name}" created successfully! You can now add images.`,
      );
    } catch (error) {
      console.error("Error creating item:", error);
      toast.error("Failed to create item");
    } finally {
      setLoading(false);
    }
  };

  // Reset form and close modal
  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedTags([]);
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
          if (modalState.currentStep === "images" && modalState.createdItemId) {
            if (
              confirm(
                "Are you sure you want to close? Any unsaved image changes will be lost.",
              )
            ) {
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
          <DialogTitle>
            {modalState.currentStep === "details"
              ? "Add New Item"
              : "Add Images"}
          </DialogTitle>
          {modalState.currentStep === "images" && createdItem && (
            <DialogDescription className="text-center">
              Item "{createdItem.translations.en.item_name}" created
              successfully. Please add images.
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Steps indicator */}
        <div className="flex mb-6 bg-gray-100 rounded-md p-1">
          <button
            className={`flex-1 py-2 px-4 rounded-md text-center ${
              modalState.currentStep === "details"
                ? "bg-white shadow-sm font-medium"
                : "text-gray-500"
            }`}
            onClick={() => {
              if (createdItem) dispatch(setItemModalStep("details"));
            }}
            disabled={!createdItem && modalState.currentStep === "images"}
          >
            1. Item Details
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md text-center ${
              modalState.currentStep === "images"
                ? "bg-white shadow-sm font-medium"
                : "text-gray-500"
            }`}
            onClick={() => {
              if (createdItem) dispatch(setItemModalStep("images"));
            }}
            disabled={!createdItem}
          >
            2. Add Images
          </button>
        </div>

        {modalState.currentStep === "details" ? (
          // Details Form
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
            className="space-y-6"
          >
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
                            "Unnamed Tag"}
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
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Item & Continue to Images"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : modalState.createdItemId ? (
          <>
            <ItemImageManager
              itemId={modalState.createdItemId}
              setAvailabilityInfo={(info) => {
                console.log("Image availability updated:", info);
              }}
            />

            <DialogFooter className="mt-4 gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={resetForm}
              >
                Done & Close
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="text-center py-12">
            <p>Please create an item first</p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => dispatch(setItemModalStep("details"))}
            >
              Go back to details
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddItemModal;
