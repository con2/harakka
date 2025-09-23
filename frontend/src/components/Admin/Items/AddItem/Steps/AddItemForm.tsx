import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/context/LanguageContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllCategories,
  selectCategories,
} from "@/store/slices/categoriesSlice";
import {
  addToItemCreation,
  clearLocalItemError,
  clearSelectedItem,
  selectIsEditing,
  selectItemCreation,
  selectSelectedItem,
  toggleIsEditing,
  updateLocalItem,
} from "@/store/slices/itemsSlice";
import {
  fetchAllOrgLocations,
  selectOrgLocations,
} from "@/store/slices/organizationLocationsSlice";
import {
  fetchFilteredTags,
  selectAllTags,
  selectTagsLoading,
} from "@/store/slices/tagSlice";
import { setNextStep } from "@/store/slices/uiSlice";
import { createItemDto } from "@/store/utils/validate";
import { t } from "@/translations";
import { ItemFormTag } from "@/types";
import { getFirstErrorMessage } from "@/utils/validate";
import { CreateItemType } from "@common/items/form.types";
import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { SubmitErrorHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { TRANSLATION_FIELDS } from "../add-item.data";
import ItemImageUpload from "../ItemImageUpload";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

type AddItemFromProps = {
  onUpdate?: (values: z.infer<typeof createItemDto>) => void;
  initialData?: CreateItemType;
};

function AddItemForm({ onUpdate, initialData }: AddItemFromProps) {
  const orgLocations = useAppSelector(selectOrgLocations);
  const editItem = useAppSelector(selectSelectedItem);
  const { lang: appLang } = useLanguage();
  const [tagSearchValue, setTagSearchValue] = useState("");
  const tagSearch = useDebouncedValue(tagSearchValue, 200);
  const dispatch = useAppDispatch();
  const [selectedTags, setSelectedTags] = useState<ItemFormTag[]>([]);
  const { location: storage, org } = useAppSelector(selectItemCreation);
  const tags = useAppSelector(selectAllTags);
  const tagsLoading = useAppSelector(selectTagsLoading);
  const categories = useAppSelector(selectCategories);
  const isEditing = useAppSelector(selectIsEditing);
  const form = useForm<z.infer<typeof createItemDto>>({
    resolver: zodResolver(createItemDto),
    defaultValues: initialData ??
      editItem ?? {
        id: crypto.randomUUID(),
        location: {
          id: storage?.id ?? "",
          name: storage?.name ?? "",
          address: storage?.address ?? "",
        },
        quantity: 1,
        available_quantity: 1,
        is_active: true,
        tags: [],
        translations: {
          fi: {
            item_name: "",
            item_description: "",
          },
          en: {
            item_name: "",
            item_description: "",
          },
        },
        category_id: "",
        images: {
          main: null,
          details: [],
        },
      },
  });

  const onValidSubmit = (values: z.infer<typeof createItemDto>) => {
    form.reset();
    if (onUpdate) return onUpdate(form.getValues());
    if (isEditing) return handleUpdateItem(values);
    void dispatch(addToItemCreation(values));
    dispatch(setNextStep());
  };

  const onInvalidSubmit: SubmitErrorHandler<CreateItemType> = (errors) => {
    console.log(form.getValues());
    const firstErrorKey = getFirstErrorMessage(errors);
    console.log(errors);

    if (
      firstErrorKey &&
      t.addItemForm.messages.validation[
        firstErrorKey as keyof typeof t.addItemForm.messages.validation
      ]
    ) {
      toast.error(
        t.addItemForm.messages.validation[
          firstErrorKey as keyof typeof t.addItemForm.messages.validation
        ][appLang],
      );
    } else {
      toast.error(t.addItemForm.messages.error.fallbackFormError[appLang]);
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
      const newTag = tags?.find((t) => t?.id === id);
      if (newTag)
        setSelectedTags([
          ...selectedTags,
          { tag_id: id, translations: newTag.translations },
        ]);
    }

    const newTags = exists
      ? currentTags.filter((tag) => tag !== id)
      : [...currentTags, id];

    form.setValue("tags", newTags, { shouldValidate: true, shouldDirty: true });
  };

  const handleUpdateItem = (item: CreateItemType) => {
    dispatch(clearSelectedItem());
    dispatch(clearLocalItemError(item.id));
    dispatch(updateLocalItem({ item }));
    dispatch(toggleIsEditing(false));
    dispatch(setNextStep());
  };

  const handleNavigateSummary = () => {
    form.reset();
    dispatch(setNextStep());
  };

  const handleLocationChange = (selectedId: string) => {
    const newLoc = orgLocations?.find(
      (org) => org.storage_location_id === selectedId,
    );
    if (!newLoc) return;
    form.setValue(
      "location",
      {
        id: newLoc.storage_location_id,
        name: newLoc?.storage_locations?.name ?? "",
        address: newLoc?.storage_locations?.address ?? "",
      },
      { shouldValidate: true, shouldDirty: true },
    );
  };

  /*------------------side effects-------------------------------------------*/
  useEffect(() => {
    if (org && orgLocations.length < 1)
      void dispatch(fetchAllOrgLocations({ orgId: org.id, pageSize: 20 }));
  }, []);

  useEffect(() => {
    if (categories.length === 0)
      void dispatch(
        fetchAllCategories({ page: 1, limit: 20, order: "assigned_to" }),
      );
  }, []);

  useEffect(() => {
    const newValue = form.getValues("quantity");
    form.setValue("available_quantity", newValue);
  }, [form.getValues("quantity")]);

  useEffect(() => {
    if (!storage) return;
    form.setValue("location", {
      id: storage.id,
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
      void dispatch(
        fetchFilteredTags({
          page: 1,
          limit: 20,
          sortBy: "assigned_to",
          sortOrder: "desc",
        }),
      );
  }, [tagSearch, dispatch]);

  useEffect(() => {
    if ((editItem as CreateItemType)?.tags && tags.length > 0) {
      const activeTags = tags.filter((tag) =>
        (editItem as CreateItemType)?.tags.includes(tag.id),
      );
      setSelectedTags(
        activeTags.map((t) => ({
          tag_id: t.id,
          translations: t.translations,
        })),
      );
    }
  }, [tags, editItem]);

  /*------------------render-------------------------------------------------*/
  return (
    <div className="bg-white flex flex-wrap rounded border mt-4 max-w-[900px]">
      <Form {...form}>
        <form
          id="add-item-form"
          onSubmit={form.handleSubmit(onValidSubmit, onInvalidSubmit)}
          className="w-full"
        >
          <Accordion
            defaultValue={
              onUpdate ? ["details"] : ["details", "tags", "images"]
            }
            className="w-full"
            type="multiple"
          >
            {/* Item Details */}
            <AccordionItem
              value="details"
              className="p-10 flex flex-wrap gap-x-6 justify-between"
            >
              <AccordionTrigger
                className="font-main w-full justify-between flex"
                iconProps="!w-5 h-auto"
              >
                <p className="text-2xl font-semibold tracking-tight w-full">
                  {t.addItemForm.headings.itemDetails[appLang]}
                </p>
              </AccordionTrigger>
              <AccordionContent className="mt-10">
                <div className="flex flex-wrap w-full gap-x-6 space-y-4 justify-between">
                  {TRANSLATION_FIELDS.map((entry) => {
                    const {
                      lang: fieldLang,
                      fieldKey,
                      nameValue,
                      translationKey,
                    } = entry;
                    return (
                      <div
                        key={`${fieldLang}.${fieldKey}`}
                        className="flex flex-[48%] gap-8"
                      >
                        {/* Translations */}
                        <FormField
                          name={nameValue as any}
                          control={form.control}
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel>
                                {
                                  t.addItemForm.labels[
                                    translationKey as keyof typeof t.addItemForm.labels
                                  ][appLang]
                                }
                              </FormLabel>
                              <FormControl>
                                {fieldKey === "item_description" ? (
                                  <Textarea
                                    {...field}
                                    className="border shadow-none border-grey w-full mb-1"
                                  />
                                ) : (
                                  <Input
                                    {...field}
                                    className="border shadow-none border-grey w-full mb-1"
                                  />
                                )}
                              </FormControl>
                              <ErrorMessage
                                errors={form.formState.errors}
                                name={nameValue}
                                render={({ message }) => (
                                  <p className="text-[0.8rem] font-medium text-destructive">
                                    {
                                      t.addItemForm.messages.validation[
                                        message as keyof typeof t.addItemForm.messages.validation
                                      ][appLang]
                                    }
                                  </p>
                                )}
                              />
                            </FormItem>
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
                {/* Category | Total Quantity | Location | Is active */}
                <div className="gap-4 flex w-full">
                  <FormField
                    name="category_id"
                    control={form.control}
                    render={({ field }) => (
                      <div className="w-full">
                        <FormItem>
                          <FormLabel>
                            {t.addItemForm.labels.category[appLang]}
                          </FormLabel>
                          <Select
                            defaultValue={field.value || "---"}
                            onValueChange={(value) =>
                              form.setValue("category_id", value)
                            }
                          >
                            <SelectTrigger className="border shadow-none border-grey w-full">
                              <SelectValue
                                className="border shadow-none border-grey"
                                placeholder={""}
                              >
                                {categories.find((c) => c.id === field.value)
                                  ?.translations[appLang] || "---"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {categories?.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.translations[appLang]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      </div>
                    )}
                  />
                  <FormField
                    name="quantity"
                    control={form.control}
                    render={({ field }) => (
                      <div className="w-full">
                        <FormItem>
                          <FormLabel>
                            {t.addItemForm.labels.totalQuantity[appLang]}
                          </FormLabel>
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
                          <ErrorMessage
                            errors={form.formState.errors}
                            name="quantity"
                            render={({ message }) => (
                              <p className="text-[0.8rem] font-medium text-destructive">
                                {
                                  t.addItemForm.messages.validation[
                                    message as keyof typeof t.addItemForm.messages.validation
                                  ][appLang]
                                }
                              </p>
                            )}
                          />
                        </FormItem>
                      </div>
                    )}
                  />
                  <FormField
                    name="location"
                    control={form.control}
                    render={({ field }) => (
                      <div className="w-full">
                        <FormItem>
                          <FormLabel>
                            {t.addItemForm.labels.location[appLang]}
                          </FormLabel>
                          <Select
                            defaultValue={field?.value?.id ?? ""}
                            onValueChange={handleLocationChange}
                            disabled={!onUpdate || storage === null}
                          >
                            <SelectTrigger className="border shadow-none border-grey w-full">
                              <SelectValue
                                className="border shadow-none border-grey"
                                placeholder={""}
                              >
                                {field?.value?.name ?? ""}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {orgLocations?.map((loc) => (
                                <SelectItem
                                  disabled={!onUpdate && storage === undefined}
                                  key={loc.storage_location_id}
                                  value={loc.storage_location_id}
                                >
                                  {loc?.storage_locations?.name}
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
                        <FormLabel>
                          {t.addItemForm.labels.active[appLang]}
                        </FormLabel>
                        <FormDescription>
                          {t.addItemForm.paragraphs.activeDescription[appLang]}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field?.value}
                          onCheckedChange={field.onChange}
                          aria-readonly
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Tags Section */}
            <AccordionItem value="tags" className="p-10 w-full">
              <AccordionTrigger className="w-full" iconProps="!w-5 h-auto">
                <div>
                  <p className="scroll-m-20 text-2xl font-semibold tracking-tight w-full mb-1">
                    {t.addItemForm.headings.assignTags[appLang]}
                  </p>
                  <p className="text-sm leading-none font-medium">
                    {t.addItemForm.paragraphs.tagPrompt[appLang]}
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="mt-10">
                <div className="flex flex-col gap-3 mb-8">
                  <Input
                    placeholder={t.addItemForm.placeholders.searchTags[appLang]}
                    className="max-w-[300px] border shadow-none border-grey my-4"
                    onChange={(e) => setTagSearchValue(e.target.value)}
                  />
                  <div className="flex gap-2 flex-wrap">
                    {!tagsLoading &&
                      tags.map((tag) => {
                        const currentTags = form.getValues("tags");
                        const isSelected = currentTags?.find(
                          (t) => t === tag.id,
                        );
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
                              key={`skeleton-${idx}`}
                              className={`animate-pulse h-[18px] bg-muted rounded-md w-${idx % 2 === 0 ? "10" : "16"} mb-2`}
                            />
                          ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="scroll-m-20 text-2xl font-semibold tracking-tight w-full mb-2">
                    {t.addItemForm.subheadings.selectedTags[appLang]}
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
                        {t.addItemForm.paragraphs.noTagsSelected[appLang]}
                      </p>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Images */}
            <AccordionItem
              value="images"
              className="p-10 w-full border-b-0 w-full"
            >
              <AccordionTrigger className="w-full" iconProps="!w-5 h-auto">
                <div className="mb-6">
                  <p className="scroll-m-20 text-2xl font-semibold tracking-tight w-full">
                    {t.addItemForm.headings.addImages[appLang]}
                  </p>
                  <p className="text-sm leading-none font-medium">
                    {t.addItemForm.paragraphs.imagePrompt[appLang]}
                  </p>
                </div>
              </AccordionTrigger>

              <AccordionContent className="mt-10">
                <ItemImageUpload
                  item_id={form.watch("id") || ""}
                  formImages={
                    form.watch("images") || { main: null, details: [] }
                  }
                  updateForm={form.setValue}
                />
              </AccordionContent>
            </AccordionItem>

            <div className="p-10 pt-2 flex justify-end gap-4">
              {!onUpdate && (
                <>
                  <Button
                    variant="default"
                    disabled={isEditing}
                    onClick={handleNavigateSummary}
                    type="button"
                  >
                    {t.addItemForm.buttons.goToSummary[appLang]}
                  </Button>
                  <Button variant="outline" type="submit">
                    {isEditing || onUpdate
                      ? t.addItemForm.buttons.updateItem[appLang]
                      : t.addItemForm.buttons.addItem[appLang]}
                  </Button>
                </>
              )}
            </div>
          </Accordion>
        </form>
      </Form>
    </div>
  );
}

export default AddItemForm;
