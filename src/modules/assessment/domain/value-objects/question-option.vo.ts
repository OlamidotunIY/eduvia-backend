export interface QuestionOptionProps {
  key: string;
  text: string;
  imageUrl?: string | null;
}

export class QuestionOption {
  private readonly _key: string;
  private readonly _text: string;
  private readonly _imageUrl: string | null;

  private constructor(props: QuestionOptionProps) {
    if (!props.key || props.key.trim().length === 0) {
      throw new Error('Option key cannot be empty.');
    }
    if (!props.text || props.text.trim().length === 0) {
      throw new Error('Option text cannot be empty.');
    }
    this._key = props.key.trim().toUpperCase();
    this._text = props.text.trim();
    this._imageUrl = props.imageUrl ?? null;
  }

  public static create(props: QuestionOptionProps): QuestionOption {
    return new QuestionOption(props);
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

  public equals(other: QuestionOption): boolean {
    if (!other) return false;
    return (
      this._key === other._key &&
      this._text === other._text &&
      this._imageUrl === other._imageUrl
    );
  }

  public toJSON(): QuestionOptionProps {
    return {
      key: this._key,
      text: this._text,
      imageUrl: this._imageUrl,
    };
  }
}
