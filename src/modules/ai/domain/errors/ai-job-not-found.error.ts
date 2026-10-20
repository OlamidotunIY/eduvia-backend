import { NotFoundError } from '@modules/shared/domain';

export class AiJobNotFoundError extends NotFoundError {
  constructor(jobId: string) {
    super(`AIJob '${jobId}' was not found.`);
  }
}
