import { ItemFormData, MappedItem } from "@common/items/form.types";
import { TagLink } from "@common/items/storage-items.types";
import { ItemImageInsert } from "@src/modules/item-images/types/item-image.types";

export function mapStorageItems(payload: ItemFormData): MappedItem[] {
  const org = payload.org;
  console.log("org: ", org);
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
