import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(statusCode).json({
      statusCode,
      message: this.getMessage(exception, statusCode),
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
