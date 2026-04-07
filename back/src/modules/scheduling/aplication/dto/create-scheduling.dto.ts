import { IsEnum, IsString } from "class-validator";
import { Status } from "../../domain/model/sheduling.model";
import { ApiProperty } from "@nestjs/swagger";

export class CreateSchedulingDto {

    @ApiProperty({ description: 'Nombre del conductor', example: 'Juan Pérez' })
    @IsString({ message: 'El nombre del conductor debe ser una cadena de texto' })
    driverName: string;

    @ApiProperty({ description: 'Placas del vehículo', example: 'ABC-123' })
    @IsString({ message: 'Las placas deben ser una cadena de texto' })
    plates: string;

    @ApiProperty({ description: 'Fecha de programación', example: '2024-06-01' })
    @IsString({ message: 'La fecha de programación debe ser una cadena de texto' })
    programingDate: string;

    @ApiProperty({ description: 'Estado de la programación', example: 'PENDING' })
    @IsEnum(Status, { message: 'El estado debe ser PENDING, IN_PROGRESS o DELIVERED' })
    status: Status
}
