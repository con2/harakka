import { ItemFormData, MappedItem } from "@common/items/form.types";
import { OrgItem, TagLink } from "@common/items/storage-items.types";
import { ItemImageInsert } from "@src/modules/item-images/types/item-image.types";

export function mapStorageItems(payload: ItemFormData): MappedItem[] {
  return payload.items.map((item) => {
    const { images, location, tags, ...rest } = item;
    const newItem: MappedItem = {
      ...rest,
      location_id: location.id,
      org_id: payload.org.id,
    };
    return newItem;
  });
}

export function mapOrgLinks(payload: ItemFormData): OrgItem[] {
  return payload.items.map(({ id, items_number_total, location }) => ({
    storage_item_id: id,
    organization_id: payload.org.id,
    storage_location_id: location.id,
    owned_quantity: items_number_total,
    is_active: true,
  }));
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
