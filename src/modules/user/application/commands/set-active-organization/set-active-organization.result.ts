export interface SetActiveOrganizationPayload {
  userId: string;
  organizationId: string;
  correlationId: string;
  onlyIfUnset?: boolean;
}

export interface SetActiveOrganizationResult {
  id: string;
  changed: boolean;
}
