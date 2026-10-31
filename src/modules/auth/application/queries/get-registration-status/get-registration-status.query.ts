import { Query } from '@nestjs/cqrs';
import { GetRegistrationStatusPayload, RegistrationStatusDTO } from './get-registration-status.payload';

export class GetRegistrationStatusQuery extends Query<RegistrationStatusDTO> {
  constructor(public readonly payload: GetRegistrationStatusPayload) {
    super();
  }
}
