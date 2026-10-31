import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetRegistrationStatusQuery } from './get-registration-status.query';
import { RegistrationStatusDTO } from './get-registration-status.payload';
import { IRegistrationRequestRepository } from '../../../domain/repository';
import { RegistrationRequestId } from '../../../domain';
import { NotFoundException } from '@nestjs/common';
import { RedisService } from '@modules/shared';
import { UnauthorizedException } from '@nestjs/common';

@QueryHandler(GetRegistrationStatusQuery)
export class GetRegistrationStatusHandler implements IQueryHandler<GetRegistrationStatusQuery, RegistrationStatusDTO> {
  constructor(
    private readonly registrationRequestRepository: IRegistrationRequestRepository,
    private readonly redis: RedisService,
  ) {}

  async execute(query: GetRegistrationStatusQuery): Promise<RegistrationStatusDTO> {
    const { payload } = query;
    const expectedContinuation = await this.redis.getClient().get(
      `auth:registration:continuation:${payload.registrationRequestId}`,
    );
    if (!expectedContinuation || expectedContinuation !== payload.registrationContinuation) {
      throw new UnauthorizedException('Registration continuation is invalid or expired');
    }
    const registrationRequest = await this.registrationRequestRepository.findById(
      RegistrationRequestId.from(payload.registrationRequestId),
    );
    if (!registrationRequest) {
      throw new NotFoundException('Registration request not found');
    }

    const result: RegistrationStatusDTO = {
      registrationRequestId: registrationRequest.getId(),
      status: registrationRequest.status,
      nextAction:
        registrationRequest.status === 'completed'
          ? registrationRequest.providerId === 'credentials'
            ? 'verify_email'
            : 'exchange_google_oauth'
          : 'wait',
    };
    if (
      registrationRequest.status === 'completed' &&
      registrationRequest.providerId === 'google'
    ) {
      const serializedSession = await this.redis.getClient().getdel(
        `auth:registration:google-session:${registrationRequest.getId()}`,
      );
      if (!serializedSession) {
        result.nextAction = 'sign_in';
      } else {
        const session = JSON.parse(serializedSession) as NonNullable<
          RegistrationStatusDTO['session']
        >;
        result.session = {
          ...session,
          accessTokenExpiresAt: new Date(session.accessTokenExpiresAt),
          refreshTokenExpiresAt: new Date(session.refreshTokenExpiresAt),
        };
      }
    }
    return result;
  }
}
