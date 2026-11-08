export interface StudentChurnRiskProps {
  studentId: string;
  studentName: string;
  avatarUrl?: string | null;
  gradeSubject?: string;
  riskLevel?: 'high' | 'medium' | 'low';
  reason?: string;
  avgScorePercent?: number;
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

  public get avatarUrl(): string | null | undefined {
    return this.props.avatarUrl;
  }

  public get gradeSubject(): string | undefined {
    return this.props.gradeSubject;
  }

  public get riskLevel(): 'high' | 'medium' | 'low' {
    if (this.props.riskLevel) return this.props.riskLevel;
    if (this.props.riskScore >= 0.7) return 'high';
    if (this.props.riskScore >= 0.3) return 'medium';
    return 'low';
  }

  public get reason(): string {
    if (this.props.reason) return this.props.reason;
    if (this.props.riskFactors && this.props.riskFactors.length > 0) {
      return this.props.riskFactors[0];
    }
    return 'Low activity';
  }

  public get avgScorePercent(): number {
    return this.props.avgScorePercent ?? Math.round((1 - this.props.riskScore) * 100);
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

  public toJSON(): StudentChurnRiskProps & {
    riskLevel: 'high' | 'medium' | 'low';
    reason: string;
    avgScorePercent: number;
  } {
    return {
      ...this.props,
      riskLevel: this.riskLevel,
      reason: this.reason,
      avgScorePercent: this.avgScorePercent,
    };
  }
}
