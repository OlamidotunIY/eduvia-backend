import { IsOptional, IsString } from 'class-validator';

export class ApproveOrgDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
