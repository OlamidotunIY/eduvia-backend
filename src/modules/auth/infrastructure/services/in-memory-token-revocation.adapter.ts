import { Injectable } from '@nestjs/common';
import { ITokenRevocationPort } from '../../domain/ports';

@Injectable()
export class InMemoryTokenRevocationAdapter implements ITokenRevocationPort {
  private readonly store = new Map<string, number>(); // jti → expiresAt epoch ms

  async revoke(jti: string, ttlSeconds: number): Promise<void> {
    this.store.set(jti, Date.now() + ttlSeconds * 1000);
    this.prune();
  }

  async isRevoked(jti: string): Promise<boolean> {
    const expiresAt = this.store.get(jti);
    if (expiresAt === undefined) return false;
    if (Date.now() > expiresAt) {
      this.store.delete(jti);
      return false;
    }
    return true;
  }

  private prune(): void {
    const now = Date.now();
    for (const [key, exp] of this.store) {
      if (now > exp) this.store.delete(key);
    }
  }
}
