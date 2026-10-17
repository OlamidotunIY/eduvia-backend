import { NotFoundError } from '@modules/shared/domain';

export class PlanDiscountNotFoundError extends NotFoundError {
  constructor(discountId: string) {
    super(`PlanDiscount '${discountId}' was not found.`);
  }
}
