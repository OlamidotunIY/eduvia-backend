import {
  LessonReport,
  ReportStatus,
  CommentAuthorRole,
  InvalidReportSubmissionError,
  LessonReportNotSubmittedError,
  UnauthorizedCommentAuthorError,
} from '../domain';

describe('LessonReport Aggregate Root', () => {
  const defaultParams = {
    lessonId: '018f9210-9c24-7123-8345-abcdef123456',
    orgId: '018f9210-9c24-7123-8345-abcdef123457',
    classroomId: '018f9210-9c24-7123-8345-abcdef123458',
    teacherId: '018f9210-9c24-7123-8345-abcdef123459',
    studentId: '018f9210-9c24-7123-8345-abcdef123450',
    topicNodeIds: ['node-1', 'node-2'],
  };

  it('should initialize a lesson report in draft status with parentCanView=false', () => {
    const report = LessonReport.create(defaultParams);

    expect(report.id).toBeDefined();
    expect(report.lessonId).toBe(defaultParams.lessonId);
    expect(report.status).toBe(ReportStatus.draft);
    expect(report.parentCanView).toBe(false);
    expect(report.topicNodeIds).toEqual(['node-1', 'node-2']);
    expect(report.comments.length).toBe(0);

    const events = report.pullDomainEvents();
    expect(events.length).toBe(1);
    expect(events[0].eventName).toBe('LessonReportCreatedEvent');
  });

  it('should transition to ai_draft when attachAiSummary is called', () => {
    const report = LessonReport.create(defaultParams);
    report.pullDomainEvents();

    report.attachAiSummary('AI generated draft summary of lesson');

    expect(report.status).toBe(ReportStatus.ai_draft);
    expect(report.aiGeneratedSummary).toBe('AI generated draft summary of lesson');

    const events = report.pullDomainEvents();
    expect(events.length).toBe(1);
    expect(events[0].eventName).toBe('ReportAiDraftReadyEvent');
  });

  it('should allow teacher to approve AI summary with optional edits', () => {
    const report = LessonReport.create(defaultParams);
    report.attachAiSummary('Initial draft');

    report.approveAiSummary('Teacher edited and approved summary');

    expect(report.teacherApprovedAiSummary).toBe('Teacher edited and approved summary');
    expect(report.status).toBe(ReportStatus.teacher_reviewing);
  });

  it('should reject submission if neither narrative nor AI summary is present', () => {
    const report = LessonReport.create(defaultParams);

    expect(() => report.submit()).toThrow(InvalidReportSubmissionError);
  });

  it('should submit successfully when narrative is present and set parentCanView=true', () => {
    const report = LessonReport.create(defaultParams);
    report.updateNarrative('Student did very well today on quadratic equations.');
    report.pullDomainEvents();

    report.submit();

    expect(report.status).toBe(ReportStatus.submitted);
    expect(report.parentCanView).toBe(true);
    expect(report.submittedAt).toBeDefined();

    const events = report.pullDomainEvents();
    expect(events.length).toBe(1);
    expect(events[0].eventName).toBe('LessonReportSubmittedEvent');
  });

  it('should forbid parent comments on unsubmitted reports', () => {
    const report = LessonReport.create(defaultParams);

    expect(() =>
      report.addParentComment({
        authorId: 'parent-1',
        authorRole: CommentAuthorRole.parent,
        content: 'Thank you for the lesson!',
      }),
    ).toThrow(LessonReportNotSubmittedError);
  });

  it('should allow parent and admin comments once submitted and emit event', () => {
    const report = LessonReport.create(defaultParams);
    report.updateNarrative('Great session today.');
    report.submit();
    report.pullDomainEvents();

    const comment = report.addParentComment({
      authorId: 'parent-1',
      authorRole: CommentAuthorRole.parent,
      content: 'How can we help her practice at home?',
    });

    expect(report.comments.length).toBe(1);
    expect(comment.content).toBe('How can we help her practice at home?');

    const events = report.pullDomainEvents();
    expect(events.length).toBe(1);
    expect(events[0].eventName).toBe('ParentCommentAddedEvent');
  });

  it('should reject comments with unauthorized author role', () => {
    const report = LessonReport.create(defaultParams);
    report.updateNarrative('Great session.');
    report.submit();

    expect(() =>
      report.addParentComment({
        authorId: 'teacher-1',
        authorRole: 'teacher' as any,
        content: 'Direct teacher comment',
      }),
    ).toThrow(UnauthorizedCommentAuthorError);
  });

  it('should archive submitted report and emit LessonReportArchivedEvent', () => {
    const report = LessonReport.create(defaultParams);
    report.updateNarrative('Lesson was completed.');
    report.submit();
    report.pullDomainEvents();

    report.archive();

    expect(report.status).toBe(ReportStatus.archived);
    expect(report.archivedAt).toBeDefined();

    const events = report.pullDomainEvents();
    expect(events.length).toBe(1);
    expect(events[0].eventName).toBe('LessonReportArchivedEvent');
  });
});
