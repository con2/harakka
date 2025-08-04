import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/context/LanguageContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectCurrentOrgLocations } from "@/store/slices/organizationLocationsSlice";
import { createItemDto } from "@/store/utils/validate";
import { ItemFormTag } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmitErrorHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { t } from "@/translations";
import React, { useEffect, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  fetchAllTags,
  fetchFilteredTags,
  selectAllTags,
  selectTagsLoading,
} from "@/store/slices/tagSlice";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  addToItemCreation,
  clearSelectedItem,
  selectIsEditing,
  selectItemCreation,
  selectOrgLocation,
  selectSelectedItem,
  toggleIsEditing,
  updateLocalItem,
} from "@/store/slices/itemsSlice";
import { TRANSLATION_FIELDS } from "../add-item.data";
import { toast } from "sonner";
import ItemImageUpload from "../ItemImageUpload";
import { setNextStep } from "@/store/slices/uiSlice";
import { CreateItemType } from "@common/items/form.types";
import { Skeleton } from "@/components/ui/skeleton";

function AddItemForm() {
  const orgLocations = useAppSelector(selectCurrentOrgLocations);
  const editItem = useAppSelector(selectSelectedItem);
  const { lang: appLang } = useLanguage();
  const [tagSearchValue, setTagSearchValue] = useState("");
  const tagSearch = useDebouncedValue(tagSearchValue, 200);
  const dispatch = useAppDispatch();
  const [selectedTags, setSelectedTags] = useState<ItemFormTag[]>([]);
  const { location: storage } = useAppSelector(selectItemCreation);
  const tags = useAppSelector(selectAllTags);
  const tagsLoading = useAppSelector(selectTagsLoading);
  const isEditing = useAppSelector(selectIsEditing);
  const form = useForm<z.infer<typeof createItemDto>>({
    resolver: zodResolver(createItemDto),
    defaultValues: editItem ?? {
      id: crypto.randomUUID(),
      location_id: storage?.id ?? orgLocations?.[0]?.id,
      location_details: {
        name: storage?.name ?? orgLocations?.[0]?.storage_locations.name ?? "",
        address:
          storage?.address ??
          orgLocations?.[0]?.storage_locations.address ??
          "",
      },
      items_number_total: 1,
      items_number_currently_in_storage: 1,
      price: 0,
      is_active: true,
      tags: [],
      translations: {
        fi: {
          item_name: "",
          item_type: "",
          item_description: "",
        },
        en: {
          item_name: "",
          item_type: "",
          item_description: "",
        },
      },
      images: {
        main: null,
        details: [],
      },
    },
  });

  const onValidSubmit = (values: z.infer<typeof createItemDto>) => {
    form.reset();
    void dispatch(addToItemCreation(values));
    dispatch(setNextStep());
  };

  const onInvalidSubmit: SubmitErrorHandler<CreateItemType> = (errors) => {
    console.log("form is invalid: ", errors);
    const result = createItemDto.safeParse(form);
    if (result.error) {
      const allErrors = result.error.flatten().fieldErrors;
      console.log("allerrors", allErrors);
      const firstErrorMessage = Object.values(allErrors)
        .flat()
        .find((msg) => !!msg);

      if (firstErrorMessage) {
        toast.error(firstErrorMessage);
      } else {
        toast.error("Form contains errors");
      }
    }
  };

  const toggleTag = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const { id } = e.currentTarget.dataset;
    if (!id) return;
    const currentTags: string[] = form.getValues("tags") ?? [];
    const exists = currentTags.includes(id);

    if (exists) {
      setSelectedTags(selectedTags.filter((t) => t.tag_id !== id));
    } else {
      const newTag = tags.find((t) => t.id === id);
      if (newTag)
        setSelectedTags([
          ...selectedTags,
          { tag_id: id, translations: newTag.translations! },
        ]);
    }

    const newTags = exists
      ? currentTags.filter((tag) => tag !== id)
      : [...currentTags, id];

    form.setValue("tags", newTags, { shouldValidate: true, shouldDirty: true });
  };

  const handleUpdateItem = (item: CreateItemType) => {
    dispatch(clearSelectedItem());
    dispatch(toggleIsEditing());
    dispatch(updateLocalItem({ item }));
    dispatch(setNextStep());
  };

  const handleNavigateSummary = () => {
    form.reset();
    dispatch(setNextStep());
  };

  const handleLocationChange = (selectedId: string) => {
    const newLoc = orgLocations.find((org) => org.id === selectedId);
    if (!newLoc) return;

    form.setValue("location_id", newLoc.id, {
      shouldValidate: true,
      shouldDirty: true,
    });
    form.setValue(
      "location_details",
      {
        name: newLoc.storage_locations.name,
        address: newLoc.storage_locations.address,
      },
      { shouldValidate: true, shouldDirty: true },
    );
    dispatch(
      selectOrgLocation({
        org_id: newLoc.id,
        name: newLoc.storage_locations.name,
        address: newLoc.storage_locations.address,
      }),
    );
  };

  /*------------------side effects-------------------------------------------*/
  useEffect(() => {
    if (!storage) return;
    form.setValue("location_id", storage.id);
    form.setValue("location_details", {
      name: storage.name,
      address: storage.address,
    });
  }, [storage, form]);

  useEffect(() => {
    if (tagSearch)
      void dispatch(
        fetchFilteredTags({ page: 1, limit: 20, search: tagSearch }),
      );
    else if (tags.length < 1)
      void dispatch(fetchAllTags({ page: 1, limit: 20 }));
  }, [tagSearch, dispatch]);

  useEffect(() => {
    if ((editItem as CreateItemType)?.tags && tags.length > 0) {
      const activeTags = tags.filter((tag) =>
        (editItem as CreateItemType)?.tags.includes(tag.id),
      );
      setSelectedTags(
        activeTags.map((t) => ({
          tag_id: t.id,
          translations: t.translations!,
        })),
      );
    }
  }, [tags, editItem]);

  /*------------------render-------------------------------------------------*/

  return (
    <div className="bg-white flex flex-wrap rounded border mt-4 max-w-[900px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onValidSubmit, onInvalidSubmit)}>
          {/* Translations | Item Details */}
          <div className="p-10 flex flex-wrap gap-x-6 space-y-8 justify-between">
            <p className="scroll-m-20 text-2xl font-semibold tracking-tight w-full">
              Item Details
            </p>

            <div className="flex flex-wrap w-full gap-x-6 space-y-4 justify-between">
              {TRANSLATION_FIELDS.map((entry) => {
                const { lang: fieldLang, fieldKey, nameValue } = entry;
                return (
                  <div
                    key={`${fieldLang}.${fieldKey}`}
                    className="flex flex-[48%] gap-8"
                  >
                    <FormField
                      name={nameValue as any}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>
                            {fieldKey
                              .replace(/_/g, " ")
                              .replace(/^./, (c) => c.toUpperCase())}{" "}
                            ({fieldLang.toUpperCase()})
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="border shadow-none border-grey w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                );
              })}
            </div>

            {/* Location | Total Quantity | Is active */}
            <div className="gap-4 flex w-full">
              <FormField
                name="items_number_total"
                control={form.control}
                render={({ field }) => (
                  <div className="w-full">
                    <FormItem>
                      <FormLabel>Total Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder=""
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue =
                              value === "" ? "" : parseInt(value, 10);
                            field.onChange(numValue);
                          }}
                          className="border shadow-none border-grey"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </div>
                )}
              />
              <FormField
                name="price"
                control={form.control}
                render={({ field }) => (
                  <div className="w-full">
                    <FormItem>
                      <FormLabel>Price (€)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder=""
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue =
                              value === "" ? "" : parseInt(value, 10);
                            field.onChange(numValue);
                          }}
                          className="border shadow-none border-grey"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </div>
                )}
              />
              <FormField
                name="location_id"
                control={form.control}
                render={() => (
                  <div className="w-full">
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select
                        defaultValue={storage?.id ?? ""}
                        onValueChange={handleLocationChange}
                        disabled={storage === null ? false : true}
                      >
                        <SelectTrigger className="border shadow-none border-grey w-full">
                          <SelectValue
                            className="border shadow-none border-grey"
                            placeholder={
                              t.addItemModal.placeholders.selectLocation[
                                appLang
                              ]
                            }
                          >
                            {storage?.name}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {orgLocations?.map((loc) => (
                            <SelectItem
                              disabled={storage === undefined}
                              key={loc.id}
                              value={loc.id}
                            >
                              {loc.storage_locations.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  </div>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg p-4 gap-6 w-full">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Users can view and book the item immediately
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-readonly
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Search tags */}
          <div className="p-10 w-full">
            <div>
              <p className="scroll-m-20 text-2xl font-semibold tracking-tight w-full mb-1">
                Assign Tags
              </p>
              <p className="text-sm leading-none font-medium">
                Tags help users find items using search or filter functions.
              </p>
              <Input
                placeholder="Search tags"
                className="max-w-[300px] border shadow-none border-grey my-4"
                onChange={(e) => setTagSearchValue(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-3 mb-8">
              <div className="flex gap-2 flex-wrap">
                {!tagsLoading &&
                  tags.map((tag) => {
                    const currentTags = form.getValues("tags");
                    const isSelected = currentTags.find((t) => t === tag.id);
                    return (
                      <Badge
                        key={tag.id}
                        variant={isSelected ? "default" : "outline"}
                        onClick={toggleTag}
                        data-id={tag.id}
                        data-translations={tag.translations}
                        className=""
                      >
                        {tag.translations?.[appLang].name}
                      </Badge>
                    );
                  })}
                {tagsLoading && (
                  <div className="flex flex-wrap gap-x-2">
                    {Array(20)
                      .fill("")
                      .map((_, idx) => (
                        <Skeleton
                          className={`animate-pulse h-[18px] bg-muted rounded-md w-${idx % 2 === 0 ? "10" : "16"} mb-2`}
                        />
                      ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <p className="scroll-m-20 text-2xl font-semibold tracking-tight w-full mb-2">
                Selected tags
              </p>
              <div className="flex gap-2 flex-wrap">
                {selectedTags.length > 0 ? (
                  selectedTags.map((tag) => (
                    <Badge
                      key={`selected-${tag.tag_id}`}
                      onClick={toggleTag}
                      variant="default"
                      data-id={tag.tag_id}
                    >
                      {tag.translations?.[appLang].name}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm leading-none font-medium">
                    No tags selected.
                  </p>
                )}
              </div>
            </div>
          </div>
          <Separator />

          {/* Images */}
          <div className="p-10 w-full">
            <div className="mb-6">
              <p className="scroll-m-20 text-2xl font-semibold tracking-tight w-full">
                Add Images
              </p>
              <p className="text-sm leading-none font-medium">
                We recommend uploading at least one image for the item.
              </p>
            </div>

            <ItemImageUpload
              item_id={form.watch("id")}
              formImages={form.watch("images")}
              updateForm={form.setValue}
            />
          </div>

          <div className="p-10 pt-2 flex justify-end gap-4">
            <Button
              variant="default"
              disabled={isEditing}
              onClick={handleNavigateSummary}
              type="button"
            >
              Go to summary
            </Button>
            <Button
              variant="outline"
              type={isEditing ? "button" : "submit"}
              onClick={
                !isEditing ? () => {} : () => handleUpdateItem(form.getValues())
              }
            >
              {isEditing ? "Update item" : "Add Item"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default AddItemForm;
