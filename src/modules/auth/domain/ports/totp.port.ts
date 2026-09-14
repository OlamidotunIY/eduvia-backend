// src/modules/auth/domain/ports/totp.port.ts

export interface GenerateTotpSecretResult {
  /** Base32-encoded TOTP secret — store this in AuthAccount.totpSecret */
  secret: string;
  /** otpauth:// URI suitable for QR code rendering */
  otpauthUrl: string;
}

export abstract class ITotpPort {
  /**
   * Generates a new TOTP secret and the otpauth:// URI
   * for display as a QR code to the user.
   */
  abstract generateSecret(params: {
    userEmail: string;
    issuer: string;
  }): Promise<GenerateTotpSecretResult>;

  /**
   * Verifies a 6-digit TOTP token against a stored secret.
   * Uses a window of ±1 step (30s) to account for clock drift.
   */
  abstract verify(params: {
    token: string;
    secret: string;
  }): Promise<boolean>;
}
