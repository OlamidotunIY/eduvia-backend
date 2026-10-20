import { ICommand } from '@nestjs/cqrs';
import { DiscountType, DiscountScope } from '../../../domain';

export class AddPlanDiscountCommand implements ICommand {
  constructor(
    public readonly orgId: string,
    public readonly planId: string,
    public readonly type: DiscountType,
    public readonly amount: number,
    public readonly scope: DiscountScope,
    public readonly currency?: string,
    public readonly parentId?: string,
    public readonly expiresAt?: Date,
    public readonly code?: string,
  ) {}
}
