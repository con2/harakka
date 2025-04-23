export interface Tag {
  id: string;
  created_at: string;
  translations?: {
    fi?: { name: string };
    en?: { name: string };
  };
}

export interface TagState {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  selectedTags: Tag[] | null;
}