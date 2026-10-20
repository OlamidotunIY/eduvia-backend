export interface LessonPlanProps {
  learningObjectives: string[];
  topicsCovered: string[];
  teachingNotes?: string | null;
  homeworkDescription?: string | null;
  isComplete: boolean;
  completedAt?: Date | null;
}

export class LessonPlan {
  private readonly _learningObjectives: string[];
  private readonly _topicsCovered: string[];
  private readonly _teachingNotes?: string | null;
  private readonly _homeworkDescription?: string | null;
  private readonly _isComplete: boolean;
  private readonly _completedAt?: Date | null;

  private constructor(props: LessonPlanProps) {
    this._learningObjectives = [...(props.learningObjectives || [])];
    this._topicsCovered = [...(props.topicsCovered || [])];
    this._teachingNotes = props.teachingNotes ?? null;
    this._homeworkDescription = props.homeworkDescription ?? null;
    this._isComplete = props.isComplete ?? false;
    this._completedAt = props.completedAt ? new Date(props.completedAt) : null;
  }

  public static create(props?: Partial<LessonPlanProps>): LessonPlan {
    return new LessonPlan({
      learningObjectives: props?.learningObjectives || [],
      topicsCovered: props?.topicsCovered || [],
      teachingNotes: props?.teachingNotes ?? null,
      homeworkDescription: props?.homeworkDescription ?? null,
      isComplete: props?.isComplete ?? false,
      completedAt: props?.completedAt ?? null,
    });
  }

  public get learningObjectives(): string[] {
    return [...this._learningObjectives];
  }

  public get topicsCovered(): string[] {
    return [...this._topicsCovered];
  }

  public get teachingNotes(): string | null | undefined {
    return this._teachingNotes;
  }

  public get homeworkDescription(): string | null | undefined {
    return this._homeworkDescription;
  }

  public get isComplete(): boolean {
    return this._isComplete;
  }

  public get completedAt(): Date | null | undefined {
    return this._completedAt ? new Date(this._completedAt) : null;
  }

  public complete(): LessonPlan {
    return new LessonPlan({
      learningObjectives: this._learningObjectives,
      topicsCovered: this._topicsCovered,
      teachingNotes: this._teachingNotes,
      homeworkDescription: this._homeworkDescription,
      isComplete: true,
      completedAt: new Date(),
    });
  }

  public update(props: Partial<LessonPlanProps>): LessonPlan {
    return new LessonPlan({
      learningObjectives: props.learningObjectives !== undefined ? props.learningObjectives : this._learningObjectives,
      topicsCovered: props.topicsCovered !== undefined ? props.topicsCovered : this._topicsCovered,
      teachingNotes: props.teachingNotes !== undefined ? props.teachingNotes : this._teachingNotes,
      homeworkDescription: props.homeworkDescription !== undefined ? props.homeworkDescription : this._homeworkDescription,
      isComplete: props.isComplete !== undefined ? props.isComplete : this._isComplete,
      completedAt: props.completedAt !== undefined ? props.completedAt : this._completedAt,
    });
  }

  public equals(other: LessonPlan): boolean {
    if (!other) return false;
    return (
      this._isComplete === other._isComplete &&
      this._teachingNotes === other._teachingNotes &&
      this._homeworkDescription === other._homeworkDescription &&
      JSON.stringify(this._learningObjectives) === JSON.stringify(other._learningObjectives) &&
      JSON.stringify(this._topicsCovered) === JSON.stringify(other._topicsCovered)
    );
  }

  public toJSON(): LessonPlanProps {
    return {
      learningObjectives: this._learningObjectives,
      topicsCovered: this._topicsCovered,
      teachingNotes: this._teachingNotes,
      homeworkDescription: this._homeworkDescription,
      isComplete: this._isComplete,
      completedAt: this._completedAt,
    };
  }
}
