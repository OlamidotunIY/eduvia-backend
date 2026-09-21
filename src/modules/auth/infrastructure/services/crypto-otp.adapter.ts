import { Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';
import * as bcrypt from 'bcrypt';
import { IOtpPort, GenerateOtpResult } from '../../domain/ports';

@Injectable()
export class CryptoOtpAdapter implements IOtpPort {
  private readonly length: number;
  private readonly saltRounds: number;

  constructor() {
    this.length = parseInt(process.env['OTP_LENGTH'] ?? '6', 10);
    this.saltRounds = parseInt(process.env['BCRYPT_SALT_ROUNDS'] ?? '12', 10);
  }

  async generate(): Promise<GenerateOtpResult> {
    const max = Math.pow(10, this.length);
    const code = crypto.randomInt(0, max).toString().padStart(this.length, '0');
    const hash = await bcrypt.hash(code, this.saltRounds);
    return { code, hash };
  }
}
