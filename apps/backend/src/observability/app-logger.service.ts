import { Injectable } from '@nestjs/common';
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

type LogLevel = 'info' | 'warn' | 'error';

export type LogFields = Record<string, unknown>;

@Injectable()
export class AppLoggerService {
  private readonly app = 'signal-lab';
  private readonly service = 'backend';
  private readonly logFilePath =
    process.env.LOG_FILE_PATH ?? '/var/log/signal-lab/backend.log';

  info(message: string, context: string, fields: LogFields = {}): void {
    this.write('info', message, context, fields);
  }

  warn(message: string, context: string, fields: LogFields = {}): void {
    this.write('warn', message, context, fields);
  }

  error(message: string, context: string, fields: LogFields = {}): void {
    this.write('error', message, context, fields);
  }

  private write(
    level: LogLevel,
    message: string,
    context: string,
    fields: LogFields,
  ): void {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      app: this.app,
      service: this.service,
      ...fields,
    };
    const line = `${JSON.stringify(entry)}\n`;

    if (level === 'error') {
      console.error(line.trim());
    } else if (level === 'warn') {
      console.warn(line.trim());
    } else {
      console.log(line.trim());
    }

    try {
      mkdirSync(dirname(this.logFilePath), { recursive: true });
      appendFileSync(this.logFilePath, line);
    } catch {
      console.warn(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'warn',
          message: 'Could not write structured log file',
          context: 'AppLoggerService',
          app: this.app,
          service: this.service,
        }),
      );
    }
  }
}
