export type Category = {
  id: string;
  parent_id: string | null;
  translations: {
    fi: string;
    en: string;
  };
  subcategories?: Category[];
};

export function buildCategoryTree(categories: Category[]): Category[] {
  const map = new Map<string, Category>();

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
