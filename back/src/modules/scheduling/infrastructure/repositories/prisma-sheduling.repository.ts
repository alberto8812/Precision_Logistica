import { BadRequestException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";


import { PrismaService } from "src/shared/db/postgres/prisma-manager.service";
import { PaginationDto } from "src/shared/dto/pagination.dto";
import { IFilter, IPaginatedResult } from "src/shared/interfaces/pagination.interface";
import { Prisma, sheuduling as PrismaSheuduling } from 'generated/prisma/client'
import { CreateSheuduling, SheudulingModel, Status, UpdateSheuduling } from "../../domain/model/sheduling.model";
import { IShedulingRepository } from "../../domain/repository/sheduling.repository.interface";
@Injectable()
export class PrismaSheudulingRepository implements IShedulingRepository {
    private readonly logger = new Logger(PrismaSheudulingRepository.name);
    constructor(
        private readonly prisma: PrismaService,
    ) { }
    async findAll(paginationDto: PaginationDto): Promise<IPaginatedResult<SheudulingModel>> {
        const { afterCursor, beforeCursor, search, filters } = paginationDto;

        const limit = paginationDto.limit || 10;
        const filterConditions =
            filters && filters.length > 0 ? this.buildPrismaFilter(filters) : {};

        const searchCondition: Prisma.sheudulingWhereInput = search
            ? {
                OR: [
                    { driverName: { contains: search, mode: 'insensitive' } },
                    { plates: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {};

        let whereCondition: Prisma.sheudulingWhereInput = {};
        let orderBy: Prisma.sheudulingOrderByWithRelationInput[] = [
            { createdAt: 'desc' },
            { id: 'desc' },
        ];

        if (afterCursor) {
            const cursorDate = await this.getCursorDate(afterCursor);
            whereCondition = {
                OR: [
                    { createdAt: { lt: cursorDate } },
                    {
                        createdAt: cursorDate,
                        id: { lt: afterCursor },
                    },
                ],
            };
        } else if (beforeCursor) {
            const cursorDate = await this.getCursorDate(beforeCursor);
            whereCondition = {
                OR: [
                    { createdAt: { gt: cursorDate } },
                    {
                        createdAt: cursorDate,
                        id: { gt: beforeCursor },
                    },
                ],
            };
            orderBy = [{ createdAt: 'asc' }, { id: 'asc' }];
        }

        const hasWhereCondition = Object.keys(whereCondition).length > 0;
        const hasFilterConditions = Object.keys(filterConditions).length > 0;
        const hasSearchCondition = Object.keys(searchCondition).length > 0;

        const conditions: Prisma.sheudulingWhereInput[] = [];
        if (hasWhereCondition) conditions.push(whereCondition);
        if (hasFilterConditions) conditions.push(filterConditions);
        if (hasSearchCondition) conditions.push(searchCondition);

        const finalWhere: Prisma.sheudulingWhereInput | undefined =
            conditions.length > 0 ? { AND: conditions } : undefined;

        const books = await this.prisma.sheuduling.findMany({
            take: limit + 1,
            where: finalWhere,
            orderBy,
        });

        const hasNextPage = beforeCursor
            ? !!(afterCursor || beforeCursor)
            : books.length > limit;
        const hasPreviousPage = beforeCursor
            ? books.length > limit
            : !!(afterCursor || beforeCursor);

        const data =
            hasNextPage && books.length !== limit
                ? books.slice(0, -1)
                : books;

        const result: SheudulingModel[] = data.map((record: PrismaSheuduling) =>
            this.mapToModel(record),
        );

        const startCursor = beforeCursor
            ? data.length > 0
                ? data[data.length - 1].id
                : undefined
            : data.length > 0
                ? data[0].id
                : undefined;

        const endCursor = beforeCursor
            ? data.length > 0
                ? data[0].id
                : undefined
            : data.length > 0
                ? data[data.length - 1].id
                : undefined;

        return {
            data: result,
            pageInfo: {
                limit,
                hasNextPage,
                hasPreviousPage,
                startCursor,
                endCursor,
            },
        };
    }
    async create(dto: CreateSheuduling): Promise<{ message: string; }> {
        try {

            // 1 valida si el libro ya existe
            const exist = await this.findbyTitle(dto.programingDate);
            if (exist) {
                throw new BadRequestException(`the transport was already scheduled for the date ${dto.programingDate}`);
            }

            // 2. mapper los datos
            const newSheuduling = this.mapperToPrismaModel(dto)
            // 2 si no existe lo crea

            const createdSheuduling = await this.prisma.sheuduling.create({
                data: {
                    ...newSheuduling,
                }

            });
            return {
                message: `Sheuduling with id ${createdSheuduling.id} created successfully`
            };
        } catch (error) {
            this.handleDBEceptions(error);
        }
    }
    async update(id: string, dto: UpdateSheuduling): Promise<{ message: string; }> {

        try {
            await this.prisma.sheuduling.update({
                where: { id },
                data: {
                    driverName: dto.driverName,
                    plates: dto.plates,
                    programingDate: dto.programingDate ? new Date(dto.programingDate) : undefined,
                    status: dto.status === Status.PENDING ? 'PENDING' as const : dto.status === Status.IN_PROGRESS ? 'IN_PROGRESS' as const : 'DELIVERED' as const,
                }
            });
            return {
                message: `Sheuduling with id ${id} updated successfully`
            };
        } catch (error) {
            this.handleDBEceptions(error);
        }
    }


    async findOne(id: string): Promise<SheudulingModel> {
        try {
            const book = await this.prisma.sheuduling.findUnique({
                where: { id },
            });
            if (!book) {
                throw new BadRequestException(`Book with id ${id} not found`);
            }
            return this.mapToModel(book);
        } catch (error) {
            this.logger.error(`Error finding book with id ${id}`, error);
            this.handleDBEceptions(error);
        }
    }

    async remove(id: string): Promise<{ message: string; }> {
        try {
            await this.prisma.sheuduling.delete({
                where: { id },
            });
            return {
                message: `Sheuduling with id ${id} deleted successfully`
            };
        } catch (error) {
            this.logger.error(`Error deleting Sheuduling with id ${id}`, error);
            this.handleDBEceptions(error);
        }
    }

    private async getCursorDate(cursor: string): Promise<Date> {
        const record = await this.prisma.sheuduling.findUnique({
            where: { id: cursor },
            select: { createdAt: true },
        });
        return record?.createdAt || new Date();
    }

    private async findbyTitle(title: string): Promise<SheudulingModel | null> {
        try {

            const book = await this.prisma.sheuduling.findFirst({
                where: {
                    programingDate: new Date(title)
                }
            })
            if (book) {
                return {
                    id: book.id,
                    driverName: book.driverName,
                    plates: book.plates,
                    programingDate: book.programingDate.toISOString(),
                    status: book.status === 'PENDING' ? Status.PENDING : book.status === 'IN_PROGRESS' ? Status.IN_PROGRESS : Status.DELIVERED

                }
            }
            return null;
        } catch (error) {
            this.logger.error('Error finding book by title', error);
            throw new InternalServerErrorException('Unexpected error, check server log');
        }

    }
    private handleDBEceptions(error: any): never {
        if (error.code === 11000) {
            throw new BadRequestException(error.errorResponse.errmsg);
        }
        this.logger.error(error);
        throw new InternalServerErrorException(
            'Unexpected error, check server log',
        );
    }

    // Mapear del model de dominio al model de Prisma
    private mapperToPrismaModel(book: CreateSheuduling): Prisma.sheudulingCreateInput {
        return {
            driverName: book.driverName,
            plates: book.plates,
            programingDate: new Date(book.programingDate),
            status: book.status === Status.PENDING ? 'PENDING' as const : book.status === Status.IN_PROGRESS ? 'IN_PROGRESS' as const : 'DELIVERED' as const,
            date: new Date(),

        };
    }

    private buildPrismaFilter(filters: IFilter[] = []): Prisma.sheudulingWhereInput {
        const prismaFilters: Record<
            string,
            | Prisma.StringFilter
            | Record<string, unknown>
        > = {};

        const filterSelection: Record<
            string,
            (field: string, value: string) => void
        > = {
            contains: (field, value) => {
                prismaFilters[field] = { contains: value, mode: 'insensitive' };
            },
            in: (field, value) => {
                prismaFilters[field] = {
                    in: Array.isArray(value) ? value : [value],
                };
            },
            gt: (field, value) => {
                prismaFilters[field] = { gt: value };
            },
            lt: (field, value) => {
                prismaFilters[field] = { lt: value };
            },
            df: (field, value) => {
                prismaFilters[field] = { equals: value };
            },
        };

        for (const element of filters) {
            const { field, Value } = element;
            const operator = element.operator ?? 'df';
            const handler = filterSelection[operator] ?? filterSelection['df'];
            handler(field, Value);
        }

        return prismaFilters as Prisma.sheudulingWhereInput;
    }

    private mapToModel(record: PrismaSheuduling): SheudulingModel {
        const status = record.status === 'PENDING' ? Status.PENDING : record.status === 'IN_PROGRESS' ? Status.IN_PROGRESS : Status.DELIVERED;
        return {
            id: record.id,
            driverName: record.driverName,
            plates: record.plates,
            programingDate: record.programingDate.toISOString(),
            status
        };
    }
}