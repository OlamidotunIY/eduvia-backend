import { AggregateRoot, BusinessRuleViolationError } from '@modules/shared/domain';
import {
  LessonReportId,
  ReportStatus,
  AttendanceStatus,
  AssessmentSummary,
  ReportCommentId,
  CommentAuthorRole,
} from '../value-objects';
import { ReportComment } from '../entities';
import {
  LessonReportCreatedEvent,
  ReportAiDraftReadyEvent,
  LessonReportSubmittedEvent,
  LessonReportArchivedEvent,
  ParentCommentAddedEvent,
} from '../events';
import {
  LessonReportArchivedError,
  LessonReportAlreadySubmittedError,
  LessonReportNotSubmittedError,
  InvalidReportSubmissionError,
} from '../errors';

export interface LessonReportProps {
  id: LessonReportId;
  lessonId: string;
  orgId: string;
  classroomId: string;
  teacherId: string;
  studentId: string;
  status: ReportStatus;
  topicNodeIds: string[];
  attendanceStatus: AttendanceStatus;
  teacherNarrative?: string | null;
  aiGeneratedSummary?: string | null;
  teacherApprovedAiSummary?: string | null;
  homeworkSet?: string | null;
  nextSteps?: string | null;
  overallRating?: number | null;
  parentCanView: boolean;
  assessmentSummary: AssessmentSummary;
  comments?: ReportComment[];
  submittedAt?: Date | null;
  archivedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class LessonReport extends AggregateRoot<LessonReportId> {
  private _lessonId: string;
  private _orgId: string;
  private _classroomId: string;
  private _teacherId: string;
  private _studentId: string;
  private _status: ReportStatus;
  private _topicNodeIds: string[];
  private _attendanceStatus: AttendanceStatus;
  private _teacherNarrative: string | null;
  private _aiGeneratedSummary: string | null;
  private _teacherApprovedAiSummary: string | null;
  private _homeworkSet: string | null;
  private _nextSteps: string | null;
  private _overallRating: number | null;
  private _parentCanView: boolean;
  private _assessmentSummary: AssessmentSummary;
  private _comments: ReportComment[];
  private _submittedAt: Date | null;
  private _archivedAt: Date | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  protected constructor(props: LessonReportProps) {
    super(props.id);
    this._lessonId = props.lessonId;
    this._orgId = props.orgId;
    this._classroomId = props.classroomId;
    this._teacherId = props.teacherId;
    this._studentId = props.studentId;
    this._status = props.status;
    this._topicNodeIds = [...props.topicNodeIds];
    this._attendanceStatus = props.attendanceStatus;
    this._teacherNarrative = props.teacherNarrative ?? null;
    this._aiGeneratedSummary = props.aiGeneratedSummary ?? null;
    this._teacherApprovedAiSummary = props.teacherApprovedAiSummary ?? null;
    this._homeworkSet = props.homeworkSet ?? null;
    this._nextSteps = props.nextSteps ?? null;
    this._overallRating = props.overallRating ?? null;
    this._parentCanView = props.parentCanView;
    this._assessmentSummary = props.assessmentSummary;
    this._comments = props.comments ? [...props.comments] : [];
    this._submittedAt = props.submittedAt ? new Date(props.submittedAt) : null;
    this._archivedAt = props.archivedAt ? new Date(props.archivedAt) : null;
    this._createdAt = new Date(props.createdAt);
    this._updatedAt = new Date(props.updatedAt);
  }

  public static create(
    props: {
      id?: LessonReportId;
      lessonId: string;
      orgId: string;
      classroomId: string;
      teacherId: string;
      studentId: string;
      topicNodeIds?: string[];
      attendanceStatus?: AttendanceStatus;
      teacherNarrative?: string | null;
      homeworkSet?: string | null;
      nextSteps?: string | null;
      overallRating?: number | null;
      assessmentSummary?: AssessmentSummary;
    },
    correlationId = 'system',
  ): LessonReport {
    const reportId = props.id ?? LessonReportId.create();
    const now = new Date();
    const assessmentSummary =
      props.assessmentSummary ??
      AssessmentSummary.create({
        totalQuestionsAttempted: 0,
        totalQuestionsCorrect: 0,
        totalMarksAwarded: null,
        totalMaxMarks: 0,
      });

    const report = new LessonReport({
      id: reportId,
      lessonId: props.lessonId,
      orgId: props.orgId,
      classroomId: props.classroomId,
      teacherId: props.teacherId,
      studentId: props.studentId,
      status: ReportStatus.draft,
      topicNodeIds: props.topicNodeIds ?? [],
      attendanceStatus: props.attendanceStatus ?? AttendanceStatus.attended,
      teacherNarrative: props.teacherNarrative ?? null,
      aiGeneratedSummary: null,
      teacherApprovedAiSummary: null,
      homeworkSet: props.homeworkSet ?? null,
      nextSteps: props.nextSteps ?? null,
      overallRating: props.overallRating ?? null,
      parentCanView: false,
      assessmentSummary,
      comments: [],
      submittedAt: null,
      archivedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    report.addDomainEvent(
      new LessonReportCreatedEvent(
        reportId.toString(),
        new LessonReportCreatedEvent.Payload(
          reportId.toString(),
          props.lessonId,
          props.orgId,
          props.classroomId,
          props.teacherId,
          props.studentId,
        ),
        correlationId,
      ),
    );

    return report;
  }

  public static reconstitute(props: LessonReportProps): LessonReport {
    return new LessonReport(props);
  }

  protected touch(): void {
    this._updatedAt = new Date();
  }

  public attachAiSummary(summary: string, correlationId = 'ai-worker'): void {
    this.ensureNotArchived();
    if (!summary || summary.trim().length === 0) {
      throw new BusinessRuleViolationError('AI summary content cannot be empty.');
    }

    this._aiGeneratedSummary = summary.trim();
    if (this._status === ReportStatus.draft) {
      this._status = ReportStatus.ai_draft;
    }
    this.touch();

    this.addDomainEvent(
      new ReportAiDraftReadyEvent(
        this.id.toString(),
        new ReportAiDraftReadyEvent.Payload(
          this.id.toString(),
          this._lessonId,
          this._teacherId,
          this._orgId,
        ),
        correlationId,
      ),
    );
  }

  public approveAiSummary(editedSummary?: string): void {
    this.ensureNotArchived();
    const summaryToApprove = editedSummary ?? this._aiGeneratedSummary;

    if (!summaryToApprove || summaryToApprove.trim().length === 0) {
      throw new BusinessRuleViolationError(
        'Cannot approve AI summary because no AI summary is present on this report.',
      );
    }

    this._teacherApprovedAiSummary = summaryToApprove.trim();
    if (this._status === ReportStatus.ai_draft || this._status === ReportStatus.draft) {
      this._status = ReportStatus.teacher_reviewing;
    }
    this.touch();
  }

  public updateNarrative(narrative: string): void {
    this.ensureNotArchived();
    this._teacherNarrative = narrative.trim();
    if (this._status === ReportStatus.draft || this._status === ReportStatus.ai_draft) {
      this._status = ReportStatus.teacher_reviewing;
    }
    this.touch();
  }

  public updateDetails(params: {
    topicNodeIds?: string[];
    attendanceStatus?: AttendanceStatus;
    homeworkSet?: string | null;
    nextSteps?: string | null;
    overallRating?: number | null;
  }): void {
    this.ensureNotArchived();

    if (params.topicNodeIds !== undefined) {
      this._topicNodeIds = [...params.topicNodeIds];
    }
    if (params.attendanceStatus !== undefined) {
      this._attendanceStatus = params.attendanceStatus;
    }
    if (params.homeworkSet !== undefined) {
      this._homeworkSet = params.homeworkSet;
    }
    if (params.nextSteps !== undefined) {
      this._nextSteps = params.nextSteps;
    }
    if (params.overallRating !== undefined) {
      if (
        params.overallRating !== null &&
        (params.overallRating < 1 || params.overallRating > 5)
      ) {
        throw new BusinessRuleViolationError('Overall rating must be between 1 and 5.');
      }
      this._overallRating = params.overallRating;
    }

    this.touch();
  }

  public submit(correlationId = 'teacher'): void {
    this.ensureNotArchived();
    if (this._status === ReportStatus.submitted) {
      throw new LessonReportAlreadySubmittedError(this.id.toString());
    }

    const hasNarrative = Boolean(this._teacherNarrative && this._teacherNarrative.trim().length > 0);
    const hasAiSummary = Boolean(
      (this._teacherApprovedAiSummary && this._teacherApprovedAiSummary.trim().length > 0) ||
      (this._aiGeneratedSummary && this._aiGeneratedSummary.trim().length > 0),
    );

    if (!hasNarrative && !hasAiSummary) {
      throw new InvalidReportSubmissionError(this.id.toString());
    }

    this._status = ReportStatus.submitted;
    this._parentCanView = true;
    this._submittedAt = new Date();
    this.touch();

    this.addDomainEvent(
      new LessonReportSubmittedEvent(
        this.id.toString(),
        new LessonReportSubmittedEvent.Payload(
          this.id.toString(),
          this._lessonId,
          this._studentId,
          this._orgId,
          this._teacherId,
          this._submittedAt,
        ),
        correlationId,
      ),
    );
  }

  public archive(correlationId = 'cron'): void {
    if (this._status === ReportStatus.archived) {
      return;
    }
    if (this._status !== ReportStatus.submitted) {
      throw new LessonReportNotSubmittedError(this.id.toString(), 'archive');
    }

    this._status = ReportStatus.archived;
    this._archivedAt = new Date();
    this.touch();

    this.addDomainEvent(
      new LessonReportArchivedEvent(
        this.id.toString(),
        new LessonReportArchivedEvent.Payload(
          this.id.toString(),
          this._orgId,
          this._archivedAt,
        ),
        correlationId,
      ),
    );
  }

  public addParentComment(
    props: {
      commentId?: ReportCommentId;
      authorId: string;
      authorRole: CommentAuthorRole;
      content: string;
      parentCommentId?: string | null;
    },
    correlationId = 'system',
  ): ReportComment {
    if (this._status !== ReportStatus.submitted && !this._parentCanView) {
      throw new LessonReportNotSubmittedError(this.id.toString(), 'addComment');
    }

    const comment = ReportComment.create({
      id: props.commentId,
      reportId: this.id.toString(),
      authorId: props.authorId,
      authorRole: props.authorRole,
      content: props.content,
      parentCommentId: props.parentCommentId,
    });

    this._comments.push(comment);
    this.touch();

    this.addDomainEvent(
      new ParentCommentAddedEvent(
        this.id.toString(),
        new ParentCommentAddedEvent.Payload(
          this.id.toString(),
          comment.id.toString(),
          props.authorId,
          props.authorRole,
          this._orgId,
        ),
        correlationId,
      ),
    );

    return comment;
  }

  public addAdminReply(
    props: {
      commentId?: ReportCommentId;
      authorId: string;
      content: string;
      parentCommentId: string;
    },
    correlationId = 'admin',
  ): ReportComment {
    return this.addParentComment(
      {
        commentId: props.commentId,
        authorId: props.authorId,
        authorRole: CommentAuthorRole.admin,
        content: props.content,
        parentCommentId: props.parentCommentId,
      },
      correlationId,
    );
  }

  private ensureNotArchived(): void {
    if (this._status === ReportStatus.archived) {
      throw new LessonReportArchivedError(this.id.toString());
    }
  }

  public get lessonId(): string {
    return this._lessonId;
  }

  public get orgId(): string {
    return this._orgId;
  }

  public get classroomId(): string {
    return this._classroomId;
  }

  public get teacherId(): string {
    return this._teacherId;
  }

  public get studentId(): string {
    return this._studentId;
  }

  public get status(): ReportStatus {
    return this._status;
  }

  public get topicNodeIds(): readonly string[] {
    return this._topicNodeIds;
  }

  public get attendanceStatus(): AttendanceStatus {
    return this._attendanceStatus;
  }

  public get teacherNarrative(): string | null {
    return this._teacherNarrative;
  }

  public get aiGeneratedSummary(): string | null {
    return this._aiGeneratedSummary;
  }

  public get teacherApprovedAiSummary(): string | null {
    return this._teacherApprovedAiSummary;
  }

  public get homeworkSet(): string | null {
    return this._homeworkSet;
  }

  public get nextSteps(): string | null {
    return this._nextSteps;
  }

  public get overallRating(): number | null {
    return this._overallRating;
  }

  public get parentCanView(): boolean {
    return this._parentCanView;
  }

  public get assessmentSummary(): AssessmentSummary {
    return this._assessmentSummary;
  }

  public get comments(): readonly ReportComment[] {
    return this._comments;
  }

  public get submittedAt(): Date | null {
    return this._submittedAt ? new Date(this._submittedAt) : null;
  }

  public get archivedAt(): Date | null {
    return this._archivedAt ? new Date(this._archivedAt) : null;
  }

  public get createdAt(): Date {
    return new Date(this._createdAt);
  }

  public get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
}
