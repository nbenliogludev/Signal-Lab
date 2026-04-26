import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '../../generated/prisma';
import { AppLoggerService } from '../observability/app-logger.service';
import { MetricsService } from '../observability/metrics.service';
import { SentryService } from '../observability/sentry.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScenarioRunDto } from './dto/create-scenario-run.dto';
import {
  ScenarioRunResponseDto,
  TeapotResponseDto,
} from './dto/scenario-run-response.dto';

@Injectable()
export class ScenariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLoggerService,
    private readonly metrics: MetricsService,
    private readonly sentry: SentryService,
  ) {}

  async run(
    dto: CreateScenarioRunDto,
    response: Response,
  ): Promise<ScenarioRunResponseDto | TeapotResponseDto> {
    const startedAt = Date.now();

    switch (dto.type) {
      case 'success':
        return this.completeScenario(dto, startedAt, 'completed');
      case 'slow_request':
        return this.completeSlowScenario(dto, startedAt);
      case 'validation_error':
        return this.failValidationScenario(dto, startedAt);
      case 'system_error':
        return this.failSystemScenario(dto, startedAt);
      case 'teapot':
        response.status(418);
        return this.steepTeapotScenario(dto, startedAt);
    }
  }

  async findLatest(): Promise<ScenarioRunResponseDto[]> {
    const scenarioRuns = await this.prisma.scenarioRun.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    return scenarioRuns.map(ScenarioRunResponseDto.fromScenarioRun);
  }

  private buildMetadata(name?: string): Prisma.InputJsonValue | undefined {
    return name ? { name } : undefined;
  }

  private async completeScenario(
    dto: CreateScenarioRunDto,
    startedAt: number,
    status: 'completed' | 'slow',
  ): Promise<ScenarioRunResponseDto> {
    const duration = Date.now() - startedAt;
    const scenarioRun = await this.prisma.scenarioRun.create({
      data: {
        type: dto.type,
        status,
        duration,
        metadata: this.buildMetadata(dto.name),
      },
    });

    this.logger.info('Scenario completed', 'ScenariosService', {
      scenarioId: scenarioRun.id,
      scenarioType: dto.type,
      duration,
    });
    this.metrics.recordScenarioRun(dto.type, 'completed', duration);

    return ScenarioRunResponseDto.fromScenarioRun(scenarioRun);
  }

  private async completeSlowScenario(
    dto: CreateScenarioRunDto,
    startedAt: number,
  ): Promise<ScenarioRunResponseDto> {
    const delayMs = this.randomDelayMs();
    await this.sleep(delayMs);
    const duration = Date.now() - startedAt;
    const scenarioRun = await this.prisma.scenarioRun.create({
      data: {
        type: dto.type,
        status: 'slow',
        duration,
        metadata: {
          ...(dto.name ? { name: dto.name } : {}),
          delayMs,
        },
      },
    });

    this.logger.warn('Slow scenario completed', 'ScenariosService', {
      scenarioId: scenarioRun.id,
      scenarioType: dto.type,
      duration,
      delayMs,
    });
    this.metrics.recordScenarioRun(dto.type, 'completed', duration);

    return ScenarioRunResponseDto.fromScenarioRun(scenarioRun);
  }

  private async failValidationScenario(
    dto: CreateScenarioRunDto,
    startedAt: number,
  ): Promise<never> {
    const message =
      'Synthetic validation error triggered by validation_error scenario.';
    const duration = Date.now() - startedAt;
    const scenarioRun = await this.prisma.scenarioRun.create({
      data: {
        type: dto.type,
        status: 'validation_error',
        duration,
        error: message,
        metadata: this.buildMetadata(dto.name),
      },
    });

    this.logger.warn('Scenario rejected by validation flow', 'ScenariosService', {
      scenarioId: scenarioRun.id,
      scenarioType: dto.type,
      duration,
      error: message,
    });
    this.metrics.recordScenarioRun(dto.type, 'error', duration);
    this.sentry.addBreadcrumb({
      category: 'scenario.validation',
      message,
      level: 'warning',
      data: {
        scenarioId: scenarioRun.id,
        scenarioType: dto.type,
        duration,
      },
    });

    throw new BadRequestException(message);
  }

  private async failSystemScenario(
    dto: CreateScenarioRunDto,
    startedAt: number,
  ): Promise<never> {
    const error = new Error('Synthetic system failure triggered by system_error.');
    const duration = Date.now() - startedAt;
    const scenarioRun = await this.prisma.scenarioRun.create({
      data: {
        type: dto.type,
        status: 'error',
        duration,
        error: error.message,
        metadata: this.buildMetadata(dto.name),
      },
    });

    this.logger.error('Scenario raised a synthetic system failure', 'ScenariosService', {
      scenarioId: scenarioRun.id,
      scenarioType: dto.type,
      duration,
      error: error.message,
    });
    this.metrics.recordScenarioRun(dto.type, 'error', duration);
    this.sentry.captureException(error, {
      tags: {
        scenarioType: dto.type,
      },
      extra: {
        scenarioId: scenarioRun.id,
        duration,
        scenarioName: dto.name ?? null,
      },
    });

    throw new InternalServerErrorException(error.message);
  }

  private async steepTeapotScenario(
    dto: CreateScenarioRunDto,
    startedAt: number,
  ): Promise<TeapotResponseDto> {
    const duration = Date.now() - startedAt;
    const scenarioRun = await this.prisma.scenarioRun.create({
      data: {
        type: dto.type,
        status: 'teapot',
        duration,
        metadata: {
          ...(dto.name ? { name: dto.name } : {}),
          easter: true,
        },
      },
    });

    this.logger.info('Teapot signal emitted', 'ScenariosService', {
      scenarioId: scenarioRun.id,
      scenarioType: dto.type,
      duration,
      signal: 42,
    });
    this.metrics.recordScenarioRun(dto.type, 'teapot', duration);

    return {
      signal: 42,
      message: "I'm a teapot",
    };
  }

  private randomDelayMs(): number {
    return Math.floor(Math.random() * 3001) + 2000;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
