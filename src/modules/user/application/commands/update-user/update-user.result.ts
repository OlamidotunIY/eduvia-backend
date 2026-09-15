export interface UpdateUserPayload {
    userId: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    correlationId: string;
}

export interface UpdateUserResult{
    id: string
}
