import { Controller, Get, Post, Body, Patch, Param, Delete, Inject } from '@nestjs/common';
import { ISheudulingUseCase, SHEUDULING_USE_CASE } from '../../aplication/interfaces/book-use-case.interface';
import { CreateSchedulingDto } from '../../aplication/dto/create-scheduling.dto';
import { UpdateSchedulingDto } from '../../aplication/dto/update-scheduling.dto';
import { Endpoint } from 'src/shared/decorator/endpoint.decorator';
import { PaginationDto } from 'src/shared/dto/pagination.dto';


@Controller('scheduling')
export class SchedulingController implements ISheudulingUseCase {
  constructor(
    @Inject(SHEUDULING_USE_CASE) private readonly schedulingService: ISheudulingUseCase,
  ) { }

  @Endpoint({
    method: 'POST',
    summary: 'Create a new book',
    route: '',
    responses: [{ status: 201, description: 'The book has been successfully created.', type: Object }],
  })
  create(@Body() createSchedulingDto: CreateSchedulingDto) {
    return this.schedulingService.create(createSchedulingDto); // Reemplaza 'userId' con el ID real del usuario autenticado
  }

  @Endpoint({
    method: 'POST',
    summary: 'List books with pagination',
    route: 'pagination',
    responses: [{ status: 200, description: 'Paginated list', type: Object }],
  })
  findAll(@Body() paginationDto: PaginationDto) {
    return this.schedulingService.findAll(paginationDto);
  }

  @Endpoint({
    method: 'GET',
    summary: 'Get a book by ID',
    route: ':id',
    responses: [{ status: 200, description: 'The found record', type: Object }],
  })
  findOne(@Param('id') id: string) {
    return this.schedulingService.findOne(id);
  }

  @Endpoint({
    method: 'PATCH',
    summary: 'Update a book by ID',
    route: ':id',
    responses: [{ status: 200, description: 'The updated record', type: Object }],
  })
  update(@Param('id') id: string, @Body() updateSchedulingDto: UpdateSchedulingDto) {
    return this.schedulingService.update(id, updateSchedulingDto);
  }


}
