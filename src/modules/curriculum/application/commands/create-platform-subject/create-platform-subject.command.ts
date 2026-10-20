export interface CreatePlatformSubjectPayload {
  name: string;
  shortCode: string;
  description?: string | null;
  isActive?: boolean;
}

export class CreatePlatformSubjectCommand {
  constructor(public readonly payload: CreatePlatformSubjectPayload) {}
}
