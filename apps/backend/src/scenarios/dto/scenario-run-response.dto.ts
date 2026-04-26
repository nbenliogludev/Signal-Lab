import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScenarioRun } from '../../../generated/prisma';

export class ScenarioRunResponseDto {
  @ApiProperty({ example: 'clwz8n8gh0000uv3k3c2id0pk' })
  id!: string;

  @ApiProperty({ example: 'success' })
  type!: string;

  @ApiProperty({ example: 'received' })
  status!: string;

  @ApiPropertyOptional({ example: 120 })
  duration?: number;

  @ApiPropertyOptional({ example: 'Synthetic error message' })
  error?: string;

  @ApiPropertyOptional({ example: { name: 'Smoke test from README' } })
  metadata?: unknown;

  @ApiProperty({ example: '2026-04-26T12:00:00.000Z' })
  createdAt!: string;

  static fromScenarioRun(scenarioRun: ScenarioRun): ScenarioRunResponseDto {
    return {
      id: scenarioRun.id,
      type: scenarioRun.type,
      status: scenarioRun.status,
      duration: scenarioRun.duration ?? undefined,
      error: scenarioRun.error ?? undefined,
      metadata: scenarioRun.metadata ?? undefined,
      createdAt: scenarioRun.createdAt.toISOString(),
    };
  }
}

export class TeapotResponseDto {
  @ApiProperty({ example: 42 })
  signal!: 42;

  @ApiProperty({ example: "I'm a teapot" })
  message!: "I'm a teapot";
}
