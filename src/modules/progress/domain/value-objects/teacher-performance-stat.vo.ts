export interface TeacherPerformanceStatProps {
  teacherId: string;
  teacherName: string;
  teacherRole?: string;
  avatarUrl?: string | null;
  lessonsDelivered: number;
  avgReportSubmissionHours: number;
  avgStudentScorePercent: number | null;
  reportCompletionRate: number;
  studentRetentionRate: number;
  completionRate?: number;
}

export class TeacherPerformanceStat {
  private constructor(private readonly props: TeacherPerformanceStatProps) {
    if (!props.teacherId) {
      throw new Error('teacherId is required for TeacherPerformanceStat');
    }
  }

  public static create(props: TeacherPerformanceStatProps): TeacherPerformanceStat {
    return new TeacherPerformanceStat(props);
  }

  public get teacherId(): string {
    return this.props.teacherId;
  }

  public get teacherName(): string {
    return this.props.teacherName;
  }

  public get teacherRole(): string | undefined {
    return this.props.teacherRole;
  }

  public get avatarUrl(): string | null | undefined {
    return this.props.avatarUrl;
  }

  public get lessonsDelivered(): number {
    return this.props.lessonsDelivered;
  }

  public get avgReportSubmissionHours(): number {
    return this.props.avgReportSubmissionHours;
  }

  public get avgStudentScorePercent(): number | null {
    return this.props.avgStudentScorePercent;
  }

  public get reportCompletionRate(): number {
    return this.props.reportCompletionRate;
  }

  public get completionRate(): number {
    return this.props.completionRate ?? this.props.reportCompletionRate;
  }

  public get studentRetentionRate(): number {
    return this.props.studentRetentionRate;
  }

  public toJSON(): TeacherPerformanceStatProps & { completionRate: number } {
    return {
      ...this.props,
      completionRate: this.completionRate,
    };
  }
}
