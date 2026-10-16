import { ProvenanceSource } from './provenance-source.vo';

export interface QuestionProvenanceProps {
  source: ProvenanceSource;
  createdBy: string;
  aiModel?: string | null;
  licenseRef?: string | null;
  paperRef?: string | null;
  approvedBy?: string | null;
  approvedAt?: Date | null;
}

export class QuestionProvenance {
  private readonly _source: ProvenanceSource;
  private readonly _createdBy: string;
  private readonly _aiModel: string | null;
  private readonly _licenseRef: string | null;
  private readonly _paperRef: string | null;
  private readonly _approvedBy: string | null;
  private readonly _approvedAt: Date | null;

  private constructor(props: QuestionProvenanceProps) {
    if (!props.createdBy) {
      throw new Error('CreatedBy identifier is required for question provenance.');
    }
    this._source = props.source;
    this._createdBy = props.createdBy;
    this._aiModel = props.aiModel ?? null;
    this._licenseRef = props.licenseRef ?? null;
    this._paperRef = props.paperRef ?? null;
    this._approvedBy = props.approvedBy ?? null;
    this._approvedAt = props.approvedAt ? new Date(props.approvedAt) : null;
  }

  public static create(props: QuestionProvenanceProps): QuestionProvenance {
    return new QuestionProvenance(props);
  }

  public get source(): ProvenanceSource {
    return this._source;
  }

  public get createdBy(): string {
    return this._createdBy;
  }

  public get aiModel(): string | null {
    return this._aiModel;
  }

  public get licenseRef(): string | null {
    return this._licenseRef;
  }

  public get paperRef(): string | null {
    return this._paperRef;
  }

  public get approvedBy(): string | null {
    return this._approvedBy;
  }

  public get approvedAt(): Date | null {
    return this._approvedAt ? new Date(this._approvedAt) : null;
  }

  public approve(approvedBy: string, approvedAt: Date = new Date()): QuestionProvenance {
    return new QuestionProvenance({
      source: this._source,
      createdBy: this._createdBy,
      aiModel: this._aiModel,
      licenseRef: this._licenseRef,
      paperRef: this._paperRef,
      approvedBy,
      approvedAt,
    });
  }

  public equals(other: QuestionProvenance): boolean {
    if (!other) return false;
    return (
      this._source === other._source &&
      this._createdBy === other._createdBy &&
      this._aiModel === other._aiModel &&
      this._licenseRef === other._licenseRef &&
      this._paperRef === other._paperRef &&
      this._approvedBy === other._approvedBy &&
      this._approvedAt?.getTime() === other._approvedAt?.getTime()
    );
  }

  public toJSON(): QuestionProvenanceProps {
    return {
      source: this._source,
      createdBy: this._createdBy,
      aiModel: this._aiModel,
      licenseRef: this._licenseRef,
      paperRef: this._paperRef,
      approvedBy: this._approvedBy,
      approvedAt: this._approvedAt,
    };
  }
}
