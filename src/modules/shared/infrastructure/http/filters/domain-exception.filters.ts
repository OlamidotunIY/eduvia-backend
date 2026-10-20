import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { BadRequestError, BusinessRuleViolationError, ConflictError, DomainError, ForbiddenError, NotFoundError } from '../../../domain';

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

    if (error instanceof BadRequestError) {
      return 400;
    }

    if (error instanceof BusinessRuleViolationError) {
      return 422;
    }

    if (error instanceof ForbiddenError) {
      return 403;
    }

    return 400;
  }
}
