import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  BillingEvent,
  BillingEventId,
  BillingEventType,
  PaymentProvider,
} from '../../../domain';
import { BillingEvent as PrismaBillingEvent } from '@generated/prisma/client';

@Injectable()
export class BillingEventMapper implements IMapper<BillingEvent, PrismaBillingEvent> {
  toDomain(record: PrismaBillingEvent): BillingEvent {
    const metadata =
      record.metadata && typeof record.metadata === 'object'
        ? (record.metadata as Record<string, any>)
        : {};

    return BillingEvent.reconstitute({
      id: BillingEventId.from(record.id),
      orgId: record.orgId,
      subscriptionId: record.subscriptionId,
      type: record.type as BillingEventType,
      provider: record.provider as PaymentProvider,
      providerEventId: record.providerEventId,
      amount: record.amount,
      currency: record.currency,
      metadata,
      occurredAt: record.occurredAt,
      createdAt: record.createdAt,
    });
  }

  toPersistence(entity: BillingEvent): PrismaBillingEvent {
    return {
      id: entity.id.toString(),
      orgId: entity.orgId,
      subscriptionId: entity.subscriptionId,
      type: entity.type,
      provider: entity.provider,
      providerEventId: entity.providerEventId,
      amount: entity.amount,
      currency: entity.currency,
      metadata: entity.metadata,
      occurredAt: entity.occurredAt,
      createdAt: entity.createdAt,
    };
  }
}
