export interface SharedOrgBillingStatusDto {
  orgId: string;
  billingModel: string;
  planTier: string;
  status: string;
  canAccessAiFeatures: boolean;
  isSuspended: boolean;
  seatCount: number;
}

export interface SharedParentSubscriptionDto {
  id: string;
  orgId: string;
  planId: string;
  parentId: string;
  studentId: string;
  subjectId: string;
  status: string;
  currentPeriodEnd: Date;
  isActive: boolean;
}

export abstract class IBillingQueryPort {
  public abstract getOrgBillingStatus(orgId: string): Promise<SharedOrgBillingStatusDto | null>;

  public abstract isStudentSubscribedToSubject(
    studentId: string,
    subjectId: string,
    orgId: string,
  ): Promise<boolean>;

  public abstract getActiveSubscription(
    parentId: string,
    studentId: string,
    subjectId: string,
    orgId: string,
  ): Promise<SharedParentSubscriptionDto | null>;
}
