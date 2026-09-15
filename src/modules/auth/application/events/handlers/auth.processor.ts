import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { IAuthAccountRepository } from '../../../domain';
import { UserCreatedEvent } from '@modules/user';

@Processor('auth-events')
export class AuthEventProcessor extends WorkerHost {
  constructor(private readonly authAccountRepository: IAuthAccountRepository) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === UserCreatedEvent.name) {
      const payload = job.data.payload as UserCreatedEvent.Payload;

      if (!payload.authAccountId) {
        return; // Not triggered by an AuthAccount creation flow
      }

      const authAccount = await this.authAccountRepository.findById(
        payload.authAccountId,
      );

      if (authAccount) {
        authAccount.linkUser(payload.userId);
        await this.authAccountRepository.save(authAccount);
      }
    }
  }
}
