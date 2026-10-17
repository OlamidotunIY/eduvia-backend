import { BaseEntityId } from '@modules/shared';

export class ReportCommentId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): ReportCommentId {
    return new ReportCommentId(this.nextValue());
  }

  public static from(value: string): ReportCommentId {
    return new ReportCommentId(value);
  }
}
