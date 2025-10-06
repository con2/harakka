import { ItemFormData, MappedItem } from "@common/items/form.types";
import { Image, StorageItem, TagLink } from "@common/items/storage-items.types";
import { ItemImageInsert } from "@src/modules/item-images/types/item-image.types";

export function mapStorageItems(payload: ItemFormData): MappedItem[] {
  const org = payload.org;
  return payload.items.map((item) => {
    const { images, location, tags, ...rest } = item;
    const newItem: MappedItem = {
      ...rest,
      location_id: location.id,
      org_id: org.id,
    };
    return newItem;
  });
}

export function payloadToStorageItem(payload: ItemFormData): StorageItem[] {
  const org = payload.org;

  return payload.items.map((item) => {
    return {
      id: item.id,
      org_id: org.id,
      category_id: item.category_id,
      location_id: item.location.id,
      quantity: item.quantity,
      available_quantity: item.available_quantity,
      is_active: item.is_active,
      is_deleted: false,
      compartment_id: null,
      average_rating: null,
      translations: item.translations,
    } as StorageItem;
  });
}

export function mapTagLinks(payload: ItemFormData): TagLink[] {
  const now = new Date().toISOString();
  return payload.items.flatMap(({ id, tags }) =>
    Array.isArray(tags)
      ? tags.map((tag_id) => ({ tag_id, item_id: id, created_at: now }))
      : [],
  );
}

export function mapItemImages(data: ItemFormData): ItemImageInsert[] {
  const images: ItemImageInsert[] = [];

  data.items.forEach((item) => {
    const {
      id: item_id,
      images: { main, details },
    } = item;

    if (main) {
      images.push({
        item_id,
        image_url: main.url,
        storage_path: main.path,
        ...main.metadata,
      });
    }

    details.forEach((img) => {
      images.push({
        item_id,
        image_url: img.url,
        storage_path: img.path,
        ...img.metadata,
      });
    });
  });

  return images;
}

export function mapImageData(
  data: ItemFormData,
  property: string = "url",
): string[] {
  const urls: string[] = [];

  data.items.forEach((item) => {
    if (item.images.main) {
      urls.push(item.images.main[property]);
    }

    item.images.details.forEach((img) => {
      urls.push(img[property]);
    });
  });

  return urls;
}

// -------- Filters helpers --------

// A minimal structural type for Supabase query builders we can filter.
// We only declare the methods we actually use so this stays compatible with
// both head/count queries and data queries.
export type FilterableQuery = {
  or(expr: string): unknown;
  eq(column: string, value: unknown): unknown;
  overlaps(column: string, value: string[]): unknown;
  contains(column: string, value: string[]): unknown;
  in(column: string, values: string[]): unknown;
  gte(column: string, value: string | number): unknown;
  lt(column: string, value: string | number): unknown;
  order?: (column: string, opts?: { ascending?: boolean }) => unknown;
};

// Build a PostgREST OR expression for availability range that supports a
// graceful fallback: use available_quantity when it's present,
// otherwise allow items where that column is null and we compare against
// quantity instead.
//
// The final expression has the shape:
//   or(
//     and(current.gte.min,current.lte.max),
//     and(available_quantity.is.null,total.gte.min,total.lte.max)
//   )
// Where min/max are included only if provided.
export function buildAvailabilityOrExpr(
  availability_min?: number,
  availability_max?: number,
): string | null {
  if (availability_min === undefined && availability_max === undefined) {
    return null;
  }

  const min = availability_min;
  const max = availability_max;
  const currentConds: string[] = [];
  const totalConds: string[] = [];
  if (min !== undefined) {
    currentConds.push(`available_quantity.gte.${min}`);
    totalConds.push(`quantity.gte.${min}`);
  }
  if (max !== undefined) {
    currentConds.push(`available_quantity.lte.${max}`);
    totalConds.push(`quantity.lte.${max}`);
  }
  const group1 =
    currentConds.length > 0 ? `and(${currentConds.join(",")})` : "";
  const group2Parts = ["available_quantity.is.null", ...totalConds];
  const group2 = `and(${group2Parts.join(",")})`;
  return group1 ? `${group1},${group2}` : group2;
}

// Apply all shared filters onto a given Supabase query builder.
// This mutates and returns the same builder, so callers can keep chaining.
//
// Notes:
// - searchquery: applied with or(...) across multiple text columns using ilike.
// - isActive: strict boolean check to avoid misinterpreting undefined.
// - tags: uses contains on an array column to ensure items have ALL selected tags (AND logic).
// - location/org/category: converted to IN lists when non-empty.
// - from_date/to_date: simple created_at gte/lt bounds.
// - availability_min/max: uses buildAvailabilityOrExpr to combine the
//   "current in storage" column with a fallback to "total" when current is null.
export function applyItemFilters<T extends FilterableQuery>(
  query: T,
  opts: {
    searchquery?: string;
    isActive?: boolean;
    tags?: string;
    location_filter?: string;
    categories?: string[] | null;
    from_date?: string;
    to_date?: string;
    availability_min?: number;
    availability_max?: number;
    org_filter?: string;
  },
): T {
  const {
    searchquery,
    isActive,
    tags,
    location_filter,
    categories,
    from_date,
    to_date,
    availability_min,
    availability_max,
    org_filter,
  } = opts;

  if (searchquery) {
    // PostgREST OR with comma-separated conditions.
    query.or(
      `fi_item_name.ilike.%${searchquery}%,` +
        `fi_item_type.ilike.%${searchquery}%,` +
        `en_item_name.ilike.%${searchquery}%,` +
        `en_item_type.ilike.%${searchquery}%,` +
        `category_en_name.ilike.%${searchquery}%,` +
        `category_fi_name.ilike.%${searchquery}%,` +
        `translations->en->>item_description.ilike.%${searchquery}%,` +
        `translations->fi->>item_description.ilike.%${searchquery}%,` +
        `location_name.ilike.%${searchquery}%`,
    );
  }

  if (typeof isActive === "boolean") query.eq("is_active", isActive);
  if (tags) query.contains("tag_ids", tags.split(","));

  if (location_filter) {
    const locIds = location_filter
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    if (locIds.length > 0) query.in("location_id", locIds);
  }

  if (org_filter) query.in("organization_id", org_filter.split(","));

  if (categories && categories.length > 0) query.in("category_id", categories);

  if (from_date) query.gte("created_at", from_date);
  if (to_date) query.lt("created_at", to_date);

  const availExpr = buildAvailabilityOrExpr(availability_min, availability_max);
  if (availExpr) {
    // Wrap the availability checks using or(and(...), and(...)) to handle
    // both the current-in-storage path and the total fallback path.
    query.or(availExpr);
  }

  return query;
}

export const mapItemImagesUpdate = (
  images: Image[],
  item_id: string,
): ItemImageInsert[] => {
  return images.map((img: Image) => {
    const { metadata, url, full_path, path, ...rest } = img;
    return {
      image_url: url,
      item_id,
      storage_path: full_path,
      ...rest,
      ...metadata,
    };
  });
};
