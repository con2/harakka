import { createCategoryDto, getInitialData } from "./category.schema";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/context/LanguageContext";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearSelectedCategory,
  createCategory,
  fetchAllCategories,
  selectCategories,
  selectCategory,
  updateCategory,
} from "@/store/slices/categoriesSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { SubmitErrorHandler, useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { toast } from "sonner";
import { t } from "@/translations";
import { ReactNode, useEffect } from "react";
import { buildCategoryTree, Category } from "@/store/utils/format";

function AddCategory() {
  const { lang } = useLanguage();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const categories = useAppSelector(selectCategories);
  const selectedCategory = useAppSelector(selectCategory);

  const form = useForm<z.infer<typeof createCategoryDto>>({
    resolver: zodResolver(createCategoryDto),
    defaultValues: selectedCategory ?? getInitialData(),
  });

  /*----------------handlers----------------------------------*/
  const cancel = () => {
    void dispatch(clearSelectedCategory());
    form.reset();
    const pageState = (location.state as { page?: number })?.page;
    void navigate("/admin/categories", {
      state: pageState ? { page: pageState } : undefined,
    });
  };

  useEffect(() => {
    void dispatch(fetchAllCategories({ page: 1, limit: 100 }));
  }, [dispatch]);

  const onValidSubmit = (
    values: z.infer<typeof createCategoryDto>,
    e?: React.BaseSyntheticEvent,
  ) => {
    const promise = selectedCategory
      ? dispatch(
          updateCategory({ id: selectedCategory.id, updateCategory: values }),
        ).unwrap()
      : dispatch(createCategory(values)).unwrap();

    toast.promise(promise, {
      loading: t.addCategory.messages.loading[lang],
      success: () => {
        if (selectedCategory) {
          clearSelectedCategory();
        }
        const pageState = (location.state as { page?: number })?.page;
        void navigate("/admin/categories", {
          state: {
            search: values.translations[lang],
            ...(pageState && { page: pageState }),
          },
        });
        // reset form on success
        if (e?.target?.reset) {
          e.target.reset();
        }
        return selectedCategory
          ? t.addCategory.messages.update.success[lang]
          : t.addCategory.messages.create.success[lang];
      },
      error: (error) => {
        const fallback = selectedCategory
          ? t.addCategory.messages.update.fail[lang]
          : t.addCategory.messages.create.fail[lang];

        const reason =
          typeof error === "string"
            ? error
            : error instanceof Error
              ? error.message
              : undefined;

        if (!reason || reason === fallback) {
          return fallback;
        }

        return `${fallback}: ${reason}`;
      },
    });
  };

  const onInvalidSubmit: SubmitErrorHandler<Category> = (errors) => {
    if (errors.translations) {
      toast.error(t.addCategory.messages.validation.translations?.[lang]);
    } else {
      toast.error(t.addCategory.messages.general[lang]);
    }
  };

  const mappedCategories = buildCategoryTree(categories);
  const renderCategoryOptions = (
    categories: Category[],
    level = 0,
  ): ReactNode[] => {
    return categories.flatMap((cat) => [
      <SelectItem
        style={{
          paddingLeft: `calc(var(--spacing) * 2 + (var(--spacing) * ${level * 4}))`,
          fontWeight: level === 0 ? "600" : "400",
        }}
        key={cat.id}
        value={cat.id}
      >
        {cat.translations[lang]}
      </SelectItem>,
      ...(cat.subcategories && cat.subcategories.length
        ? renderCategoryOptions(cat.subcategories, level + 1)
        : []),
    ]);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onValidSubmit, onInvalidSubmit)}
        className="flex flex-col gap-3 w-full max-w-[500px]"
      >
        <h1 className="text-xl mb-4">
          {selectedCategory
            ? t.addCategory.headings.update[lang]
            : t.addCategory.headings.addNew[lang]}
        </h1>

        <div className="grid w-full md:w-fit grid-cols-1 md:grid-cols-2 gap-6 md:gap-4 md:grid-rows-2">
          <div>
            <FormField
              control={form.control}
              name="translations.en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.addCategory.form.nameEn[lang]}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="flex-1">
            <FormField
              control={form.control}
              name="translations.fi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.addCategory.form.nameFi[lang]}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="parent_id"
            render={({ field }) => (
              <FormItem>
                <Label>{t.addCategory.form.parentCategory[lang]}</Label>
                <Select
                  name="translations"
                  onValueChange={field.onChange}
                  defaultValue={form.getValues("parent_id") ?? ""}
                >
                  <FormControl>
                    <SelectTrigger className="md:w-[250px] w-full">
                      <SelectValue
                        placeholder={t.addCategory.placeholders.noParent[lang]}
                      ></SelectValue>
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    {mappedCategories &&
                      renderCategoryOptions(mappedCategories)}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          ></FormField>
        </div>

        <div className="*:w-fit *:px-8 self-end gap-3 flex">
          <Button variant="secondary" onClick={cancel} type="button">
            {t.addCategory.buttons.back[lang]}
          </Button>
          <Button variant="outline" type="submit">
            {t.addCategory.buttons.save[lang]}
          </Button>
        </div>
      </form>
    </Form>
  );
}
export default AddCategory;
