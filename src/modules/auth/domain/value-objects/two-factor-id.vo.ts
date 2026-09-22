import { BaseEntityId } from "@modules/shared";

export class TwoFactorId extends BaseEntityId {
  private constructor(value: string) { super(value); }
  public static create(value?: string): TwoFactorId { return new TwoFactorId(value || this.nextValue()); }
  public static from(value: string): TwoFactorId { return new TwoFactorId(value); }
}