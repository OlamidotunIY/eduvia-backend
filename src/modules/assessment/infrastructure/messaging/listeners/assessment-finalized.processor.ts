import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import {
  IMasteryRecordRepository,
  MasteryRecord,
} from '../../../domain';

@Processor('progress-events')
export class AssessmentFinalizedProcessor extends WorkerHost {
  constructor(
    private readonly masteryRecordRepository: IMasteryRecordRepository,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<void> {
    if (job.name === 'AssessmentFinalizedEvent') {
      const payload = job.data.payload;
      const { studentId, scorePercent, curriculumNodeId } = payload;

      if (!curriculumNodeId) return;

      const orgId = payload.orgId ?? 'default-org';
      let record = await this.masteryRecordRepository.findByStudentAndNode(
        studentId,
        curriculumNodeId,
        orgId,
      );

      if (!record) {
        record = MasteryRecord.create(
          {
            studentId,
            curriculumNodeId,
            orgId,
          },
          job.data.correlationId,
        );
      }

      record.updateFromAssessment(
        scorePercent,
        payload.lessonId,
        job.data.correlationId,
      );
      await this.masteryRecordRepository.save(record);
    }
  }
}
