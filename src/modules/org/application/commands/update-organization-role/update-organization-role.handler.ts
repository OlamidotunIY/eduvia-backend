import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IOrganizationAuthorizationQueryPort } from '@modules/shared';
import {
  IOrganizationRoleRepository,
  OrganizationInvariantError,
  OrganizationRoleId,
  OrganizationPermission,
} from '../../../domain';
import { UpdateOrganizationRoleCommand } from './update-organization-role.command';

@CommandHandler(UpdateOrganizationRoleCommand)
export class UpdateOrganizationRoleHandler
  implements ICommandHandler<UpdateOrganizationRoleCommand, void>
{
  constructor(
    private readonly authorizationQuery: IOrganizationAuthorizationQueryPort,
    private readonly roleRepository: IOrganizationRoleRepository,
  ) {}

  async execute(command: UpdateOrganizationRoleCommand): Promise<void> {
    const { payload } = command;
    const authorization = await this.authorizationQuery.getEffectiveAuthorization(
      payload.orgId,
      payload.callerUserId,
    );
    if (!authorization?.isActive || !authorization.permissions.includes(OrganizationPermission.ROLES_MANAGE)) {
      throw new OrganizationInvariantError('Caller cannot manage organization roles');
    }
    const role = await this.roleRepository.findById(OrganizationRoleId.from(payload.roleId));
    if (!role || role.orgId.value !== payload.orgId) {
      throw new OrganizationInvariantError('Organization role was not found');
    }
    const duplicate = await this.roleRepository.findByOrgIdAndName(payload.orgId, payload.name.trim());
    if (duplicate && duplicate.getId() !== role.getId()) {
      throw new OrganizationInvariantError('An organization role with this name already exists');
    }
    role.rename(payload.name, payload.description);
    role.updatePermissions(payload.permissions);
    await this.roleRepository.save(role);
  }
}
