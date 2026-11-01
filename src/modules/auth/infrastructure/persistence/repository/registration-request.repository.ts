import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import { RegistrationRequest } from '../../../domain/model/RegistrationRequest';
import { RegistrationRequestId } from '../../../domain/value-objects/registration-request-id.vo';
import { IRegistrationRequestRepository } from '../../../domain/repository/registration-request.repository';
import { RegistrationRequest as PrismaRegistrationRequestRecord } from '@generated/prisma/client';
import { RegistrationRequestMapper } from '../mappers/registration-request.mapper';

@Injectable()
export class PrismaRegistrationRequestRepository
  extends PrismaBaseRepository<RegistrationRequestId, RegistrationRequest, PrismaRegistrationRequestRecord>
  implements IRegistrationRequestRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly registrationRequestMapper: RegistrationRequestMapper,
  ) {
    super(prisma, registrationRequestMapper);
  }

  protected get delegate() {
    return this.prisma.registrationRequest;
  }

  async findByEmail(email: string): Promise<RegistrationRequest | null> {
    const record = await this.delegate.findFirst({
      where: { email: email.trim().toLowerCase() },
    });
    return record ? this.mapper.toDomain(record) : null;
  }
}
