import { Item } from "@/types/item";
import { createItemDto } from "@/store/utils/validate";
import { toast } from "sonner";
import { t } from "@/translations";
import { OrgLocationWithNames } from "@/types/organizationLocation";

export function buildCandidateFrom(
  fd: Item,
  localSelectedTags: string[],
  orgLocations: OrgLocationWithNames[],
) {
  const loc = orgLocations.find(
    (l) => l.storage_location_id === fd.location_id,
  );

  return {
    id: String(fd.id),
    location: loc
      ? {
          id: loc.storage_location_id,
          name: loc.storage_locations?.name ?? "",
          address: loc.storage_locations?.address ?? "",
        }
      : {
          id: fd.location_id ?? "",
          name: fd.location_details?.name ?? "",
          address: fd.location_details?.address ?? "",
        },
    quantity: Number(fd.quantity ?? 0),
    available_quantity: Number(fd.available_quantity ?? fd.quantity ?? 0),
    is_active: Boolean(fd.is_active),
    translations: fd.translations,
    category_id: fd.category_id,
    tags: localSelectedTags,
    images: (
      fd as unknown as {
        images?: { main: unknown; details: unknown[] };
      }
    ).images ?? { main: null, details: [] },
  } as const;
}

export function validateCandidateWithMessages(
  candidate: unknown,
  lang: keyof typeof t.addItemForm.messages.validation | (string & {}),
) {
  const validation = createItemDto.safeParse(candidate);
  if (!validation.success) {
    const first = validation.error.issues[0];
    const key = first?.message as
      | keyof typeof t.addItemForm.messages.validation
      | undefined;

    if (key && t.addItemForm.messages.validation[key]) {
      const mapping = t.addItemForm.messages.validation[key];
      toast.error(mapping[lang as keyof typeof mapping] ?? "Invalid input");
    } else {
      const fallback = t.addItemForm.messages.error.fallbackFormError as
        | Record<string, string>
        | undefined;

      toast.error(fallback?.[lang as string] ?? "Invalid input");
    }
    return false;
  }

  return true;
}
