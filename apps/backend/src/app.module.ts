import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ScenariosModule } from './scenarios/scenarios.module';

@Module({
  imports: [PrismaModule, ScenariosModule],
  controllers: [HealthController],
})
export class AppModule {}
