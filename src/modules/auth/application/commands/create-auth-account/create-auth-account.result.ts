import { UserType } from "../../../../user/domain/value-objects/user-type.v0";

export interface CreateAuthAccountPayload {
    id: number;
    userId: number;
    userType: UserType;
    credentialHash: string;
    scope: string;
    correlationId: string;
}