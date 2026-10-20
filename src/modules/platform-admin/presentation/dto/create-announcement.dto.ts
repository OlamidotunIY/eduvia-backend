import { IsArray, IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAnnouncementDto {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  body!: string;

  @IsOptional()
  @IsArray()
  targetRoles?: string[];

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
