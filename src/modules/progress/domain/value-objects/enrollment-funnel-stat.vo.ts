export interface EnrollmentFunnelStatProps {
  totalLeads: number;
  trialLessonsBooked: number;
  trialLessonsCompleted: number;
  enrolledStudents: number;
  conversionRate: number;
}

export class EnrollmentFunnelStat {
  private constructor(private readonly props: EnrollmentFunnelStatProps) {
    if (props.conversionRate < 0) {
      throw new Error('conversionRate cannot be negative');
    }
  }

  public static create(props: EnrollmentFunnelStatProps): EnrollmentFunnelStat {
    return new EnrollmentFunnelStat(props);
  }

  public get totalLeads(): number {
    return this.props.totalLeads;
  }

  public get trialLessonsBooked(): number {
    return this.props.trialLessonsBooked;
  }

  public get trialLessonsCompleted(): number {
    return this.props.trialLessonsCompleted;
  }

  public get enrolledStudents(): number {
    return this.props.enrolledStudents;
  }

  public get conversionRate(): number {
    return this.props.conversionRate;
  }

  public toJSON(): EnrollmentFunnelStatProps {
    return { ...this.props };
  }
}
