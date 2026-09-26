

class OrganizationPolicy {
  public readonly orgId: string;
  public readonly minimumBookingNoticeHours: number;
  public readonly cancellationWindowHours: number;
  public readonly noShowWaitMinutes: number;
  public readonly autoRescheduleOnNoShow: boolean;
  public readonly lessonPlanRequired: boolean;
  public readonly reportRequiredWithinHours: number;

  private constructor(params: {
    orgId: string;
    minimumBookingNoticeHours: number;
    cancellationWindowHours: number;
    noShowWaitMinutes: number;
    autoRescheduleOnNoShow: boolean;
    lessonPlanRequired: boolean;
    reportRequiredWithinHours: number;
  }) {
    this.orgId = params.orgId;
    this.minimumBookingNoticeHours = params.minimumBookingNoticeHours;
    this.cancellationWindowHours = params.cancellationWindowHours;
    this.noShowWaitMinutes = params.noShowWaitMinutes;
    this.autoRescheduleOnNoShow = params.autoRescheduleOnNoShow;
    this.lessonPlanRequired = params.lessonPlanRequired;
    this.reportRequiredWithinHours = params.reportRequiredWithinHours;
  
  }

  public static create(orgId: string): OrganizationPolicy {
    return new OrganizationPolicy({
      orgId,
      minimumBookingNoticeHours: 24,
      cancellationWindowHours: 48,
      noShowWaitMinutes: 15,
      autoRescheduleOnNoShow: true,
      lessonPlanRequired: false,
      reportRequiredWithinHours: 24,
    });
  }

  

 

  

  
   
}

export { OrganizationPolicy };