import { DevicePlatform } from '../../domain';

export class RegisterDeviceTokenDto {
  token: string;
  platform: DevicePlatform;
}
