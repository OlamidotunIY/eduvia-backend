export class TeacherApplicationReceivedEvent{
    static readonly eventName = 'TeacherApplicationReceivedEvent';

    constructor(
        public readonly payload: {
            applicationId: string,
            orgId: string,
            applicantUserId: string,
            appliedSubjects: string[]
        },
        public readonly correlationId: string,
    ){}
}