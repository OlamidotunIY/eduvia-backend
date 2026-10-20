import { BaseEntityId } from '@modules/shared/domain';

export class LessonReportId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): LessonReportId {
    return new LessonReportId(this.nextValue());
  }

  public static from(value: string): LessonReportId {
    return new LessonReportId(value);
  }
}
