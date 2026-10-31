export interface SetActiveOrganizationPayload {
  userId: string;
  organizationId: string;
  correlationId: string;
}

export interface SetActiveOrganizationResult {
  id: string;
}
