import { Module } from '@nestjs/common';
import { ObservabilityModule } from '../observability/observability.module';
import { ScenariosController } from './scenarios.controller';
import { ScenariosService } from './scenarios.service';

@Module({
  imports: [ObservabilityModule],
  controllers: [ScenariosController],
  providers: [ScenariosService],
})
export class ScenariosModule {}
