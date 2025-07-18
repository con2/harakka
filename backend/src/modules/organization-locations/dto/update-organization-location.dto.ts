import { IsUUID, IsOptional } from "class-validator";

export class UpdateOrganizationLocationDto {
  @IsOptional()
  @IsUUID()
  organization_id?: string;

  @IsOptional()
  @IsUUID()
  storage_location_id?: string;

  @IsOptional()
  @IsUUID()
  updated_by?: string;
}
