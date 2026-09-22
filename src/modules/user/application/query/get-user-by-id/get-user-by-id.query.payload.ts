import { UserStatus } from "../../../domain/value-objects/user-status.v0";
import { UserType } from "../../../domain/value-objects/user-type.v0";

export interface GetUserByIdPayload {
    userId: string
}

export interface UserDTO {
    id: string;
    userType: UserType;
    firstName: string;
    lastName: string;
    email: string;
    emailVerified: boolean;
    twoFactorEnabled: boolean | null;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
}
