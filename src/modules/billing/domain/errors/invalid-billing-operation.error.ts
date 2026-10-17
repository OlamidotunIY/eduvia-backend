import { BadRequestError } from '@modules/shared/domain';

export class InvalidBillingOperationError extends BadRequestError {
  constructor(message: string) {
    super(message);
  }
}
