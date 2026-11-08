export interface FunnelStageProps {
  stage: string;
  count: number;
  percentage: number;
}

export interface EnrollmentFunnelStatProps {
  totalLeads: number;
  trialLessonsBooked: number;
  trialLessonsCompleted: number;
  enrolledStudents: number;
  conversionRate: number;
  stages?: FunnelStageProps[];
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

  public get stages(): FunnelStageProps[] {
    if (this.props.stages && this.props.stages.length > 0) {
      return this.props.stages;
    }
    const leads = Math.max(this.props.totalLeads, 1);
    return [
      { stage: 'Invited', count: this.props.totalLeads, percentage: 100 },
      {
        stage: 'Registered',
        count: this.props.trialLessonsBooked,
        percentage: Math.round((this.props.trialLessonsBooked / leads) * 1000) / 10,
      },
      {
        stage: 'Active',
        count: this.props.trialLessonsCompleted,
        percentage: Math.round((this.props.trialLessonsCompleted / leads) * 1000) / 10,
      },
      {
        stage: 'Engaged (last 7 days)',
        count: this.props.enrolledStudents,
        percentage: Math.round((this.props.enrolledStudents / leads) * 1000) / 10,
      },
    ];
  }

  public toJSON(): EnrollmentFunnelStatProps & { stages: FunnelStageProps[] } {
    return {
      ...this.props,
      stages: this.stages,
    };
  }
}
