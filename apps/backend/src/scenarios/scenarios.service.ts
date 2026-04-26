import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScenarioRunDto } from './dto/create-scenario-run.dto';
import { ScenarioRunResponseDto } from './dto/scenario-run-response.dto';

@Injectable()
export class ScenariosService {
  constructor(private readonly prisma: PrismaService) {}

  async run(dto: CreateScenarioRunDto): Promise<ScenarioRunResponseDto> {
    const scenarioRun = await this.prisma.scenarioRun.create({
      data: {
        type: dto.type,
        status: 'received',
        metadata: this.buildMetadata(dto.name),
      },
    });

    return ScenarioRunResponseDto.fromScenarioRun(scenarioRun);
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
}
