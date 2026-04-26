import { Injectable } from '@nestjs/common';
import * as Sentry from '@sentry/node';

interface CaptureOptions {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

@Injectable()
export class SentryService {
  private readonly enabled: boolean;

  constructor() {
    const dsn = process.env.SENTRY_DSN;
    this.enabled = Boolean(dsn && !dsn.includes('examplePublicKey'));

    if (this.enabled) {
      Sentry.init({
        dsn,
        environment: process.env.SENTRY_ENVIRONMENT ?? 'development',
        tracesSampleRate: 0,
      });
    }
  }

  addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
    if (!this.enabled) {
      return;
    }

    Sentry.addBreadcrumb(breadcrumb);
  }

  captureException(exception: unknown, options: CaptureOptions = {}): void {
    if (!this.enabled) {
      return;
    }

    Sentry.withScope((scope) => {
      for (const [key, value] of Object.entries(options.tags ?? {})) {
        scope.setTag(key, value);
      }

      for (const [key, value] of Object.entries(options.extra ?? {})) {
        scope.setExtra(key, value);
      }

      Sentry.captureException(exception);
    });
  }
}
