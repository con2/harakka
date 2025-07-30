import {
  CreateItemPayload,
  InsertItem,
  OrgItem,
  TagLink,
} from "@common/items/storage-items.types";

/* eslint-disable @typescript-eslint/no-explicit-any */

function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => !keys.includes(k as K)),
  ) as Omit<T, K>;
}

export function mapStorageItems(payload: CreateItemPayload[]): InsertItem[] {
  return payload.map((item) =>
    omit(item, ["tagIds", "org_id", "storage_location_id"]),
  );
}

export function mapOrgLinks(payload: CreateItemPayload[]): OrgItem[] {
  return payload.map(
    ({ id, org_id, storage_location_id, items_number_total }) => ({
      storage_item_id: id,
      organization_id: org_id,
      storage_location_id,
      owned_quantity: items_number_total,
      is_active: true,
    }),
  );
}

export function mapTagLinks(payload: CreateItemPayload[]): TagLink[] {
  const now = new Date().toISOString();
  return payload.flatMap(({ id, tagIds }) =>
    Array.isArray(tagIds)
      ? tagIds.map((tag_id) => ({ tag_id, item_id: id, created_at: now }))
      : [],
  );
}
