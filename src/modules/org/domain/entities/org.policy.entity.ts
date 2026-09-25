

class OrganizationPolicy {
  public readonly orgId: string;
  private _minimumBookingNoticeHours: number;
  private _cancellationWindowHours: number;
  private _noShowWaitMinutes: number;
  private _autoRescheduleOnNoShow: boolean;
  private _lessonPlanRequired: boolean;
  private _reportRequiredWithinHours: number;
  public readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(params: {
    orgId: string;
    minimumBookingNoticeHours: number;
    cancellationWindowHours: number;
    noShowWaitMinutes: number;
    autoRescheduleOnNoShow: boolean;
    lessonPlanRequired: boolean;
    reportRequiredWithinHours: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.orgId = params.orgId;
    this._minimumBookingNoticeHours = params.minimumBookingNoticeHours;
    this._cancellationWindowHours = params.cancellationWindowHours;
    this._noShowWaitMinutes = params.noShowWaitMinutes;
    this._autoRescheduleOnNoShow = params.autoRescheduleOnNoShow;
    this._lessonPlanRequired = params.lessonPlanRequired;
    this._reportRequiredWithinHours = params.reportRequiredWithinHours;
    this.createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  

  
   
}

export { OrganizationPolicy };