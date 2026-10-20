import { AggregateRoot, BusinessRuleViolationError } from '@modules/shared/domain';
import {
  AiJobId,
  AiJobType,
  AiJobStatus,
  AiProvider,
  AiEntityType,
} from '../value-objects';
import {
  AIJobCreatedEvent,
  AIJobCompletedEvent,
  AIJobFailedEvent,
} from '../events';
import { InvalidAiJobStateError } from '../errors';

export interface AiJobProps {
  id: AiJobId;
  type: AiJobType;
  status: AiJobStatus;
  inputPayload: Record<string, any>;
  outputPayload: Record<string, any> | null;
  provider: AiProvider;
  model: string;
  promptVersion: string;
  tokensUsed: number | null;
  errorMessage: string | null;
  relatedEntityId: string;
  relatedEntityType: AiEntityType;
  orgId: string;
  requestedBy: string | null;
  createdAt: Date;
  completedAt: Date | null;
  updatedAt: Date;
}

export class AiJob extends AggregateRoot<AiJobId> {
  private _type: AiJobType;
  private _status: AiJobStatus;
  private _inputPayload: Record<string, any>;
  private _outputPayload: Record<string, any> | null;
  private _provider: AiProvider;
  private _model: string;
  private _promptVersion: string;
  private _tokensUsed: number | null;
  private _errorMessage: string | null;
  private _relatedEntityId: string;
  private _relatedEntityType: AiEntityType;
  private _orgId: string;
  private _requestedBy: string | null;
  private _createdAt: Date;
  private _completedAt: Date | null;
  private _updatedAt: Date;

  protected constructor(props: AiJobProps) {
    super(props.id);
    this._type = props.type;
    this._status = props.status;
    this._inputPayload = { ...props.inputPayload };
    this._outputPayload = props.outputPayload ? { ...props.outputPayload } : null;
    this._provider = props.provider;
    this._model = props.model;
    this._promptVersion = props.promptVersion;
    this._tokensUsed = props.tokensUsed;
    this._errorMessage = props.errorMessage;
    this._relatedEntityId = props.relatedEntityId;
    this._relatedEntityType = props.relatedEntityType;
    this._orgId = props.orgId;
    this._requestedBy = props.requestedBy;
    this._createdAt = new Date(props.createdAt);
    this._completedAt = props.completedAt ? new Date(props.completedAt) : null;
    this._updatedAt = new Date(props.updatedAt);
  }

  public static create(props: {
    id?: AiJobId;
    type: AiJobType;
    inputPayload: Record<string, any>;
    provider: AiProvider;
    model: string;
    promptVersion: string;
    relatedEntityId: string;
    relatedEntityType: AiEntityType;
    orgId: string;
    requestedBy?: string | null;
    correlationId?: string;
  }): AiJob {
    if (!props.type) {
      throw new BusinessRuleViolationError('AiJob requires a valid type.');
    }
    if (!props.inputPayload || typeof props.inputPayload !== 'object') {
      throw new BusinessRuleViolationError('AiJob requires a valid inputPayload.');
    }
    if (!props.relatedEntityId) {
      throw new BusinessRuleViolationError('AiJob requires relatedEntityId.');
    }
    if (!props.orgId) {
      throw new BusinessRuleViolationError('AiJob requires orgId.');
    }

    const id = props.id ?? AiJobId.create();
    const now = new Date();

    const job = new AiJob({
      id,
      type: props.type,
      status: AiJobStatus.QUEUED,
      inputPayload: props.inputPayload,
      outputPayload: null,
      provider: props.provider,
      model: props.model,
      promptVersion: props.promptVersion,
      tokensUsed: null,
      errorMessage: null,
      relatedEntityId: props.relatedEntityId,
      relatedEntityType: props.relatedEntityType,
      orgId: props.orgId,
      requestedBy: props.requestedBy ?? null,
      createdAt: now,
      completedAt: null,
      updatedAt: now,
    });

    job.addDomainEvent(
      new AIJobCreatedEvent(
        id.value,
        new AIJobCreatedEvent.Payload(
          id.value,
          props.type,
          props.relatedEntityId,
          props.relatedEntityType,
          props.orgId,
          props.requestedBy ?? null,
        ),
        props.correlationId ?? id.value,
      ),
    );

    return job;
  }

  public static reconstitute(props: AiJobProps): AiJob {
    return new AiJob(props);
  }

  public markProcessing(): void {
    if (this._status !== AiJobStatus.QUEUED) {
      throw new InvalidAiJobStateError('markProcessing', this._status);
    }
    this._status = AiJobStatus.PROCESSING;
    this.touch();
  }

  public complete(
    output: Record<string, any>,
    tokensUsed?: number,
    correlationId?: string,
  ): void {
    if (
      this._status !== AiJobStatus.QUEUED &&
      this._status !== AiJobStatus.PROCESSING
    ) {
      throw new InvalidAiJobStateError('complete', this._status);
    }

    this._status = AiJobStatus.COMPLETED;
    this._outputPayload = { ...output };
    this._tokensUsed = tokensUsed !== undefined ? tokensUsed : null;
    this._completedAt = new Date();
    this.touch();

    this.addDomainEvent(
      new AIJobCompletedEvent(
        this.id.value,
        new AIJobCompletedEvent.Payload(
          this.id.value,
          this._type,
          this._outputPayload,
          this._tokensUsed,
          this._relatedEntityId,
          this._orgId,
        ),
        correlationId ?? this.id.value,
      ),
    );
  }

  public fail(errorMessage: string, correlationId?: string): void {
    if (
      this._status !== AiJobStatus.QUEUED &&
      this._status !== AiJobStatus.PROCESSING
    ) {
      throw new InvalidAiJobStateError('fail', this._status);
    }

    this._status = AiJobStatus.FAILED;
    this._errorMessage = errorMessage;
    this._completedAt = new Date();
    this.touch();

    this.addDomainEvent(
      new AIJobFailedEvent(
        this.id.value,
        new AIJobFailedEvent.Payload(
          this.id.value,
          this._type,
          errorMessage,
          this._relatedEntityId,
          this._orgId,
        ),
        correlationId ?? this.id.value,
      ),
    );
  }

  public cancel(): void {
    if (
      this._status !== AiJobStatus.QUEUED &&
      this._status !== AiJobStatus.PROCESSING
    ) {
      throw new InvalidAiJobStateError('cancel', this._status);
    }
    this._status = AiJobStatus.CANCELLED;
    this.touch();
  }

  public touch(): void {
    this._updatedAt = new Date();
  }

  // Getters
  public get type(): AiJobType {
    return this._type;
  }

  public get status(): AiJobStatus {
    return this._status;
  }

  public get inputPayload(): Record<string, any> {
    return { ...this._inputPayload };
  }

  public get outputPayload(): Record<string, any> | null {
    return this._outputPayload ? { ...this._outputPayload } : null;
  }

  public get provider(): AiProvider {
    return this._provider;
  }

  public get model(): string {
    return this._model;
  }

  public get promptVersion(): string {
    return this._promptVersion;
  }

  public get tokensUsed(): number | null {
    return this._tokensUsed;
  }

  public get errorMessage(): string | null {
    return this._errorMessage;
  }

  public get relatedEntityId(): string {
    return this._relatedEntityId;
  }

  public get relatedEntityType(): AiEntityType {
    return this._relatedEntityType;
  }

  public get orgId(): string {
    return this._orgId;
  }

  public get requestedBy(): string | null {
    return this._requestedBy;
  }

  public get createdAt(): Date {
    return new Date(this._createdAt);
  }

  public get completedAt(): Date | null {
    return this._completedAt ? new Date(this._completedAt) : null;
  }

  public get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  public isTerminal(): boolean {
    return (
      this._status === AiJobStatus.COMPLETED ||
      this._status === AiJobStatus.FAILED ||
      this._status === AiJobStatus.CANCELLED
    );
  }

  public isQueued(): boolean {
    return this._status === AiJobStatus.QUEUED;
  }

  public isProcessing(): boolean {
    return this._status === AiJobStatus.PROCESSING;
  }

  public isCompleted(): boolean {
    return this._status === AiJobStatus.COMPLETED;
  }

  public isFailed(): boolean {
    return this._status === AiJobStatus.FAILED;
  }
}
