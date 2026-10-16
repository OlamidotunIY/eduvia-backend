import { AggregateRoot } from '@modules/shared';
import {
  LearningBoardId,
  BoardMode,
  LessonPlan,
  LessonPlanProps,
  SectionType,
  QuestionMode,
} from '../value-objects';
import { BoardSection } from '../entities/board-section.entity';
import { BoardQuestion } from '../entities/board-question.entity';
import {
  BoardCreatedEvent,
  BoardModeChangedEvent,
  BoardLockedEvent,
  BoardUnlockedEvent,
  QuestionAttachedToBoardEvent,
  QuestionRemovedFromBoardEvent,
  BoardSectionAddedEvent,
  BoardSectionUpdatedEvent,
  BoardSectionRemovedEvent,
  LessonPlanCompletedEvent,
} from '../events';
import {
  BoardLockedError,
  InvalidBoardModeTransitionError,
  BoardSectionNotFoundError,
  BoardQuestionNotFoundError,
} from '../errors';

export interface LearningBoardProps {
  id: LearningBoardId;
  lessonId: string;
  orgId: string;
  mode: BoardMode;
  plan: LessonPlan;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  sections?: BoardSection[];
  questions?: BoardQuestion[];
}

export class LearningBoard extends AggregateRoot<LearningBoardId> {
  private _lessonId: string;
  private _orgId: string;
  private _mode: BoardMode;
  private _plan: LessonPlan;
  private _isLocked: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _sections: BoardSection[];
  private _questions: BoardQuestion[];

  protected constructor(props: LearningBoardProps) {
    super(props.id);
    this._lessonId = props.lessonId;
    this._orgId = props.orgId;
    this._mode = props.mode;
    this._plan = props.plan;
    this._isLocked = props.isLocked;
    this._createdAt = new Date(props.createdAt);
    this._updatedAt = new Date(props.updatedAt);
    this._sections = props.sections ? [...props.sections] : [];
    this._questions = props.questions ? [...props.questions] : [];
  }

  public static create(
    props: {
      lessonId: string;
      orgId: string;
      plan?: LessonPlanProps;
    },
    correlationId: string,
  ): LearningBoard {
    const id = LearningBoardId.create();
    const now = new Date();
    const plan = LessonPlan.create(props.plan);

    const board = new LearningBoard({
      id,
      lessonId: props.lessonId,
      orgId: props.orgId,
      mode: BoardMode.teach,
      plan,
      isLocked: false,
      createdAt: now,
      updatedAt: now,
      sections: [],
      questions: [],
    });

    board.addDomainEvent(
      new BoardCreatedEvent(
        id.unpack(),
        new BoardCreatedEvent.Payload(id.unpack(), props.lessonId, props.orgId),
        correlationId,
      ),
    );

    return board;
  }

  public static reconstitute(props: LearningBoardProps): LearningBoard {
    return new LearningBoard(props);
  }

  public get lessonId(): string {
    return this._lessonId;
  }

  public get orgId(): string {
    return this._orgId;
  }

  public get mode(): BoardMode {
    return this._mode;
  }

  public get plan(): LessonPlan {
    return this._plan;
  }

  public get isLocked(): boolean {
    return this._isLocked;
  }

  public get createdAt(): Date {
    return new Date(this._createdAt);
  }

  public get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  public get sections(): BoardSection[] {
    return [...this._sections].sort((a, b) => a.position - b.position);
  }

  public get questions(): BoardQuestion[] {
    return [...this._questions].sort((a, b) => a.position - b.position);
  }

  public switchMode(
    newMode: BoardMode,
    changedBy: string,
    correlationId: string,
    lessonStatus?: string,
  ): void {
    const currentMode = this._mode;
    if (currentMode === newMode) return;

    if (newMode === BoardMode.assignment) {
      if (lessonStatus && lessonStatus.toLowerCase() !== 'completed') {
        throw new InvalidBoardModeTransitionError(
          currentMode,
          newMode,
          'Assignment mode can only be set after the lesson is COMPLETED.',
        );
      }
    }

    const allowedTransitions: Record<BoardMode, BoardMode[]> = {
      [BoardMode.teach]: [BoardMode.classwork, BoardMode.locked, BoardMode.review],
      [BoardMode.classwork]: [BoardMode.teach, BoardMode.assignment, BoardMode.locked, BoardMode.review],
      [BoardMode.assignment]: [BoardMode.review, BoardMode.teach],
      [BoardMode.locked]: [BoardMode.teach, BoardMode.review],
      [BoardMode.review]: [BoardMode.teach, BoardMode.classwork, BoardMode.assignment],
    };

    const allowed = allowedTransitions[currentMode] || [];
    if (!allowed.includes(newMode)) {
      throw new InvalidBoardModeTransitionError(currentMode, newMode);
    }

    this._mode = newMode;
    this._isLocked = newMode === BoardMode.locked;
    this._updatedAt = new Date();

    this.addDomainEvent(
      new BoardModeChangedEvent(
        this.id.unpack(),
        new BoardModeChangedEvent.Payload(
          this.id.unpack(),
          currentMode,
          newMode,
          changedBy,
        ),
        correlationId,
      ),
    );
  }

  public lock(lockedBy: string, correlationId: string): void {
    if (this._isLocked) return;
    this._isLocked = true;
    this._mode = BoardMode.locked;
    this._updatedAt = new Date();

    this.addDomainEvent(
      new BoardLockedEvent(
        this.id.unpack(),
        new BoardLockedEvent.Payload(this.id.unpack(), lockedBy),
        correlationId,
      ),
    );
  }

  public unlock(unlockedBy: string, correlationId: string): void {
    if (!this._isLocked) return;
    this._isLocked = false;
    this._mode = BoardMode.teach;
    this._updatedAt = new Date();

    this.addDomainEvent(
      new BoardUnlockedEvent(
        this.id.unpack(),
        new BoardUnlockedEvent.Payload(this.id.unpack(), unlockedBy),
        correlationId,
      ),
    );
  }

  public addSection(
    props: {
      type: SectionType;
      content: string;
      position?: number;
      createdBy: string;
      isTeacherOnly?: boolean;
    },
    correlationId: string,
  ): BoardSection {
    if (this._isLocked) {
      throw new BoardLockedError();
    }

    const pos = props.position ?? this._sections.length;
    const section = BoardSection.create({
      boardId: this.id.unpack(),
      type: props.type,
      content: props.content,
      position: pos,
      createdBy: props.createdBy,
      isTeacherOnly: props.isTeacherOnly,
    });

    this._sections.push(section);
    this._updatedAt = new Date();

    this.addDomainEvent(
      new BoardSectionAddedEvent(
        this.id.unpack(),
        new BoardSectionAddedEvent.Payload(
          this.id.unpack(),
          section.id.unpack(),
          section.type,
          section.position,
          section.createdBy,
        ),
        correlationId,
      ),
    );

    return section;
  }

  public updateSection(
    sectionId: string,
    content: string,
    correlationId: string,
  ): void {
    if (this._isLocked) {
      throw new BoardLockedError();
    }

    const section = this._sections.find((s) => s.id.unpack() === sectionId);
    if (!section) {
      throw new BoardSectionNotFoundError({ sectionId, boardId: this.id.unpack() });
    }

    section.updateContent(content);
    this._updatedAt = new Date();

    this.addDomainEvent(
      new BoardSectionUpdatedEvent(
        this.id.unpack(),
        new BoardSectionUpdatedEvent.Payload(
          this.id.unpack(),
          sectionId,
          content,
        ),
        correlationId,
      ),
    );
  }

  public removeSection(sectionId: string, correlationId: string): void {
    if (this._isLocked) {
      throw new BoardLockedError();
    }

    const idx = this._sections.findIndex((s) => s.id.unpack() === sectionId);
    if (idx === -1) {
      throw new BoardSectionNotFoundError({ sectionId, boardId: this.id.unpack() });
    }

    this._sections.splice(idx, 1);
    this._updatedAt = new Date();

    this.addDomainEvent(
      new BoardSectionRemovedEvent(
        this.id.unpack(),
        new BoardSectionRemovedEvent.Payload(this.id.unpack(), sectionId),
        correlationId,
      ),
    );
  }

  public attachQuestion(
    props: {
      questionId: string;
      position?: number;
      mode?: QuestionMode;
      maxMarks: number;
      showOptions?: boolean;
      dueAt?: Date | null;
    },
    correlationId: string,
  ): BoardQuestion {
    if (this._isLocked) {
      throw new BoardLockedError();
    }

    const pos = props.position ?? this._questions.length;
    const qMode = props.mode ?? (this._mode === BoardMode.assignment ? QuestionMode.assignment : QuestionMode.classwork);

    const question = BoardQuestion.create({
      boardId: this.id.unpack(),
      questionId: props.questionId,
      position: pos,
      mode: qMode,
      maxMarks: props.maxMarks,
      showOptions: props.showOptions,
      dueAt: props.dueAt,
    });

    this._questions.push(question);
    this._updatedAt = new Date();

    this.addDomainEvent(
      new QuestionAttachedToBoardEvent(
        this.id.unpack(),
        new QuestionAttachedToBoardEvent.Payload(
          this.id.unpack(),
          question.id.unpack(),
          question.questionId,
          question.mode,
          question.position,
        ),
        correlationId,
      ),
    );

    return question;
  }

  public removeQuestion(boardQuestionId: string, correlationId: string): void {
    if (this._isLocked) {
      throw new BoardLockedError();
    }

    const idx = this._questions.findIndex((q) => q.id.unpack() === boardQuestionId);
    if (idx === -1) {
      throw new BoardQuestionNotFoundError({ boardQuestionId, boardId: this.id.unpack() });
    }

    const question = this._questions[idx];
    this._questions.splice(idx, 1);
    this._updatedAt = new Date();

    this.addDomainEvent(
      new QuestionRemovedFromBoardEvent(
        this.id.unpack(),
        new QuestionRemovedFromBoardEvent.Payload(
          this.id.unpack(),
          boardQuestionId,
          question.questionId,
        ),
        correlationId,
      ),
    );
  }

  public importFromBoard(sourceSections: BoardSection[], importedBy: string, correlationId: string): void {
    if (this._isLocked) {
      throw new BoardLockedError();
    }

    let nextPos = this._sections.length;
    for (const source of sourceSections) {
      this.addSection(
        {
          type: source.type,
          content: source.content,
          position: nextPos++,
          createdBy: importedBy,
          isTeacherOnly: source.isTeacherOnly,
        },
        correlationId,
      );
    }
  }

  public updatePlan(props: Partial<LessonPlanProps>): void {
    this._plan = this._plan.update(props);
    this._updatedAt = new Date();
  }

  public completePlan(correlationId: string): void {
    this._plan = this._plan.complete();
    this._updatedAt = new Date();

    this.addDomainEvent(
      new LessonPlanCompletedEvent(
        this.id.unpack(),
        new LessonPlanCompletedEvent.Payload(
          this.id.unpack(),
          this._lessonId,
          this._orgId,
        ),
        correlationId,
      ),
    );
  }
}
