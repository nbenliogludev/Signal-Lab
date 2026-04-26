import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CreateScenarioRunDto } from './dto/create-scenario-run.dto';
import {
  ScenarioRunResponseDto,
  TeapotResponseDto,
} from './dto/scenario-run-response.dto';
import { ScenariosService } from './scenarios.service';

@ApiTags('scenarios')
@Controller('scenarios')
export class ScenariosController {
  constructor(private readonly scenariosService: ScenariosService) {}

  @Post('run')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ScenarioRunResponseDto })
  @ApiResponse({ status: 418, type: TeapotResponseDto })
  runScenario(
    @Body() dto: CreateScenarioRunDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ScenarioRunResponseDto | TeapotResponseDto> {
    return this.scenariosService.run(dto, response);
  }

  @Get()
  @ApiOkResponse({ type: ScenarioRunResponseDto, isArray: true })
  listScenarios(): Promise<ScenarioRunResponseDto[]> {
    return this.scenariosService.findLatest();
  }
}
