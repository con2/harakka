import { IsUUID, IsOptional } from "class-validator";

export class CreateOrganizationLocationDto {
  @IsUUID()
  organization_id: string;

  @IsUUID()
  storage_location_id: string;

  @IsOptional()
  @IsUUID()
  created_by?: string;
}
