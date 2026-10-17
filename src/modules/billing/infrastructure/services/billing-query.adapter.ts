import { Injectable } from '@nestjs/common';
import {
  IBillingQueryPort,
  SharedOrgBillingStatusDto,
  SharedParentSubscriptionDto,
} from '@modules/shared';
import {
  IOrgBillingAccountRepository,
  IParentSubscriptionRepository,
  OrgPlanTier,
  BillingAccountStatus,
} from '../../domain';

@Injectable()
export class BillingQueryAdapter implements IBillingQueryPort {
  constructor(
    private readonly accountRepository: IOrgBillingAccountRepository,
    private readonly subscriptionRepository: IParentSubscriptionRepository,
  ) {}

  async getOrgBillingStatus(orgId: string): Promise<SharedOrgBillingStatusDto | null> {
    const account = await this.accountRepository.findByOrgId(orgId);
    if (!account) {
      return null;
    }

    const canAccessAiFeatures =
      account.status === BillingAccountStatus.active &&
      account.planTier !== OrgPlanTier.free;

    return {
      orgId: account.orgId,
      billingModel: account.billingModel,
      planTier: account.planTier,
      status: account.status,
      canAccessAiFeatures,
      isSuspended: account.status === BillingAccountStatus.suspended,
      seatCount: account.seatCount,
    };
  }

  async isStudentSubscribedToSubject(
    studentId: string,
    subjectId: string,
    orgId: string,
  ): Promise<boolean> {
    const subscriptions = await this.subscriptionRepository.findByStudentId(studentId);
    return subscriptions.some(
      (s) =>
        s.orgId === orgId &&
        s.subjectId === subjectId &&
        s.status === 'active' &&
        s.currentPeriodEnd > new Date(),
    );
  }

  async getActiveSubscription(
    parentId: string,
    studentId: string,
    subjectId: string,
    orgId: string,
  ): Promise<SharedParentSubscriptionDto | null> {
    const subscription = await this.subscriptionRepository.findActiveSubscription(
      parentId,
      studentId,
      subjectId,
      orgId,
    );

    if (!subscription || subscription.currentPeriodEnd <= new Date()) {
      return null;
    }

    return {
      id: subscription.id.toString(),
      orgId: subscription.orgId,
      planId: subscription.planId.toString(),
      parentId: subscription.parentId,
      studentId: subscription.studentId,
      subjectId: subscription.subjectId,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      isActive: true,
    };
  }
}
