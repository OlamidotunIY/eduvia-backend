export class GetOrganizationPermissionsQuery {
  constructor(
    public readonly orgId: string,
    public readonly callerUserId: string,
  ) {}
}
