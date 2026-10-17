import { NotFoundError } from '@modules/shared/domain';

export class DeviceTokenNotFoundError extends NotFoundError {
  constructor(identifier: string) {
    super(`Device token '${identifier}' was not found.`);
  }
}
