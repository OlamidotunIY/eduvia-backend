import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IOrganizationAuthorizationQueryPort } from '@modules/shared';
import {
  IOrganizationRoleRepository,
  OrganizationId,
  OrganizationInvariantError,
  OrganizationAccessRole,
  OrganizationPermission,
  OrganizationRoleId,
} from '../../../domain';
import { CreateOrganizationRoleCommand } from './create-organization-role.command';

@CommandHandler(CreateOrganizationRoleCommand)
export class CreateOrganizationRoleHandler
  implements ICommandHandler<CreateOrganizationRoleCommand, { id: string }>
{
  constructor(
    private readonly authorizationQuery: IOrganizationAuthorizationQueryPort,
    private readonly roleRepository: IOrganizationRoleRepository,
  ) {}

  async execute(command: CreateOrganizationRoleCommand): Promise<{ id: string }> {
    const { payload } = command;
    const authorization = await this.authorizationQuery.getEffectiveAuthorization(
      payload.orgId,
      payload.callerUserId,
    );
    if (!authorization?.isActive || !authorization.permissions.includes(OrganizationPermission.ROLES_MANAGE)) {
      throw new OrganizationInvariantError('Caller cannot manage organization roles');
    }
    if (await this.roleRepository.findByOrgIdAndName(payload.orgId, payload.name.trim())) {
      throw new OrganizationInvariantError('An organization role with this name already exists');
    }

    const role = OrganizationAccessRole.create({
      id: OrganizationRoleId.create(),
      orgId: OrganizationId.from(payload.orgId),
      key: null,
      name: payload.name,
      description: payload.description,
      permissions: payload.permissions,
      isSystem: false,
      correlationId: 'organization-role-created',
    });
    await this.roleRepository.save(role);
    return { id: role.getId() };
  }
}
