import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateScenarioRunDto {
  @ApiProperty({
    example: 'success',
    description: 'Scenario type. PRD 001 keeps this flexible; PRD 002 defines concrete types.',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  type!: string;

  @ApiPropertyOptional({ example: 'Smoke test from README' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;
}
