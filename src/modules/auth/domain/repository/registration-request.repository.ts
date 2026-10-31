import { BaseRepository } from '@modules/shared';
import { RegistrationRequest } from '../model/RegistrationRequest';
import { RegistrationRequestId } from '../value-objects/registration-request-id.vo';

export abstract class IRegistrationRequestRepository extends BaseRepository<RegistrationRequest, RegistrationRequestId> {
  abstract findByEmail(email: string): Promise<RegistrationRequest | null>;
}
