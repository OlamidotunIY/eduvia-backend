import { DeviceToken } from '../entities/device-token.entity';
import { DeviceTokenId } from '../value-objects';

export abstract class IDeviceTokenRepository {
  public abstract findById(id: DeviceTokenId): Promise<DeviceToken | null>;

  public abstract findActiveByUserId(userId: string): Promise<DeviceToken[]>;

  public abstract findByToken(token: string): Promise<DeviceToken | null>;

  public abstract save(deviceToken: DeviceToken): Promise<void>;

  public abstract deactivateToken(token: string): Promise<void>;

  public abstract deactivateUserDeviceTokens(userId: string): Promise<void>;
}
