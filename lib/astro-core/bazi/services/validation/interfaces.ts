/**
 * Validation Service Interfaces
 */

import { BaziInput, ValidationResult, ValidationError } from '../types';

export interface IValidationService {
  validate(input: BaziInput): Promise<ValidationResult>;
  validateQuick(input: BaziInput): ValidationResult;
  clearCache(): void;
}

export interface IValidator {
  validate(input: BaziInput): ValidationError[];
}

export class HourValidator implements IValidator {
  validate(input: BaziInput): ValidationError[] {
    const errors: ValidationError[] = [];
    if (input.hour < 0 || input.hour > 23) {
      errors.push({
        field: 'hour',
        message: 'Hour must be between 0 and 23',
        code: 'INVALID_HOUR'
      });
    }
    return errors;
  }
}