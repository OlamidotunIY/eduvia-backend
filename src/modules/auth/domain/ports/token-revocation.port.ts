export abstract class ITokenRevocationPort {
    abstract revoke(jti: string, ttlSeconds: number): Promise<void>;
    abstract isRevoked(jti: string): Promise<boolean>;
}