import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const scenarioTypes = [
  'success',
  'validation_error',
  'system_error',
  'slow_request',
  'teapot',
] as const;

export type ScenarioType = (typeof scenarioTypes)[number];

export class CreateScenarioRunDto {
  @ApiProperty({
    example: 'success',
    enum: scenarioTypes,
    description: 'Scenario type to execute.',
  })
  @IsIn(scenarioTypes)
  type!: ScenarioType;

  @ApiPropertyOptional({ example: 'Smoke test from README' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;
}
