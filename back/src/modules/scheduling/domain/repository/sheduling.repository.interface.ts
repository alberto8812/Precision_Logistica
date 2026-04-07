import { PaginationDto } from "src/shared/dto/pagination.dto";
import { IPaginatedResult } from "src/shared/interfaces/pagination.interface";
import { CreateSheuduling, SheudulingModel, UpdateSheuduling } from "../model/sheduling.model";


export interface IShedulingRepository {
    create(dto: CreateSheuduling): Promise<{ message: string }>;
    findAll(
        paginationDto: PaginationDto,
    ): Promise<IPaginatedResult<SheudulingModel>>;
    findOne(id: string): Promise<SheudulingModel | null>;
    update(id: string, dto: UpdateSheuduling): Promise<{ message: string }>;
}

export const SHEDULING_REPOSITORY = Symbol('ShedulingRepository');