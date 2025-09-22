/**
 * Service Layer Type Definitions
 */

export interface BaziInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute?: number;
  gender: 'male' | 'female';
  isLunar: boolean;
  timezone?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  options?: {
    quickMode?: boolean;
    includeCapabilityAssessment?: boolean;
    includeShenSha?: boolean;
    includeMajorPeriods?: boolean;
    majorPeriodCount?: number;
  };
}

export interface BaziResult {
  fourPillars: any;
  tenGods?: any;
  majorPeriods?: any;
  naYin?: any;
  capabilityAssessment?: any;
  shenSha?: any;
  calculationTime: number;
  cacheHit: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  errorDetails?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}