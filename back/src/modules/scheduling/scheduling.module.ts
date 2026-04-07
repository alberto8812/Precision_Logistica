import { Module } from '@nestjs/common';
import { SchedulingController } from './infrastructure/controlers/scheduling.controller';
import { SchedulingUseCaseService } from './aplication/use-case/sheduling.usecase.service';
import { PrismaSheudulingRepository } from './infrastructure/repositories/prisma-sheduling.repository';
import { SHEUDULING_USE_CASE } from './aplication/interfaces/book-use-case.interface';
import { SHEDULING_REPOSITORY } from './domain/repository/sheduling.repository.interface';
import { PLATE_VALIDATION_STRATEGY } from './domain/validators/plate-validation.strategy';
import { ColombianPlateStrategy } from './domain/validators/colombian-plate.strategy';

@Module({
  controllers: [SchedulingController],
  providers: [
    {
      provide: SHEDULING_REPOSITORY,
      useClass: PrismaSheudulingRepository,
    },
    {
      provide: SHEUDULING_USE_CASE,
      useClass: SchedulingUseCaseService,
    },
    {
      provide: PLATE_VALIDATION_STRATEGY,
      useClass: ColombianPlateStrategy,
    },
  ],
})
export class SchedulingModule {}
