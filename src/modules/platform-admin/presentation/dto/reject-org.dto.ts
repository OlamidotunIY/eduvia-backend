import { IsNotEmpty, IsString } from 'class-validator';

export class RejectOrgDto {
  @IsNotEmpty()
  @IsString()
  reason!: string;
}
