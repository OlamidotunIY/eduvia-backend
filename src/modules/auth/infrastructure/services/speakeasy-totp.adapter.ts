import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import { ITotpPort, GenerateTotpSecretResult } from '../../domain/ports';

@Injectable()
export class SpeakeasyTotpAdapter implements ITotpPort {
  async generateSecret(params: {
    userEmail: string;
    issuer: string;
  }): Promise<GenerateTotpSecretResult> {
    const secret = speakeasy.generateSecret({
      name: `${params.issuer} (${params.userEmail})`,
      issuer: params.issuer,
      length: 20,
    });

    return { secret: secret.base32, otpauthUrl: secret.otpauth_url! };
  }

  async verify(params: { token: string; secret: string }): Promise<boolean> {
    return speakeasy.totp.verify({
      secret: params.secret,
      encoding: 'base32',
      token: params.token,
      window: 1,
    });
  }
}
