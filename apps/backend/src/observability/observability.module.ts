import { Module } from '@nestjs/common';
import { AppLoggerService } from './app-logger.service';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { SentryService } from './sentry.service';

@Module({
  controllers: [MetricsController],
  providers: [AppLoggerService, MetricsService, SentryService],
  exports: [AppLoggerService, MetricsService, SentryService],
})
export class ObservabilityModule {}
