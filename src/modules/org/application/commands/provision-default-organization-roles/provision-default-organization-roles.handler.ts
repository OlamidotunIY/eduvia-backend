import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  IOrganizationRoleRepository,
  OrganizationId,
  OrganizationAccessRole,
  OrganizationRoleId,
  ORGANIZATION_ROLE_DEFAULTS,
} from '../../../domain';
import { ProvisionDefaultOrganizationRolesCommand } from './provision-default-organization-roles.command';

@CommandHandler(ProvisionDefaultOrganizationRolesCommand)
export class ProvisionDefaultOrganizationRolesHandler
  implements ICommandHandler<ProvisionDefaultOrganizationRolesCommand, string[]>
{
  constructor(private readonly roleRepository: IOrganizationRoleRepository) {}

  async execute(command: ProvisionDefaultOrganizationRolesCommand): Promise<string[]> {
    const orgId = OrganizationId.from(command.payload.orgId);
    const roles = await Promise.all(
      ORGANIZATION_ROLE_DEFAULTS.map(async (definition) => {
        const existing = await this.roleRepository.findByOrgIdAndKey(orgId, definition.key);
        if (existing) return existing;

        const role = OrganizationAccessRole.create({
          id: OrganizationRoleId.create(),
          orgId,
          key: definition.key,
          name: definition.name,
          description: definition.description,
          permissions: definition.permissions,
          isSystem: true,
          correlationId: command.payload.correlationId,
        });
        await this.roleRepository.save(role);
        return role;
      }),
    );
    return roles.map((role) => role.getId());
  }
}
