import { BadRequestError } from '@modules/shared/domain';

export class InvalidBillingModelError extends BadRequestError {
  constructor(message: string) {
    super(message);
  }
}
