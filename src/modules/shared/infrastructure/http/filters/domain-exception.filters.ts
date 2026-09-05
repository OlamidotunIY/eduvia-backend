import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { BusinessRuleViolationError } from '../../../domain/errors/business-rule-violation-error';
import { ConflictError } from '../../../domain/errors/conflict-error';
import { DomainError } from '../../../domain/errors/domain-error';
import { InvalidDomainArgumentError } from '../../../domain/errors/invalid-domain-error-argument';
import { NotFoundError } from '../../../domain/errors/not-found.error';

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter<DomainError> {
  catch(error: DomainError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse();

    const statusCode = this.getStatusCode(error);

    response.status(statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details !== undefined && {
          details: error.details,
        }),
      },
    });
  }

  private getStatusCode(error: DomainError): number {
    if (error instanceof ConflictError) {
      return 409;
    }

    if (error instanceof NotFoundError) {
      return 404;
    }

    if (error instanceof InvalidDomainArgumentError) {
      return 400;
    }

    if (error instanceof BusinessRuleViolationError) {
      return 422;
    }

    return 400;
  }
}
