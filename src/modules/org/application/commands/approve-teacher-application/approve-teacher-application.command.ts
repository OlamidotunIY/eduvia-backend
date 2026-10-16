import { Command } from '@nestjs/cqrs';
import { ApproveTeacherApplicationResult } from './approve-teacher-application.result';

export class ApproveTeacherApplicationCommand extends Command<ApproveTeacherApplicationResult> {
  constructor(
    public readonly payload: {
      applicationId: string;
      orgId: string;
      reviewerUserId: string;
      correlationId: string;
    },
  ) {
    super();
  }
}
