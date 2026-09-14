// src/modules/auth/domain/ports/otp.port.ts

export interface GenerateOtpResult {
  /** Plain-text code — send this to the user via email/SMS */
  code: string;
  /** Hash of the code — store this in Verification.valueHash */
  hash: string;
}

export abstract class IOtpPort {
  /**
   * Generates a random OTP code and returns both the plain code
   * and its hash for storage in the Verification aggregate.
   */
  abstract generate(): Promise<GenerateOtpResult>;
}
