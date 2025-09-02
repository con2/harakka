import { Category } from "@common/items/categories";

/**
 * Transforms a flat array of category objects into a nested, tree-like structure.
 *
 * This function first separates top-level categories from subcategories.
 * It then iterates through the top-level categories and assigns their
 * respective subcategories to a 'subcategories' array property.
 *
 * @param {Array<Object>} categories - An array of category objects, each with 'id', 'name', and 'parent_id' properties.
 * @returns {Array<Object>} - A nested array of categories.
 */
export function mapCategoriesToTree(categories: Category[]) {
  // Use a Map for efficient lookup of subcategories by their parent_id.
  const subcategoriesMap = new Map();
  // An array to hold the top-level categories.
  const topLevelCategories: Category[] = [];

  // First pass: Separate top-level categories from subcategories.
  // Group subcategories by their parent_id in the map.
  categories.forEach((category) => {
    if (category.parent_id === null) {
      topLevelCategories.push(category);
    } else {
      if (!subcategoriesMap.has(category.parent_id)) {
        subcategoriesMap.set(category.parent_id, []);
      }
      subcategoriesMap.get(category.parent_id).push(category);
    }
  });

  // Second pass: Attach subcategories to their parent categories.
  topLevelCategories.forEach((category) => {
    if (subcategoriesMap.has(category.id)) {
      category.subcategories = subcategoriesMap.get(category.id);
    }
  });

  return topLevelCategories;
}
