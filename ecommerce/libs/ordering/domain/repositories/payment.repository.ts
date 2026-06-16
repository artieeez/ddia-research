import type { Payment } from '../entities/payment.aggregate';

export interface PaymentRepository {
  findById(id: string): Promise<Payment | null>;
  save(payment: Payment): Promise<void>;
}

export const PAYMENT_REPOSITORY = Symbol('PaymentRepository');
