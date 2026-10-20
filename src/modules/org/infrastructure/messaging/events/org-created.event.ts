export class OrganizationCreatedEvent{
    static readonly eventName = 'OrganizationCreatedEvent';

    constructor(
        public readonly payload: {
            organizationId: string,
            ownerId: string,
            name: string,
            slug: string,
            contactEmail: string,
            country: string,
            timezone: string
        },
        public readonly correlationId: string,
    ){}
}