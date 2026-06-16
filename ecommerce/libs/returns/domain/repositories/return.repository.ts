import type { Return as ReturnAggregate } from '../entities/return.aggregate';

export interface ReturnRepository {
  findById(id: string): Promise<ReturnAggregate | null>;
  save(ret: ReturnAggregate): Promise<void>;
}

export const RETURN_REPOSITORY = Symbol('ReturnRepository');
