/**
 * Validation Service
 * 
 * Comprehensive input validation for BaZi calculations.
 * Validates dates, time, and calculation parameters.
 * 
 * @pattern Chain of Responsibility, Strategy
 * @performance O(1) for all validations
 */

import { BaziInput, ValidationResult, ValidationError } from '../types';
import { IValidationService, IValidator } from './interfaces';

/**
 * Individual validator for year
 */
class YearValidator implements IValidator {
  validate(input: BaziInput): ValidationError[] {
    const errors: ValidationError[] = [];
    const { year } = input;

    if (year === undefined || year === null) {
      errors.push({
        field: 'year',
        message: 'Year is required',
        code: 'MISSING_YEAR'
      });
    } else if (!Number.isInteger(year)) {
      errors.push({
        field: 'year',
        message: 'Year must be an integer',
        code: 'INVALID_YEAR_TYPE'
      });
    } else if (year < 1900 || year > 2100) {
      errors.push({
        field: 'year',
        message: 'Year must be between 1900 and 2100',
        code: 'YEAR_OUT_OF_RANGE'
      });
    }

    return errors;
  }
}

/**
 * Individual validator for month
 */
class MonthValidator implements IValidator {
  validate(input: BaziInput): ValidationError[] {
    const errors: ValidationError[] = [];
    const { month, isLunar } = input;

    if (month === undefined || month === null) {
      errors.push({
        field: 'month',
        message: 'Month is required',
        code: 'MISSING_MONTH'
      });
    } else if (!Number.isInteger(month)) {
      errors.push({
        field: 'month',
        message: 'Month must be an integer',
        code: 'INVALID_MONTH_TYPE'
      });
    } else if (isLunar) {
      // Lunar month validation (1-13 for leap months)
      if (month < 1 || month > 13) {
        errors.push({
          field: 'month',
          message: 'Lunar month must be between 1 and 13',
          code: 'LUNAR_MONTH_OUT_OF_RANGE'
        });
      }
    } else {
      // Solar month validation (1-12)
      if (month < 1 || month > 12) {
        errors.push({
          field: 'month',
          message: 'Month must be between 1 and 12',
          code: 'MONTH_OUT_OF_RANGE'
        });
      }
    }

    return errors;
  }
}

/**
 * Individual validator for day
 */
class DayValidator implements IValidator {
  validate(input: BaziInput): ValidationError[] {
    const errors: ValidationError[] = [];
    const { day, month, year, isLunar } = input;

    if (day === undefined || day === null) {
      errors.push({
        field: 'day',
        message: 'Day is required',
        code: 'MISSING_DAY'
      });
    } else if (!Number.isInteger(day)) {
      errors.push({
        field: 'day',
        message: 'Day must be an integer',
        code: 'INVALID_DAY_TYPE'
      });
    } else if (day < 1 || day > 31) {
      errors.push({
        field: 'day',
        message: 'Day must be between 1 and 31',
        code: 'DAY_OUT_OF_RANGE'
      });
    } else if (!isLunar && month && year) {
      // Validate day for specific month in solar calendar
      const daysInMonth = this.getDaysInMonth(year, month);
      if (day > daysInMonth) {
        errors.push({
          field: 'day',
          message: `Day must be between 1 and ${daysInMonth} for month ${month}`,
          code: 'INVALID_DAY_FOR_MONTH'
        });
      }
    }

    return errors;
  }

  private getDaysInMonth(year: number, month: number): number {
    const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    // Check for leap year
    if (month === 2 && this.isLeapYear(year)) {
      return 29;
    }
    
    return daysPerMonth[month - 1];
  }

  private isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }
}

/**
 * Individual validator for time
 */
class TimeValidator implements IValidator {
  validate(input: BaziInput): ValidationError[] {
    const errors: ValidationError[] = [];
    const { hour, minute } = input;

    // Hour validation
    if (hour === undefined || hour === null) {
      errors.push({
        field: 'hour',
        message: 'Hour is required',
        code: 'MISSING_HOUR'
      });
    } else if (!Number.isInteger(hour)) {
      errors.push({
        field: 'hour',
        message: 'Hour must be an integer',
        code: 'INVALID_HOUR_TYPE'
      });
    } else if (hour < 0 || hour > 23) {
      errors.push({
        field: 'hour',
        message: 'Hour must be between 0 and 23',
        code: 'HOUR_OUT_OF_RANGE'
      });
    }

    // Minute validation (optional but validated if provided)
    if (minute !== undefined && minute !== null) {
      if (!Number.isInteger(minute)) {
        errors.push({
          field: 'minute',
          message: 'Minute must be an integer',
          code: 'INVALID_MINUTE_TYPE'
        });
      } else if (minute < 0 || minute > 59) {
        errors.push({
          field: 'minute',
          message: 'Minute must be between 0 and 59',
          code: 'MINUTE_OUT_OF_RANGE'
        });
      }
    }

    return errors;
  }
}

/**
 * Individual validator for gender
 */
class GenderValidator implements IValidator {
  validate(input: BaziInput): ValidationError[] {
    const errors: ValidationError[] = [];
    const { gender } = input;

    if (!gender) {
      errors.push({
        field: 'gender',
        message: 'Gender is required',
        code: 'MISSING_GENDER'
      });
    } else if (gender !== 'male' && gender !== 'female') {
      errors.push({
        field: 'gender',
        message: 'Gender must be either "male" or "female"',
        code: 'INVALID_GENDER'
      });
    }

    return errors;
  }
}

/**
 * Main validation service
 */
export class ValidationService implements IValidationService {
  private validators: IValidator[] = [];
  private cache = new Map<string, ValidationResult>();

  constructor() {
    // Initialize validators
    this.validators = [
      new YearValidator(),
      new MonthValidator(),
      new DayValidator(),
      new TimeValidator(),
      new GenderValidator()
    ];
  }

  /**
   * Validate input using all validators
   */
  async validate(input: BaziInput): Promise<ValidationResult> {
    // Check cache
    const cacheKey = this.getCacheKey(input);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Run all validators
    const allErrors: ValidationError[] = [];
    
    for (const validator of this.validators) {
      const errors = validator.validate(input);
      allErrors.push(...errors);
    }

    // Additional cross-field validation
    const crossFieldErrors = this.validateCrossFields(input);
    allErrors.push(...crossFieldErrors);

    const result: ValidationResult = {
      isValid: allErrors.length === 0,
      errors: allErrors.map(e => e.message),
      errorDetails: allErrors
    };

    // Cache result
    this.cache.set(cacheKey, result);

    return result;
  }

  /**
   * Quick validation without caching
   */
  validateQuick(input: BaziInput): ValidationResult {
    const allErrors: ValidationError[] = [];
    
    // Only run essential validators
    const essentialValidators = [
      new YearValidator(),
      new MonthValidator(),
      new DayValidator(),
      new TimeValidator()
    ];

    for (const validator of essentialValidators) {
      const errors = validator.validate(input);
      allErrors.push(...errors);
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors.map(e => e.message),
      errorDetails: allErrors
    };
  }

  /**
   * Validate cross-field relationships
   */
  private validateCrossFields(input: BaziInput): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate date combination
    if (input.year && input.month && input.day) {
      try {
        const date = new Date(input.year, input.month - 1, input.day);
        if (date.getFullYear() !== input.year || 
            date.getMonth() !== input.month - 1 || 
            date.getDate() !== input.day) {
          errors.push({
            field: 'date',
            message: 'Invalid date combination',
            code: 'INVALID_DATE'
          });
        }
      } catch {
        errors.push({
          field: 'date',
          message: 'Invalid date combination',
          code: 'INVALID_DATE'
        });
      }
    }

    return errors;
  }

  /**
   * Generate cache key
   */
  private getCacheKey(input: BaziInput): string {
    return JSON.stringify({
      y: input.year,
      m: input.month,
      d: input.day,
      h: input.hour,
      mi: input.minute,
      g: input.gender,
      l: input.isLunar
    });
  }

  /**
   * Clear validation cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Add custom validator
   */
  addValidator(validator: IValidator): void {
    this.validators.push(validator);
  }

  /**
   * Remove validator
   */
  removeValidator(validator: IValidator): void {
    const index = this.validators.indexOf(validator);
    if (index > -1) {
      this.validators.splice(index, 1);
    }
  }
}