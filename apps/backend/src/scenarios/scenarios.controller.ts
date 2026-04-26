import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateScenarioRunDto } from './dto/create-scenario-run.dto';
import { ScenarioRunResponseDto } from './dto/scenario-run-response.dto';
import { ScenariosService } from './scenarios.service';

@ApiTags('scenarios')
@Controller('scenarios')
export class ScenariosController {
  constructor(private readonly scenariosService: ScenariosService) {}

  @Post('run')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ScenarioRunResponseDto })
  runScenario(
    @Body() dto: CreateScenarioRunDto,
  ): Promise<ScenarioRunResponseDto> {
    return this.scenariosService.run(dto);
  }

  @Get()
  @ApiOkResponse({ type: ScenarioRunResponseDto, isArray: true })
  listScenarios(): Promise<ScenarioRunResponseDto[]> {
    return this.scenariosService.findLatest();
  }
}
