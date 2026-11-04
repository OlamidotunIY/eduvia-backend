import { Query } from '@nestjs/cqrs';
import { GetCurrentUserBootstrapPayload, CurrentUserBootstrapDTO } from './get-current-user-bootstrap.payload';

export class GetCurrentUserBootstrapQuery extends Query<CurrentUserBootstrapDTO> {
  constructor(public readonly payload: GetCurrentUserBootstrapPayload) {
    super();
  }
}
