import { Injectable } from '@nestjs/common';
import { IPlateValidationStrategy } from '../../domain/validators/plate-validation.strategy';

@Injectable()
export class ColombianPlateStrategy implements IPlateValidationStrategy {
  validate(plate: string): boolean {
    return /^[A-Z]{3}\d{3}$/.test(plate);
  }
}
