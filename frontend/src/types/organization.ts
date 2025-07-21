export interface OrganizationDetails {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface OrganizationState {
  organizations: OrganizationDetails[];
  selectedOrganization: OrganizationDetails | null;
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
