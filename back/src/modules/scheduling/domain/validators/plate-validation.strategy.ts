export interface IPlateValidationStrategy {
  validate(plate: string): boolean;
}
export const PLATE_VALIDATION_STRATEGY = Symbol('PLATE_VALIDATION_STRATEGY');
