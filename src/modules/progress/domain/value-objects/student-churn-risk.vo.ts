export interface StudentChurnRiskProps {
  studentId: string;
  studentName: string;
  riskScore: number;
  riskFactors: string[];
  lastLessonAt: Date | null;
}

export class StudentChurnRisk {
  private constructor(private readonly props: StudentChurnRiskProps) {
    if (!props.studentId) {
      throw new Error('studentId is required for StudentChurnRisk');
    }
    if (props.riskScore < 0 || props.riskScore > 1.0) {
      throw new Error('riskScore must be between 0.0 and 1.0');
    }
  }

  public static create(props: StudentChurnRiskProps): StudentChurnRisk {
    const clampedScore = Math.min(1.0, Math.max(0.0, Math.round(props.riskScore * 100) / 100));
    return new StudentChurnRisk({
      ...props,
      riskScore: clampedScore,
    });
  }

  public get studentId(): string {
    return this.props.studentId;
  }

  public get studentName(): string {
    return this.props.studentName;
  }

  public get riskScore(): number {
    return this.props.riskScore;
  }

  public get riskFactors(): readonly string[] {
    return this.props.riskFactors;
  }

  public get lastLessonAt(): Date | null {
    return this.props.lastLessonAt;
  }

  public toJSON(): StudentChurnRiskProps {
    return { ...this.props };
  }
}
