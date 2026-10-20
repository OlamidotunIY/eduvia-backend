import { QuestionSummary, QuestionSummaryProps } from './question-summary.vo';

export interface AssessmentSummaryProps {
  totalQuestionsAttempted: number;
  totalQuestionsCorrect: number;
  totalMarksAwarded: number | null;
  totalMaxMarks: number;
  scorePercent: number | null;
  questionBreakdown: QuestionSummary[];
}

export interface AssessmentSummaryJSON {
  totalQuestionsAttempted: number;
  totalQuestionsCorrect: number;
  totalMarksAwarded: number | null;
  totalMaxMarks: number;
  scorePercent: number | null;
  questionBreakdown: QuestionSummaryProps[];
}

export class AssessmentSummary {
  private constructor(private readonly props: AssessmentSummaryProps) {
    if (props.totalQuestionsAttempted < 0) {
      throw new Error('totalQuestionsAttempted cannot be negative');
    }
    if (props.totalQuestionsCorrect < 0) {
      throw new Error('totalQuestionsCorrect cannot be negative');
    }
    if (props.totalMaxMarks < 0) {
      throw new Error('totalMaxMarks cannot be negative');
    }
  }

  public static create(props: {
    totalQuestionsAttempted: number;
    totalQuestionsCorrect: number;
    totalMarksAwarded: number | null;
    totalMaxMarks: number;
    scorePercent?: number | null;
    questionBreakdown?: QuestionSummary[];
  }): AssessmentSummary {
    const calculatedScorePercent =
      props.scorePercent !== undefined
        ? props.scorePercent
        : props.totalMaxMarks > 0 && props.totalMarksAwarded !== null
          ? Math.round((props.totalMarksAwarded / props.totalMaxMarks) * 100 * 10) / 10
          : null;

    return new AssessmentSummary({
      totalQuestionsAttempted: props.totalQuestionsAttempted,
      totalQuestionsCorrect: props.totalQuestionsCorrect,
      totalMarksAwarded: props.totalMarksAwarded,
      totalMaxMarks: props.totalMaxMarks,
      scorePercent: calculatedScorePercent,
      questionBreakdown: props.questionBreakdown || [],
    });
  }

  public static fromJSON(json: AssessmentSummaryJSON): AssessmentSummary {
    return new AssessmentSummary({
      totalQuestionsAttempted: json.totalQuestionsAttempted,
      totalQuestionsCorrect: json.totalQuestionsCorrect,
      totalMarksAwarded: json.totalMarksAwarded,
      totalMaxMarks: json.totalMaxMarks,
      scorePercent: json.scorePercent,
      questionBreakdown: (json.questionBreakdown || []).map((q) =>
        QuestionSummary.create(q),
      ),
    });
  }

  public get totalQuestionsAttempted(): number {
    return this.props.totalQuestionsAttempted;
  }

  public get totalQuestionsCorrect(): number {
    return this.props.totalQuestionsCorrect;
  }

  public get totalMarksAwarded(): number | null {
    return this.props.totalMarksAwarded;
  }

  public get totalMaxMarks(): number {
    return this.props.totalMaxMarks;
  }

  public get scorePercent(): number | null {
    return this.props.scorePercent;
  }

  public get questionBreakdown(): readonly QuestionSummary[] {
    return this.props.questionBreakdown;
  }

  public toJSON(): AssessmentSummaryJSON {
    return {
      totalQuestionsAttempted: this.props.totalQuestionsAttempted,
      totalQuestionsCorrect: this.props.totalQuestionsCorrect,
      totalMarksAwarded: this.props.totalMarksAwarded,
      totalMaxMarks: this.props.totalMaxMarks,
      scorePercent: this.props.scorePercent,
      questionBreakdown: this.props.questionBreakdown.map((q) => q.toJSON()),
    };
  }
}
