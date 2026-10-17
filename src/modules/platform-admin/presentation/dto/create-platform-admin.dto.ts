import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { PlatformAdminRole } from '../../domain';

export class CreatePlatformAdminDto {
  @IsNotEmpty()
  @IsUUID()
  userId!: string;

  @IsNotEmpty()
  @IsEnum(PlatformAdminRole)
  role!: PlatformAdminRole;
}
