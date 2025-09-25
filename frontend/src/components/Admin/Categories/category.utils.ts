import { Category } from "@common/items/categories";

export type ExtendedCategory = Category & {
  subcategories?: Subcategories;
  children?: ExtendedCategory[];
};

type Subcategories = ExtendedCategory[];

export function buildCategoryTree(categories: Category[]): ExtendedCategory[] {
  const map = new Map<string, ExtendedCategory>();

  // initialize map with empty subcategories
  categories.forEach((cat) => {
    map.set(cat.id, { ...cat, subcategories: [] });
  });

  const roots: Category[] = [];

  categories.forEach((cat) => {
    if (cat.parent_id) {
      // find parent and push into its subcategories
      const parent = map.get(cat.parent_id);
      if (parent) {
        parent.subcategories!.push(map.get(cat.id)!);
      }
    } else {
      // root category
      roots.push(map.get(cat.id)!);
    }
  });

  return roots;
}
