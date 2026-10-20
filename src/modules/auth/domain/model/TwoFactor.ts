// src/modules/auth/domain/model/TwoFactor.ts
import { AggregateRoot } from '@modules/shared';
import { TwoFactorId } from '../value-objects/two-factor-id.vo';
import { AuthInvariantError } from '../errors';

export class TwoFactor extends AggregateRoot<TwoFactorId> {
  private _secret: string;
  private _backupCodes: string; // Assuming a stringified JSON array or hashed string
  private _userId: string;

  private constructor(params: {
    id: TwoFactorId;
    secret: string;
    backupCodes: string;
    userId: string;
  }) {
    super(params.id);
    this._secret = params.secret;
    this._backupCodes = params.backupCodes;
    this._userId = params.userId;
  }

  public static create(params: {
    id: TwoFactorId;
    secret: string;
    backupCodes: string;
    userId: string;
  }): TwoFactor {
    if (!params.secret.trim() || !params.backupCodes.trim()) {
      throw new AuthInvariantError('2FA secret and backup codes must be provided');
    }
    return new TwoFactor(params);
  }

  public static reconstitute(params: {
    id: TwoFactorId;
    secret: string;
    backupCodes: string;
    userId: string;
  }): TwoFactor {
    return new TwoFactor(params);
  }

  public updateBackupCodes(newBackupCodes: string): void {
    this._backupCodes = newBackupCodes;
  }

  // Getters
  public get secret(): string { return this._secret; }
  public get backupCodes(): string { return this._backupCodes; }
  public get userId(): string { return this._userId; }
}