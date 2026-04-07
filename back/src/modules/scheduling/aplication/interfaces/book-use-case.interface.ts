
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { IPaginatedResult } from 'src/shared/interfaces/pagination.interface';
import { CreateSchedulingDto } from '../dto/create-scheduling.dto';
import { SheudulingModel } from '../../domain/model/sheduling.model';
import { UpdateSchedulingDto } from '../dto/update-scheduling.dto';

export interface ISheudulingUseCase {
  create(dto: CreateSchedulingDto): Promise<{ message: string }>;
  findAll(
    paginationDto: PaginationDto,
  ): Promise<IPaginatedResult<SheudulingModel>>;
  findOne(id: string): Promise<SheudulingModel | null>;
  update(id: string, dto: UpdateSchedulingDto): Promise<{ message: string }>;
  //remove(id: string): Promise<{ message: string }>;
}

export const SHEUDULING_USE_CASE = Symbol('SHEUDULING_USE_CASE');
