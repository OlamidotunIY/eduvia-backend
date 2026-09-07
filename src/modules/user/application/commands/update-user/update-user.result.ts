export interface UpdateUserPayload {
    userId: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    correlationId: string;
}

export interface UpdateUserResult{
    id: number
}