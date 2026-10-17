import { IsNotEmpty, IsString } from 'class-validator';

export class SuspendOrgDto {
  @IsNotEmpty()
  @IsString()
  reason!: string;
}
