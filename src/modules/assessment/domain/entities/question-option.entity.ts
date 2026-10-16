import { QuestionOptionId } from '../value-objects';

export interface QuestionOptionEntityProps {
  id: QuestionOptionId;
  questionId: string;
  key: string;
  text: string;
  imageUrl?: string | null;
}

export class QuestionOptionEntity {
  public readonly id: QuestionOptionId;
  private _questionId: string;
  private _key: string;
  private _text: string;
  private _imageUrl: string | null;

  private constructor(props: QuestionOptionEntityProps) {
    if (!props.key || props.key.trim().length === 0) {
      throw new Error('Question option key cannot be empty.');
    }
    if (!props.text || props.text.trim().length === 0) {
      throw new Error('Question option text cannot be empty.');
    }
    this.id = props.id;
    this._questionId = props.questionId;
    this._key = props.key.trim().toUpperCase();
    this._text = props.text.trim();
    this._imageUrl = props.imageUrl ?? null;
  }

  public static create(props: {
    id?: QuestionOptionId;
    questionId: string;
    key: string;
    text: string;
    imageUrl?: string | null;
  }): QuestionOptionEntity {
    return new QuestionOptionEntity({
      id: props.id ?? QuestionOptionId.create(),
      questionId: props.questionId,
      key: props.key,
      text: props.text,
      imageUrl: props.imageUrl ?? null,
    });
  }

  public static reconstitute(props: QuestionOptionEntityProps): QuestionOptionEntity {
    return new QuestionOptionEntity(props);
  }

  public get questionId(): string {
    return this._questionId;
  }

  public get key(): string {
    return this._key;
  }

  public get text(): string {
    return this._text;
  }

  public get imageUrl(): string | null {
    return this._imageUrl;
  }

  public updateContent(text: string, imageUrl?: string | null): void {
    if (!text || text.trim().length === 0) {
      throw new Error('Question option text cannot be empty.');
    }
    this._text = text.trim();
    this._imageUrl = imageUrl ?? null;
  }
}
