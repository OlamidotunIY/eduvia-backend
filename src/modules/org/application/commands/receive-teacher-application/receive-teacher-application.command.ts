import { Command } from '@nestjs/cqrs';
import { ReceiveTeacherApplicationResult } from './receive-teacher-application.result';

export class ReceiveTeacherApplicationCommand extends Command<ReceiveTeacherApplicationResult> {
  constructor(
    public readonly payload: {
      orgId: string;
      applicantUserId: string;
      appliedSubjects: string[];
      coverLetter?: string | null;
      qualifications?: string | null;
      correlationId: string;
    },
  ) {
    super();
  }
}