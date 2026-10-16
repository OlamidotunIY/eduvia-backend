import { InvitationRole } from '../../domain';

export class SendInvitationDTO {
  inviteeEmail!: string;
  role!: InvitationRole;
  subjects?: string[];
}
