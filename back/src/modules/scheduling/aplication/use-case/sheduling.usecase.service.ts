import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ISheudulingUseCase } from '../interfaces/book-use-case.interface';

import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { IPaginatedResult } from 'src/shared/interfaces/pagination.interface';

import { RedisCacheService } from 'src/shared/db/redis/redis-cache.service';
import { BOOK_CACHE_KEYS } from 'src/shared/db/redis/constants/cache-keys';
import { UpdateSchedulingDto } from '../dto/update-scheduling.dto';
import { SheudulingModel, Status } from '../../domain/model/sheduling.model';
import { CreateSchedulingDto } from '../dto/create-scheduling.dto';
import { IShedulingRepository, SHEDULING_REPOSITORY } from '../../domain/repository/sheduling.repository.interface';
import { IPlateValidationStrategy, PLATE_VALIDATION_STRATEGY } from '../../domain/validators/plate-validation.strategy';

const VALID_TRANSITIONS: Partial<Record<Status, Status>> = {
  [Status.IN_PROGRESS]: Status.PENDING,
  [Status.DELIVERED]: Status.IN_PROGRESS,
};

const TRANSITION_ERROR: Partial<Record<Status, string>> = {
  [Status.IN_PROGRESS]: 'Solo se puede marcar en progreso si está pendiente',
  [Status.DELIVERED]: 'Solo se puede marcar como entregado si está en progreso',
};

@Injectable()
export class SchedulingUseCaseService implements ISheudulingUseCase {
  constructor(
    @Inject(SHEDULING_REPOSITORY) private readonly schedulingRepository: IShedulingRepository,
    private readonly cacheService: RedisCacheService,
    @Inject(PLATE_VALIDATION_STRATEGY) private readonly plateStrategy: IPlateValidationStrategy,
  ) {

  }
  async create(dto: CreateSchedulingDto): Promise<{ message: string; }> {
    if (!this.plateStrategy.validate(dto.plates)) {
      throw new BadRequestException('Formato de placa inválido');
    }
    await this.cacheService.deleteByPattern(`${BOOK_CACHE_KEYS.PATTERN_ALL}`);
    return this.schedulingRepository.create(dto);
  }
  async findAll(paginationDto: PaginationDto): Promise<IPaginatedResult<SheudulingModel>> {
    const cached = await this.cacheService.get<SheudulingModel[]>(`${BOOK_CACHE_KEYS.FIND_ALL}_${JSON.stringify(paginationDto)}`);
    if (cached) {
      return cached as unknown as IPaginatedResult<SheudulingModel>;
    }
    const schedulings = await this.schedulingRepository.findAll(paginationDto);
    await this.cacheService.set(`${BOOK_CACHE_KEYS.FIND_ALL}_${JSON.stringify(paginationDto)}`, schedulings);
    return schedulings;
  }
  findOne(id: string): Promise<SheudulingModel | null> {
    return this.schedulingRepository.findOne(id);
  }
  async update(id: string, dto: UpdateSchedulingDto): Promise<{ message: string; }> {

    const scheduling = await this.schedulingRepository.findOne(id);

    if (!scheduling) {
      throw new NotFoundException(`programación con id ${id} no encontrada`);
    }
    if (dto.status) {
      const requiredStatus = VALID_TRANSITIONS[dto.status];
      if (requiredStatus && scheduling.status !== requiredStatus) {
        throw new BadRequestException(TRANSITION_ERROR[dto.status]);
      }
    }


    await this.cacheService.deleteByPattern(`${BOOK_CACHE_KEYS.PATTERN_ALL}`);
    return this.schedulingRepository.update(id, dto);
  }
  // async remove(id: string): Promise<{ message: string; }> {
  //   const scheduling = await this.schedulingRepository.findOne(id);
  //   if (!scheduling) {
  //     throw new NotFoundException(`Scheduling with id ${id} not found`);
  //   }
  //   await this.cacheService.deleteByPattern(`${BOOK_CACHE_KEYS.PATTERN_ALL}`);
  //   return this.schedulingRepository.remove(id);
  // }

}
