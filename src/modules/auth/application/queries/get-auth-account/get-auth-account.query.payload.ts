import { AuthStatus } from "../../../domain";


export interface AuthAccountDTO {
  id: string;
  userId: string | null;
  credentialHash: string;
  scope: string;
  totpEnabled: boolean;
  authStatus: AuthStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetAuthAccountPayload {
  authAccountId: string;
}
