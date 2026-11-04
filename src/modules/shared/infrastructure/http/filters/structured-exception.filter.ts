import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  BadRequestError,
  BusinessRuleViolationError,
  ConflictError,
  DomainError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../../../domain';

type CorrelatedRequest = Request & { correlationId?: string };

/**
 * The application-wide HTTP error boundary. It preserves public API responses
 * while emitting a structured, secret-safe record for every failed request.
 */
@Catch()
export class StructuredExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(StructuredExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<CorrelatedRequest>();
    const response = context.getResponse<Response>();
    const { statusCode, body } = this.toHttpResponse(exception);

    const log = JSON.stringify({
      event: 'http.request.failed',
      severity: statusCode >= HttpStatus.INTERNAL_SERVER_ERROR ? 'error' : 'warn',
      statusCode,
      method: request.method,
      path: request.path,
      correlationId: this.correlationId(request),
      exception: {
        name: this.exceptionName(exception),
        code: this.exceptionCode(exception),
        message: this.exceptionMessage(exception),
      },
    });

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(log, exception instanceof Error ? exception.stack : undefined);
    } else {
      this.logger.warn(log);
    }

    response.status(statusCode).json(body);
  }

  private toHttpResponse(exception: unknown): {
    statusCode: number;
    body: unknown;
  } {
    if (exception instanceof DomainError) {
      const statusCode = this.domainStatus(exception);
      return {
        statusCode,
        body: {
          success: false,
          error: {
            code: exception.code,
            message: exception.message,
            ...(exception.details !== undefined && { details: exception.details }),
          },
        },
      };
    }

    if (exception instanceof HttpException) {
      return {
        statusCode: exception.getStatus(),
        body: exception.getResponse(),
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      },
    };
  }

  private domainStatus(error: DomainError): number {
    if (error instanceof UnauthorizedError) return HttpStatus.UNAUTHORIZED;
    if (error instanceof ConflictError) return HttpStatus.CONFLICT;
    if (error instanceof NotFoundError) return HttpStatus.NOT_FOUND;
    if (error instanceof BadRequestError) return HttpStatus.BAD_REQUEST;
    if (error instanceof BusinessRuleViolationError) {
      return HttpStatus.UNPROCESSABLE_ENTITY;
    }
    if (error instanceof ForbiddenError) return HttpStatus.FORBIDDEN;
    return HttpStatus.BAD_REQUEST;
  }

  private correlationId(request: CorrelatedRequest): string | undefined {
    const header = request.headers['x-correlation-id'];
    return request.correlationId ?? (Array.isArray(header) ? header[0] : header);
  }

  private exceptionName(exception: unknown): string {
    return exception instanceof Error ? exception.name : 'UnknownException';
  }

  private exceptionCode(exception: unknown): string | undefined {
    return exception instanceof DomainError ? exception.code : undefined;
  }

  private exceptionMessage(exception: unknown): string {
    return exception instanceof Error ? exception.message : 'Unknown exception';
  }
}
