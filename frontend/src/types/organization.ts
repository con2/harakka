import { OrgLocationWithNames } from "./organizationLocation";

export interface OrganizationDetails {
  id: string;
  name: string;
  slug?: string;
  description: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  logo_picture_url?: string | null;
}

export interface OrganizationState {
  organizations: OrganizationDetails[];
  selectedOrganization:
    | (OrganizationDetails & { locations?: OrgLocationWithNames })
    | null;
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  count: number;
}
