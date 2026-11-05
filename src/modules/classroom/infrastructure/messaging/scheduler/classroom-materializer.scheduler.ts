import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IClassroomRepository } from '../../../domain';
import { ClassroomLessonMaterializer } from '../../../application/services/classroom-lesson-materializer.service';

@Injectable()
export class ClassroomMaterializerScheduler {
  private readonly logger = new Logger(ClassroomMaterializerScheduler.name);
  private isRunning = false;

  constructor(
    private readonly classroomRepository: IClassroomRepository,
    private readonly materializer: ClassroomLessonMaterializer,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async fillActiveClassroomHorizons(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      const activeClassrooms = await this.classroomRepository.findActive();
      for (const classroom of activeClassrooms) {
        try {
          await this.materializer.materializeClassroom(classroom, {
            horizonWeeks: 8,
          });
        } catch (error) {
          this.logger.error(
            `Failed to materialize occurrences for classroom ${classroom.id.value}: ${(error as Error).message}`,
            error,
          );
        }
      }
    } catch (err) {
      this.logger.error('Failed to run classroom materializer scheduler', err);
    } finally {
      this.isRunning = false;
    }
  }
}
