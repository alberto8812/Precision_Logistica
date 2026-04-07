import { ApiProperty } from '@nestjs/swagger';

export class ExceptionResponse {
  @ApiProperty({ example: 404, description: 'HTTP-compatible status code' })
  status: number;

  @ApiProperty({ example: '001', description: 'Project-specific error code' })
  code: string;

  @ApiProperty({
    example: 'EXCEPTION-NAME',
    description: 'Name of the exception',
  })
  exception: string;

  @ApiProperty({
    description: 'Human-readable error message',
    example: 'Some error message',
  })
  detail: string;
}
