import { PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import { DeviceToken, DeviceTokenId, IDeviceTokenRepository } from '../../../domain';
import { DeviceTokenMapper } from '../mappers/device-token.mapper';

@Injectable()
export class PrismaDeviceTokenRepository implements IDeviceTokenRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly deviceTokenMapper: DeviceTokenMapper,
  ) {}

  public async findById(id: DeviceTokenId): Promise<DeviceToken | null> {
    const record = await this.prisma.deviceToken.findUnique({
      where: { id: id.unpack() },
    });
    return record ? this.deviceTokenMapper.toDomain(record) : null;
  }

  public async findActiveByUserId(userId: string): Promise<DeviceToken[]> {
    const records = await this.prisma.deviceToken.findMany({
      where: {
        userId,
        isActive: true,
      },
    });
    return records.map((r) => this.deviceTokenMapper.toDomain(r));
  }

  public async findByToken(token: string): Promise<DeviceToken | null> {
    const record = await this.prisma.deviceToken.findFirst({
      where: { token },
    });
    return record ? this.deviceTokenMapper.toDomain(record) : null;
  }

  public async save(deviceToken: DeviceToken): Promise<void> {
    const data = this.deviceTokenMapper.toPersistence(deviceToken);
    const id = deviceToken.id.unpack();

    await this.prisma.deviceToken.upsert({
      where: { id },
      create: {
        id,
        ...data,
      },
      update: data,
    });
  }

  public async deactivateToken(token: string): Promise<void> {
    await this.prisma.deviceToken.updateMany({
      where: { token },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
  }

  public async deactivateUserDeviceTokens(userId: string): Promise<void> {
    await this.prisma.deviceToken.updateMany({
      where: { userId },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
  }
}
