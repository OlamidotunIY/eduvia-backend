import { DeviceTokenId, DevicePlatform } from '../value-objects';
import { BusinessRuleViolationError } from '@modules/shared/domain';

export interface DeviceTokenProps {
  id: DeviceTokenId;
  userId: string;
  token: string;
  platform: DevicePlatform;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class DeviceToken {
  private _id: DeviceTokenId;
  private _userId: string;
  private _token: string;
  private _platform: DevicePlatform;
  private _isActive: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  protected constructor(props: DeviceTokenProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._token = props.token;
    this._platform = props.platform;
    this._isActive = props.isActive;
    this._createdAt = new Date(props.createdAt);
    this._updatedAt = new Date(props.updatedAt);
  }

  public static create(props: {
    id?: DeviceTokenId;
    userId: string;
    token: string;
    platform: DevicePlatform;
  }): DeviceToken {
    if (!props.userId) {
      throw new BusinessRuleViolationError('User ID is required for a device token.');
    }
    if (!props.token || props.token.trim().length === 0) {
      throw new BusinessRuleViolationError('Device registration token cannot be empty.');
    }

    const deviceTokenId = props.id ?? DeviceTokenId.create();
    const now = new Date();

    return new DeviceToken({
      id: deviceTokenId,
      userId: props.userId,
      token: props.token.trim(),
      platform: props.platform,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(props: DeviceTokenProps): DeviceToken {
    return new DeviceToken(props);
  }

  public deactivate(): void {
    if (!this._isActive) return;
    this._isActive = false;
    this._updatedAt = new Date();
  }

  public activate(token?: string): void {
    if (token && token.trim().length > 0) {
      this._token = token.trim();
    }
    this._isActive = true;
    this._updatedAt = new Date();
  }

  public get id(): DeviceTokenId {
    return this._id;
  }

  public get userId(): string {
    return this._userId;
  }

  public get token(): string {
    return this._token;
  }

  public get platform(): DevicePlatform {
    return this._platform;
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }
}
