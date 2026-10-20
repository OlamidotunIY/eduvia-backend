import { AggregateRoot } from '@modules/shared';
import {
  QuestionId,
  QuestionOwnerType,
  QuestionType,
  QuestionProvenance,
} from '../value-objects';
import { QuestionOptionEntity } from '../entities/question-option.entity';
import {
  QuestionCreatedEvent,
  QuestionPublishedEvent,
} from '../events';
import {
  InvalidMcqOptionsError,
  InvalidQuestionTypeError,
  QuestionAlreadyPublishedError,
  QuestionCannotBeDeletedError,
  InsufficientQuestionPermissionError,
} from '../errors';

export interface QuestionProps {
  id: QuestionId;
  ownerType: QuestionOwnerType;
  ownerId?: string | null;
  orgId?: string | null;
  type: QuestionType;
  stem: string;
  options?: QuestionOptionEntity[];
  correctOptionKey?: string | null;
  markScheme?: string | null;
  maxMarks: number;
  difficultyLevel: number;
  subject: string;
  curriculumNodeId?: string | null;
  examBoard?: string | null;
  yearGroup?: string | null;
  tags?: string[];
  provenance: QuestionProvenance;
  isPublished: boolean;
  usageCount: number;
  avgScore?: number | null;
  correctRate?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Question extends AggregateRoot<QuestionId> {
  private _ownerType: QuestionOwnerType;
  private _ownerId: string | null;
  private _orgId: string | null;
  private _type: QuestionType;
  private _stem: string;
  private _options: QuestionOptionEntity[];
  private _correctOptionKey: string | null;
  private _markScheme: string | null;
  private _maxMarks: number;
  private _difficultyLevel: number;
  private _subject: string;
  private _curriculumNodeId: string | null;
  private _examBoard: string | null;
  private _yearGroup: string | null;
  private _tags: string[];
  private _provenance: QuestionProvenance;
  private _isPublished: boolean;
  private _usageCount: number;
  private _avgScore: number | null;
  private _correctRate: number | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  protected constructor(props: QuestionProps) {
    super(props.id);
    this._ownerType = props.ownerType;
    this._ownerId = props.ownerId ?? null;
    this._orgId = props.orgId ?? null;
    this._type = props.type;
    this._stem = props.stem;
    this._options = props.options ? [...props.options] : [];
    this._correctOptionKey = props.correctOptionKey ?? null;
    this._markScheme = props.markScheme ?? null;
    this._maxMarks = props.maxMarks;
    this._difficultyLevel = Math.min(5, Math.max(1, props.difficultyLevel));
    this._subject = props.subject;
    this._curriculumNodeId = props.curriculumNodeId ?? null;
    this._examBoard = props.examBoard ?? null;
    this._yearGroup = props.yearGroup ?? null;
    this._tags = props.tags ? [...props.tags] : [];
    this._provenance = props.provenance;
    this._isPublished = props.isPublished;
    this._usageCount = props.usageCount;
    this._avgScore = props.avgScore ?? null;
    this._correctRate = props.correctRate ?? null;
    this._createdAt = new Date(props.createdAt);
    this._updatedAt = new Date(props.updatedAt);
  }

  public static create(
    props: {
      id?: QuestionId;
      ownerType: QuestionOwnerType;
      ownerId?: string | null;
      orgId?: string | null;
      type: QuestionType;
      stem: string;
      options?: Array<{ key: string; text: string; imageUrl?: string | null }>;
      correctOptionKey?: string | null;
      markScheme?: string | null;
      maxMarks: number;
      difficultyLevel: number;
      subject: string;
      curriculumNodeId?: string | null;
      examBoard?: string | null;
      yearGroup?: string | null;
      tags?: string[];
      provenance: QuestionProvenance;
      isPublished?: boolean;
    },
    correlationId = 'system',
  ): Question {
    const questionId = props.id ?? QuestionId.create();

    const optionEntities = props.options
      ? props.options.map((opt) =>
          QuestionOptionEntity.create({
            questionId: questionId.value,
            key: opt.key,
            text: opt.text,
            imageUrl: opt.imageUrl,
          }),
        )
      : [];

    Question.validateInvariants(
      props.type,
      optionEntities,
      props.correctOptionKey ?? null,
      props.markScheme ?? null,
    );

    const now = new Date();
    const question = new Question({
      id: questionId,
      ownerType: props.ownerType,
      ownerId: props.ownerId ?? null,
      orgId: props.orgId ?? null,
      type: props.type,
      stem: props.stem,
      options: optionEntities,
      correctOptionKey: props.correctOptionKey ?? null,
      markScheme: props.markScheme ?? null,
      maxMarks: props.maxMarks,
      difficultyLevel: props.difficultyLevel,
      subject: props.subject,
      curriculumNodeId: props.curriculumNodeId ?? null,
      examBoard: props.examBoard ?? null,
      yearGroup: props.yearGroup ?? null,
      tags: props.tags ?? [],
      provenance: props.provenance,
      isPublished: props.isPublished ?? false,
      usageCount: 0,
      avgScore: null,
      correctRate: null,
      createdAt: now,
      updatedAt: now,
    });

    question.addDomainEvent(
      new QuestionCreatedEvent(
        questionId.value,
        new QuestionCreatedEvent.Payload(
          questionId.value,
          question.ownerType,
          question.ownerId,
          question.type,
          question.curriculumNodeId,
        ),
        correlationId,
      ),
    );

    if (question.isPublished) {
      question.addDomainEvent(
        new QuestionPublishedEvent(
          questionId.value,
          new QuestionPublishedEvent.Payload(questionId.value),
          correlationId,
        ),
      );
    }

    return question;
  }

  public static reconstitute(props: QuestionProps): Question {
    return new Question(props);
  }

  private static validateInvariants(
    type: QuestionType,
    options: QuestionOptionEntity[],
    correctOptionKey: string | null,
    markScheme: string | null,
  ): void {
    if (type === QuestionType.mcq) {
      if (!options || options.length < 2) {
        throw new InvalidMcqOptionsError(
          'MCQ questions must have at least 2 options.',
        );
      }
      if (!correctOptionKey) {
        throw new InvalidMcqOptionsError(
          'MCQ questions must specify a correctOptionKey.',
        );
      }
      const matching = options.some(
        (o) => o.key.toUpperCase() === correctOptionKey.toUpperCase(),
      );
      if (!matching) {
        throw new InvalidMcqOptionsError(
          `Correct option key "${correctOptionKey}" does not match any provided options.`,
        );
      }
    } else if (
      type === QuestionType.short_answer ||
      type === QuestionType.long_answer
    ) {
      if (!markScheme || markScheme.trim().length === 0) {
        throw new InvalidQuestionTypeError(
          'Short and long answer questions must have a markScheme.',
        );
      }
    }
  }

  protected touch(): void {
    this._updatedAt = new Date();
  }

  public get ownerType(): QuestionOwnerType {
    return this._ownerType;
  }

  public get ownerId(): string | null {
    return this._ownerId;
  }

  public get orgId(): string | null {
    return this._orgId;
  }

  public get type(): QuestionType {
    return this._type;
  }

  public get stem(): string {
    return this._stem;
  }

  public get options(): QuestionOptionEntity[] {
    return [...this._options];
  }

  public get correctOptionKey(): string | null {
    return this._correctOptionKey;
  }

  public get markScheme(): string | null {
    return this._markScheme;
  }

  public get maxMarks(): number {
    return this._maxMarks;
  }

  public get difficultyLevel(): number {
    return this._difficultyLevel;
  }

  public get subject(): string {
    return this._subject;
  }

  public get curriculumNodeId(): string | null {
    return this._curriculumNodeId;
  }

  public get examBoard(): string | null {
    return this._examBoard;
  }

  public get yearGroup(): string | null {
    return this._yearGroup;
  }

  public get tags(): string[] {
    return [...this._tags];
  }

  public get provenance(): QuestionProvenance {
    return this._provenance;
  }

  public get isPublished(): boolean {
    return this._isPublished;
  }

  public get usageCount(): number {
    return this._usageCount;
  }

  public get avgScore(): number | null {
    return this._avgScore;
  }

  public get correctRate(): number | null {
    return this._correctRate;
  }

  public get createdAt(): Date {
    return new Date(this._createdAt);
  }

  public get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  public publish(correlationId = 'system'): void {
    if (this._isPublished) {
      throw new QuestionAlreadyPublishedError(this.id.value);
    }
    this._isPublished = true;
    this.touch();
    this.addDomainEvent(
      new QuestionPublishedEvent(
        this.id.value,
        new QuestionPublishedEvent.Payload(this.id.value),
        correlationId,
      ),
    );
  }

  public unpublish(): void {
    this._isPublished = false;
    this.touch();
  }

  public updateContent(
    params: {
      stem?: string;
      options?: Array<{ key: string; text: string; imageUrl?: string | null }>;
      correctOptionKey?: string | null;
      markScheme?: string | null;
      maxMarks?: number;
    },
    actor?: { role: string; userId?: string; orgId?: string },
  ): void {
    this.assertCanModify(actor);

    if (params.stem !== undefined) {
      this._stem = params.stem;
    }
    if (params.maxMarks !== undefined) {
      this._maxMarks = params.maxMarks;
    }
    if (params.markScheme !== undefined) {
      this._markScheme = params.markScheme;
    }
    if (params.correctOptionKey !== undefined) {
      this._correctOptionKey = params.correctOptionKey;
    }
    if (params.options !== undefined) {
      this._options = params.options.map((opt) =>
        QuestionOptionEntity.create({
          questionId: this.id.value,
          key: opt.key,
          text: opt.text,
          imageUrl: opt.imageUrl,
        }),
      );
    }

    Question.validateInvariants(
      this._type,
      this._options,
      this._correctOptionKey,
      this._markScheme,
    );

    this.touch();
  }

  public updateMetadata(params: {
    difficultyLevel?: number;
    subject?: string;
    curriculumNodeId?: string | null;
    examBoard?: string | null;
    yearGroup?: string | null;
    tags?: string[];
  }): void {
    if (params.difficultyLevel !== undefined) {
      this._difficultyLevel = Math.min(5, Math.max(1, params.difficultyLevel));
    }
    if (params.subject !== undefined) {
      this._subject = params.subject;
    }
    if (params.curriculumNodeId !== undefined) {
      this._curriculumNodeId = params.curriculumNodeId;
    }
    if (params.examBoard !== undefined) {
      this._examBoard = params.examBoard;
    }
    if (params.yearGroup !== undefined) {
      this._yearGroup = params.yearGroup;
    }
    if (params.tags !== undefined) {
      this._tags = [...params.tags];
    }
    this.touch();
  }

  public recordUsage(): void {
    this._usageCount++;
    this.touch();
  }

  public updateAnalytics(scorePercent: number, isCorrect: boolean): void {
    const currentUsage = this._usageCount;
    if (this._avgScore === null) {
      this._avgScore = scorePercent;
    } else {
      this._avgScore =
        (this._avgScore * currentUsage + scorePercent) / (currentUsage + 1);
    }

    const correctVal = isCorrect ? 100 : 0;
    if (this._correctRate === null) {
      this._correctRate = correctVal;
    } else {
      this._correctRate =
        (this._correctRate * currentUsage + correctVal) / (currentUsage + 1);
    }
    this.touch();
  }

  public delete(): void {
    if (this._usageCount > 0) {
      throw new QuestionCannotBeDeletedError(this.id.value, this._usageCount);
    }
  }

  private assertCanModify(actor?: { role: string; userId?: string; orgId?: string }): void {
    if (!actor) return;
    if (this._ownerType === QuestionOwnerType.platform && actor.role !== 'SUPER_ADMIN') {
      throw new InsufficientQuestionPermissionError(
        'Platform questions can only be modified by Super Admins.',
      );
    }
    if (
      this._ownerType === QuestionOwnerType.org &&
      actor.orgId &&
      this._orgId !== actor.orgId
    ) {
      throw new InsufficientQuestionPermissionError(
        'Cannot modify questions belonging to another organization.',
      );
    }
  }
}
