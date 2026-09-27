export class TeacherApplicationApprovedEvent{
    static readonly eventName = 'TeacherApplicationApprovedEvent';

    constructor (
        public readonly payload: {
            applicationId: string,
            orgId: string,
            applicantUserId: string,
            approvedSubjects: string[],
        }
    ){}
}