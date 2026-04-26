import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import {
  collectDefaultMetrics,
  Counter,
  Histogram,
  Registry,
} from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry = new Registry();
  private readonly scenarioRunsTotal = new Counter({
    name: 'scenario_runs_total',
    help: 'Total number of scenario runs by type and status.',
    labelNames: ['type', 'status'] as const,
    registers: [this.registry],
  });
  private readonly scenarioRunDurationSeconds = new Histogram({
    name: 'scenario_run_duration_seconds',
    help: 'Scenario run duration in seconds by scenario type.',
    labelNames: ['type'] as const,
    buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 3, 5, 8],
    registers: [this.registry],
  });
  private readonly httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests by method, path, and status code.',
    labelNames: ['method', 'path', 'status_code'] as const,
    registers: [this.registry],
  });

  constructor() {
    collectDefaultMetrics({
      register: this.registry,
      prefix: 'signal_lab_',
    });
  }

  recordScenarioRun(type: string, status: string, durationMs: number): void {
    this.scenarioRunsTotal.inc({ type, status });
    this.scenarioRunDurationSeconds.observe({ type }, durationMs / 1000);
  }

  createHttpMetricsMiddleware(): NestMiddleware['use'] {
    return (request: Request, response: Response, next: NextFunction): void => {
      response.on('finish', () => {
        this.httpRequestsTotal.inc({
          method: request.method,
          path: this.normalizePath(request),
          status_code: String(response.statusCode),
        });
      });

      next();
    };
  }

  getContentType(): string {
    return this.registry.contentType;
  }

  getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  private normalizePath(request: Request): string {
    const routePath =
      typeof request.route?.path === 'string' ? request.route.path : request.path;

    return `${request.baseUrl}${routePath}` || request.path;
  }
}
