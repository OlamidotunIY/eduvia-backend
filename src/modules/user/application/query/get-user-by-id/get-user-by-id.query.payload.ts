import { UserStatus } from "../../../domain/value-objects/user-status.v0";
import { UserType } from "../../../domain/value-objects/user-type.v0";

export interface GetUserByIdPayload {
    userId: number
}

export interface UserDTO {
    id: number;
    userType: UserType;
    firstName: string;
    lastName: string;
    email: string;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
}