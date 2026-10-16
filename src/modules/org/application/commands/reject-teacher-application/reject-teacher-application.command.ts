import { Command } from '@nestjs/cqrs';
import { RejectTeacherApplicationResult } from './reject-teacher-application.result';

export class RejectTeacherApplicationCommand extends Command<RejectTeacherApplicationResult> {
  constructor(
    public readonly payload: {
      applicationId: string;
      orgId: string;
      reviewerUserId: string;
      reason: string | null;
      correlationId: string;
    },
  ) {
    super();
  }
}
