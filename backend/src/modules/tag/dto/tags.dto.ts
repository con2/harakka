export class AssignTagsDto {
  itemId: string;
  tagIds: string[];
}
export class CreateTagDto {
  translations: {
    en: string;
    fi: string;
  };
}
export class UpdateTagDto {
  id: string;
  translations: {
    en?: string;
    fi?: string;
  };
}
