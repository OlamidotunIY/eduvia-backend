import { BusinessRuleViolationError } from '@modules/shared/domain';
import {
  PlanDiscountId,
  SubscriptionPlanId,
  DiscountType,
  DiscountScope,
} from '../value-objects';

export interface PlanDiscountProps {
  id: PlanDiscountId;
  planId: SubscriptionPlanId;
  type: DiscountType;
  amount: number;
  currency: string | null;
  scope: DiscountScope;
  parentId: string | null;
  expiresAt: Date | null;
  isActive: boolean;
  code: string | null;
  createdAt: Date;
}

export class PlanDiscount {
  private _id: PlanDiscountId;
  private _planId: SubscriptionPlanId;
  private _type: DiscountType;
  private _amount: number;
  private _currency: string | null;
  private _scope: DiscountScope;
  private _parentId: string | null;
  private _expiresAt: Date | null;
  private _isActive: boolean;
  private _code: string | null;
  private _createdAt: Date;

  protected constructor(props: PlanDiscountProps) {
    this._id = props.id;
    this._planId = props.planId;
    this._type = props.type;
    this._amount = props.amount;
    this._currency = props.currency;
    this._scope = props.scope;
    this._parentId = props.parentId;
    this._expiresAt = props.expiresAt ? new Date(props.expiresAt) : null;
    this._isActive = props.isActive;
    this._code = props.code;
    this._createdAt = new Date(props.createdAt);
  }

  public static create(props: {
    id?: PlanDiscountId;
    planId: SubscriptionPlanId;
    type: DiscountType;
    amount: number;
    currency?: string | null;
    scope: DiscountScope;
    parentId?: string | null;
    expiresAt?: Date | null;
    code?: string | null;
  }): PlanDiscount {
    if (props.amount <= 0) {
      throw new BusinessRuleViolationError('Discount amount must be greater than zero.');
    }
    if (props.type === DiscountType.percentage && props.amount > 100) {
      throw new BusinessRuleViolationError('Percentage discount cannot exceed 100%.');
    }
    if (props.scope === DiscountScope.specific_parent && !props.parentId) {
      throw new BusinessRuleViolationError('Specific parent discount must specify a parentId.');
    }

    return new PlanDiscount({
      id: props.id ?? PlanDiscountId.create(),
      planId: props.planId,
      type: props.type,
      amount: props.amount,
      currency: props.currency ?? null,
      scope: props.scope,
      parentId: props.parentId ?? null,
      expiresAt: props.expiresAt ?? null,
      isActive: true,
      code: props.code ? props.code.trim().toUpperCase() : null,
      createdAt: new Date(),
    });
  }

  public static reconstitute(props: PlanDiscountProps): PlanDiscount {
    return new PlanDiscount(props);
  }

  public get id(): PlanDiscountId {
    return this._id;
  }

  public get planId(): SubscriptionPlanId {
    return this._planId;
  }

  public get type(): DiscountType {
    return this._type;
  }

  public get amount(): number {
    return this._amount;
  }

  public get currency(): string | null {
    return this._currency;
  }

  public get scope(): DiscountScope {
    return this._scope;
  }

  public get parentId(): string | null {
    return this._parentId;
  }

  public get expiresAt(): Date | null {
    return this._expiresAt ? new Date(this._expiresAt) : null;
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  public get code(): string | null {
    return this._code;
  }

  public get createdAt(): Date {
    return new Date(this._createdAt);
  }

  public deactivate(): void {
    this._isActive = false;
  }

  public isApplicable(parentId?: string, code?: string): boolean {
    if (!this._isActive) {
      return false;
    }
    if (this._expiresAt && this._expiresAt < new Date()) {
      return false;
    }
    if (this._code && code) {
      if (this._code.toUpperCase() !== code.trim().toUpperCase()) {
        return false;
      }
    } else if (this._code && !code) {
      return false;
    }
    if (this._scope === DiscountScope.specific_parent && this._parentId !== parentId) {
      return false;
    }
    return true;
  }

  public calculateEffectivePrice(basePrice: number): number {
    if (this._type === DiscountType.percentage) {
      const deduction = Math.round((basePrice * this._amount) / 100);
      return Math.max(0, basePrice - deduction);
    }
    return Math.max(0, basePrice - this._amount);
  }
}
