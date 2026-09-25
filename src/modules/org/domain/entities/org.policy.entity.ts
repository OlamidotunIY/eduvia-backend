
const DEFAULTS = {
  minimumBookingNoticeHours: 24,
  cancellationWindowHours: 48,
  noShowWaitMinutes: 15,
  autoRescheduleOnNoShow: true,
  lessonPlanRequired: false,
  reportRequiredWithinHours: 24,
} as const;

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

  /** Called once, right after Organization.create() — every org gets a policy row with sane defaults. */
  public static createDefault(orgId: string): OrganizationPolicy {
    const now = new Date();
    return new OrganizationPolicy({
      orgId,
      ...DEFAULTS,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(params: {
    orgId: string;
    minimumBookingNoticeHours: number;
    cancellationWindowHours: number;
    noShowWaitMinutes: number;
    autoRescheduleOnNoShow: boolean;
    lessonPlanRequired: boolean;
    reportRequiredWithinHours: number;
    createdAt: Date;
    updatedAt: Date;
  }): OrganizationPolicy {
    return new OrganizationPolicy(params);
  }

  public update(params: {
    minimumBookingNoticeHours?: number;
    cancellationWindowHours?: number;
    noShowWaitMinutes?: number;
    autoRescheduleOnNoShow?: boolean;
    lessonPlanRequired?: boolean;
    reportRequiredWithinHours?: number;
  }): void {
    if (params.minimumBookingNoticeHours !== undefined) {
      this.assertNonNegative('minimumBookingNoticeHours', params.minimumBookingNoticeHours);
      this._minimumBookingNoticeHours = params.minimumBookingNoticeHours;
    }

    if (params.cancellationWindowHours !== undefined) {
      this.assertNonNegative('cancellationWindowHours', params.cancellationWindowHours);
      this._cancellationWindowHours = params.cancellationWindowHours;
    }

    if (params.noShowWaitMinutes !== undefined) {
      this.assertNonNegative('noShowWaitMinutes', params.noShowWaitMinutes);
      this._noShowWaitMinutes = params.noShowWaitMinutes;
    }

    if (params.autoRescheduleOnNoShow !== undefined) {
      this._autoRescheduleOnNoShow = params.autoRescheduleOnNoShow;
    }

    if (params.lessonPlanRequired !== undefined) {
      this._lessonPlanRequired = params.lessonPlanRequired;
    }

    if (params.reportRequiredWithinHours !== undefined) {
      this.assertNonNegative('reportRequiredWithinHours', params.reportRequiredWithinHours);
      this._reportRequiredWithinHours = params.reportRequiredWithinHours;
    }

    this._updatedAt = new Date();
  }

  private assertNonNegative(field: string, value: number): void {
    if (value < 0) {
      throw new Error('must be zero or a positive number');
    }
  }

  public get minimumBookingNoticeHours(): number {
    return this._minimumBookingNoticeHours;
  }

  public get cancellationWindowHours(): number {
    return this._cancellationWindowHours;
  }

  public get noShowWaitMinutes(): number {
    return this._noShowWaitMinutes;
  }

  public get autoRescheduleOnNoShow(): boolean {
    return this._autoRescheduleOnNoShow;
  }

  public get lessonPlanRequired(): boolean {
    return this._lessonPlanRequired;
  }

  public get reportRequiredWithinHours(): number {
    return this._reportRequiredWithinHours;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }
}

export { OrganizationPolicy };