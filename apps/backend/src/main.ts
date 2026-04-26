import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { AppLoggerService } from './observability/app-logger.service';
import { MetricsService } from './observability/metrics.service';
import { SentryService } from './observability/sentry.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.BACKEND_PORT ?? process.env.PORT ?? 3001);
  const logger = app.get(AppLoggerService);
  const metrics = app.get(MetricsService);
  const sentry = app.get(SentryService);

  app.setGlobalPrefix('api', {
    exclude: [{ path: 'metrics', method: RequestMethod.GET }],
  });
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000',
  });
  app.use(metrics.createHttpMetricsMiddleware());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter(logger, sentry));

  const config = new DocumentBuilder()
    .setTitle('Signal Lab API')
    .setDescription('Platform foundation API for scenario runs.')
    .setVersion('0.1.0')
    .addTag('health')
    .addTag('scenarios')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port, '0.0.0.0');
  logger.info('Backend started', 'Bootstrap', { port });
}

void bootstrap();
