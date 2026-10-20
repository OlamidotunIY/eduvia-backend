import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  PlatformAdmin,
  PlatformAdminId,
  PlatformAdminRole,
} from '../../../domain';
import { PlatformAdmin as PrismaPlatformAdmin } from '@generated/prisma/client';

@Injectable()
export class PlatformAdminMapper implements IMapper<PlatformAdmin, PrismaPlatformAdmin> {
  toDomain(record: PrismaPlatformAdmin): PlatformAdmin {
    return PlatformAdmin.reconstitute({
      id: PlatformAdminId.from(record.id),
      userId: record.userId,
      role: record.role as PlatformAdminRole,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: PlatformAdmin): PrismaPlatformAdmin {
    return {
      id: entity.id.toString(),
      userId: entity.userId,
      role: entity.role,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
