import { UserType } from "../../../../user/domain/value-objects/user-type.v0";
import { SessionStatus } from "../../../domain/value-objects/session-stutus.v0";

export interface SessionDTO {
    id: number;
    authAccountId: number;
    userId: number;
    userType: UserType;
    accessTokenExpiresAt: Date;
    refreshTokenExpiresAt: Date;
    ipAddress: string;
    userAgent: string;
    sessionStatus: SessionStatus;
    revokedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface GetSessionPayload {
    sessionId: number;
}