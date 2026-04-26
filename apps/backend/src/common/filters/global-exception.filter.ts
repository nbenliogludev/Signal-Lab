import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AppLoggerService } from '../../observability/app-logger.service';
import { SentryService } from '../../observability/sentry.service';

interface ErrorResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly sentry: SentryService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = this.getMessage(exception, statusCode);

    this.logException(exception, statusCode, message, request.url);

    response.status(statusCode).json({
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    } satisfies ErrorResponse);
  }

  private getMessage(exception: unknown, statusCode: number): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === 'string') {
        return response;
      }

      if (this.hasMessage(response)) {
        return Array.isArray(response.message)
          ? response.message.join(', ')
          : response.message;
      }
    }

    if (exception instanceof Error && statusCode >= 500) {
      return exception.message;
    }

    return 'Internal server error';
  }

  private logException(
    exception: unknown,
    statusCode: number,
    message: string,
    path: string,
  ): void {
    const extra = {
      path,
      statusCode,
      error: exception instanceof Error ? exception.message : message,
    };

    if (statusCode >= 500) {
      this.logger.error(message, 'GlobalExceptionFilter', extra);
      this.sentry.captureException(exception, {
        tags: { path },
        extra: { statusCode },
      });
      return;
    }

    this.logger.warn(message, 'GlobalExceptionFilter', extra);
  }

  private hasMessage(value: unknown): value is { message: string | string[] } {
    return (
      typeof value === 'object' &&
      value !== null &&
      'message' in value &&
      (typeof (value as { message: unknown }).message === 'string' ||
        Array.isArray((value as { message: unknown }).message))
    );
  }
}
