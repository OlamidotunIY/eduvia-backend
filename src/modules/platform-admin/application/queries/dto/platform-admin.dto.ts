import { PlatformAdminRole } from '../../../domain';

export interface PlatformAdminDto {
  id: string;
  userId: string;
  role: PlatformAdminRole;
  createdAt: Date;
  updatedAt: Date;
}
