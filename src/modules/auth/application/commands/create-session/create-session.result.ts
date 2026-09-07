import { UserType } from "../../../../user/domain/value-objects/user-type.v0";

export interface CreateSessionPayload {
    id: number;
    authAccountId: number;
    userId: number;
    userType: UserType;
    refreshTokenHash: string;
    accessTokenExpiresAt: Date;
    refreshTokenExpiresAt: Date;
    ipAddress: string;
    userAgent: string;
    correlationId: string;
}