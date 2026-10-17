import { AggregateRoot, BusinessRuleViolationError } from '@modules/shared/domain';
import {
  AiPromptTemplateId,
  AiJobType,
} from '../value-objects';
import { AiPromptTemplateInvariantError } from '../errors';

export interface AiPromptTemplateProps {
  id: AiPromptTemplateId;
  name: string;
  type: AiJobType;
  version: string;
  systemPrompt: string;
  userPromptTemplate: string;
  isActive: boolean;
  createdAt: Date;
  deprecatedAt: Date | null;
  updatedAt: Date;
}

export class AiPromptTemplate extends AggregateRoot<AiPromptTemplateId> {
  private _name: string;
  private _type: AiJobType;
  private _version: string;
  private _systemPrompt: string;
  private _userPromptTemplate: string;
  private _isActive: boolean;
  private _createdAt: Date;
  private _deprecatedAt: Date | null;
  private _updatedAt: Date;

  protected constructor(props: AiPromptTemplateProps) {
    super(props.id);
    this._name = props.name;
    this._type = props.type;
    this._version = props.version;
    this._systemPrompt = props.systemPrompt;
    this._userPromptTemplate = props.userPromptTemplate;
    this._isActive = props.isActive;
    this._createdAt = new Date(props.createdAt);
    this._deprecatedAt = props.deprecatedAt ? new Date(props.deprecatedAt) : null;
    this._updatedAt = new Date(props.updatedAt);
  }

  public static create(props: {
    id?: AiPromptTemplateId;
    name: string;
    type: AiJobType;
    version: string;
    systemPrompt: string;
    userPromptTemplate: string;
    isActive?: boolean;
  }): AiPromptTemplate {
    if (!props.name || props.name.trim().length === 0) {
      throw new BusinessRuleViolationError('Template name cannot be empty.');
    }
    if (!props.type) {
      throw new BusinessRuleViolationError('Template requires a valid AiJobType.');
    }
    if (!props.version || props.version.trim().length === 0) {
      throw new BusinessRuleViolationError('Template version cannot be empty.');
    }
    if (!props.systemPrompt || props.systemPrompt.trim().length === 0) {
      throw new BusinessRuleViolationError('Template systemPrompt cannot be empty.');
    }
    if (!props.userPromptTemplate || props.userPromptTemplate.trim().length === 0) {
      throw new BusinessRuleViolationError('Template userPromptTemplate cannot be empty.');
    }

    const id = props.id ?? AiPromptTemplateId.create();
    const now = new Date();

    return new AiPromptTemplate({
      id,
      name: props.name.trim(),
      type: props.type,
      version: props.version.trim(),
      systemPrompt: props.systemPrompt,
      userPromptTemplate: props.userPromptTemplate,
      isActive: props.isActive !== undefined ? props.isActive : true,
      createdAt: now,
      deprecatedAt: null,
      updatedAt: now,
    });
  }

  public static reconstitute(props: AiPromptTemplateProps): AiPromptTemplate {
    return new AiPromptTemplate(props);
  }

  public updateTemplate(params: {
    systemPrompt?: string;
    userPromptTemplate?: string;
    name?: string;
  }): void {
    if (params.name !== undefined) {
      if (!params.name.trim()) {
        throw new AiPromptTemplateInvariantError('Template name cannot be empty.');
      }
      this._name = params.name.trim();
    }
    if (params.systemPrompt !== undefined) {
      if (!params.systemPrompt.trim()) {
        throw new AiPromptTemplateInvariantError('Template systemPrompt cannot be empty.');
      }
      this._systemPrompt = params.systemPrompt;
    }
    if (params.userPromptTemplate !== undefined) {
      if (!params.userPromptTemplate.trim()) {
        throw new AiPromptTemplateInvariantError('Template userPromptTemplate cannot be empty.');
      }
      this._userPromptTemplate = params.userPromptTemplate;
    }
    this.touch();
  }

  public deprecate(): void {
    this._isActive = false;
    this._deprecatedAt = new Date();
    this.touch();
  }

  public activate(): void {
    this._isActive = true;
    this._deprecatedAt = null;
    this.touch();
  }

  public renderUserPrompt(variables: Record<string, any>): string {
    let rendered = this._userPromptTemplate;
    for (const [key, value] of Object.entries(variables)) {
      const stringValue =
        typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
      rendered = rendered.split(`{{${key}}}`).join(stringValue);
    }
    return rendered;
  }

  public touch(): void {
    this._updatedAt = new Date();
  }

  // Getters
  public get name(): string {
    return this._name;
  }

  public get type(): AiJobType {
    return this._type;
  }

  public get version(): string {
    return this._version;
  }

  public get systemPrompt(): string {
    return this._systemPrompt;
  }

  public get userPromptTemplate(): string {
    return this._userPromptTemplate;
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  public get createdAt(): Date {
    return new Date(this._createdAt);
  }

  public get deprecatedAt(): Date | null {
    return this._deprecatedAt ? new Date(this._deprecatedAt) : null;
  }

  public get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
}
