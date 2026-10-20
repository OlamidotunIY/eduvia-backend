export interface QuestionSummaryProps {
  questionId: string;
  questionStem: string;
  questionType: string;
  marksAwarded: number | null;
  maxMarks: number;
  isCorrect: boolean | null;
  teacherFeedback: string | null;
}

export class QuestionSummary {
  private constructor(private readonly props: QuestionSummaryProps) {
    if (!props.questionId) {
      throw new Error('questionId is required for QuestionSummary');
    }
    if (props.maxMarks < 0) {
      throw new Error('maxMarks cannot be negative');
    }
  }

  public static create(props: QuestionSummaryProps): QuestionSummary {
    return new QuestionSummary({
      ...props,
      questionStem: props.questionStem.slice(0, 100),
    });
  }

  public get questionId(): string {
    return this.props.questionId;
  }

  public get questionStem(): string {
    return this.props.questionStem;
  }

  public get questionType(): string {
    return this.props.questionType;
  }

  public get marksAwarded(): number | null {
    return this.props.marksAwarded;
  }

  public get maxMarks(): number {
    return this.props.maxMarks;
  }

  public get isCorrect(): boolean | null {
    return this.props.isCorrect;
  }

  public get teacherFeedback(): string | null {
    return this.props.teacherFeedback;
  }

  public toJSON(): QuestionSummaryProps {
    return { ...this.props };
  }
}
