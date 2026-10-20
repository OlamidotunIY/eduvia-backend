import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import { DeviceToken, DeviceTokenId, DevicePlatform } from '../../../domain';
import { DeviceToken as PrismaDeviceToken } from '@generated/prisma/client';

@Injectable()
export class DeviceTokenMapper implements IMapper<DeviceToken, PrismaDeviceToken> {
  toDomain(record: PrismaDeviceToken): DeviceToken {
    return DeviceToken.reconstitute({
      id: DeviceTokenId.from(record.id),
      userId: record.userId,
      token: record.token,
      platform: record.platform as DevicePlatform,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: DeviceToken): PrismaDeviceToken {
    return {
      id: entity.id.toString(),
      userId: entity.userId,
      token: entity.token,
      platform: entity.platform,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
