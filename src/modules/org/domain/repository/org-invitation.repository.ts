import { BaseRepository } from '@modules/shared';
import { OrganizationInvitation } from '../entities/ord-invitation.entity';
import { OrganizationInvitationId } from '../value-objects';

export abstract class IOrganizationInvitationRepository extends BaseRepository<OrganizationInvitation, OrganizationInvitationId> {}