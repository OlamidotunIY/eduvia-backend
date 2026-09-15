import { AuthStatus } from "../../../domain";


export interface AuthAccountDTO {
  id: number;
  userId: number;
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
