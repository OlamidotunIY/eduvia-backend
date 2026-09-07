import { UserType } from "../../../../user/domain/value-objects/user-type.v0";
import { AuthStatus } from "../../../domain/value-objects/auth-status.v0";

export interface AuthAccountDTO {
    id: number;
    userId: number;
    userType: UserType;
    credentialHash: string;
    scope: string;
    totpEnabled: boolean;
    authStatus: AuthStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface GetAuthAccountPayload {
    authAccountId: number;
}