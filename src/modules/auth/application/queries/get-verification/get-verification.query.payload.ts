import { VerificationStatus } from "../../../domain/value-objects/verification-status.v0";
import { VerificationType } from "../../../domain/value-objects/verification-type.v0";

export interface VerificationDTO {
    id: number;
    authAccountId: number;
    identifier: string;
    verificationType: VerificationType;
    verificationStatus: VerificationStatus;
    expiresAt: Date;
    attempts: number;
    maxAttempts: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface GetVerificationPayload {
    verificationId: number;
}