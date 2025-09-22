/**
 * Calculation Service Interfaces
 */

import { BaziInput, BaziResult } from '../types';

export interface ICalculationService {
  calculate(input: BaziInput, strategy?: string): Promise<BaziResult>;
  calculateBatch(inputs: BaziInput[]): Promise<BaziResult[]>;
}

export interface ICalculationStrategy {
  execute(input: BaziInput): Promise<BaziResult>;
  getName(): string;
}