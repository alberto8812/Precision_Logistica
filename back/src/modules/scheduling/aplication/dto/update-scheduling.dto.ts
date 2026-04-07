import { PartialType } from '@nestjs/mapped-types';
import { CreateSchedulingDto } from './create-scheduling.dto';
import { Status } from '../../domain/model/sheduling.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateSchedulingDto extends PartialType(CreateSchedulingDto) {

    @ApiProperty({ description: 'Estado de la programación', example: 'PENDING' })
    @IsEnum(Status, { message: 'El estado debe ser PENDING, IN_PROGRESS o DELIVERED' })
    status: Status;
}
