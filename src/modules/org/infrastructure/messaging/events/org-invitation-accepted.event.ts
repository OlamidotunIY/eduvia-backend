export class OrganizationInvitationAcceptedEvent{
    static readonly eventName = 'OrganizationInvitationAcceptedEvent';

    constructor(
        public readonly payload: {
            invitationId: string,
            orgId: string,
            acceptedByUserId: string,
            role: string,
            subjects: string[]
        },
        public readonly correlationId: string,
    ){}
}