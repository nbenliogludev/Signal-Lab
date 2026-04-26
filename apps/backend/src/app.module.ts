import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { ObservabilityModule } from './observability/observability.module';
import { PrismaModule } from './prisma/prisma.module';
import { ScenariosModule } from './scenarios/scenarios.module';

@Module({
  imports: [PrismaModule, ObservabilityModule, ScenariosModule],
  controllers: [HealthController],
})
export class AppModule {}
