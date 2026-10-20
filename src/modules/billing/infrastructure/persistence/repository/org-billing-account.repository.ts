import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  OrgBillingAccount,
  OrgBillingAccountId,
  IOrgBillingAccountRepository,
} from '../../../domain';
import { OrgBillingAccount as PrismaOrgBillingAccount } from '@generated/prisma/client';
import { OrgBillingAccountMapper } from '../mappers/org-billing-account.mapper';

@Injectable()
export class PrismaOrgBillingAccountRepository
  extends PrismaBaseRepository<OrgBillingAccountId, OrgBillingAccount, PrismaOrgBillingAccount>
  implements IOrgBillingAccountRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly accountMapper: OrgBillingAccountMapper,
  ) {
    super(prisma, accountMapper);
  }

  protected get delegate() {
    return this.prisma.orgBillingAccount;
  }

  public override async findById(id: OrgBillingAccountId | string): Promise<OrgBillingAccount | null> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    const record = await this.prisma.orgBillingAccount.findUnique({
      where: { id: rawId },
    });
    return record ? this.accountMapper.toDomain(record) : null;
  }

  public override async findAll(): Promise<OrgBillingAccount[]> {
    const records = await this.prisma.orgBillingAccount.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.accountMapper.toDomain(record));
  }

  public async findByOrgId(orgId: string): Promise<OrgBillingAccount | null> {
    const record = await this.prisma.orgBillingAccount.findUnique({
      where: { orgId },
    });
    return record ? this.accountMapper.toDomain(record) : null;
  }

  public async findByStripeCustomerId(customerId: string): Promise<OrgBillingAccount | null> {
    const record = await this.prisma.orgBillingAccount.findFirst({
      where: { stripeCustomerId: customerId },
    });
    return record ? this.accountMapper.toDomain(record) : null;
  }

  public async findByStripeAccountId(accountId: string): Promise<OrgBillingAccount | null> {
    const record = await this.prisma.orgBillingAccount.findFirst({
      where: { stripeAccountId: accountId },
    });
    return record ? this.accountMapper.toDomain(record) : null;
  }

  public override async save(entity: OrgBillingAccount): Promise<void> {
    const data = this.accountMapper.toPersistence(entity);
    const accountId = entity.id.unpack();
    const events = entity.pullDomainEvents();

    await this.prisma.$transaction(async (tx) => {
      await tx.orgBillingAccount.upsert({
        where: { id: accountId },
        create: {
          id: accountId,
          ...data,
        },
        update: data,
      });

      for (const event of events) {
        await tx.outboxMessage.create({
          data: {
            id: typeof event.eventId === 'string' ? event.eventId : String(event.eventId),
            eventId: event.eventId,
            type: event.eventName,
            aggregateType: entity.constructor.name,
            aggregateId: entity.getId(),
            payload: event.payload as object,
            correlationId: event.correlationId,
            occurredAt: event.occurredAt,
            status: 'PENDING' as any,
          },
        });
      }
    });
  }

  public override async delete(id: OrgBillingAccountId | string): Promise<void> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    await this.prisma.orgBillingAccount.delete({
      where: { id: rawId },
    });
  }
}
