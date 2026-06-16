import type { Cart } from '../entities/cart.aggregate';

export interface CartRepository {
  findById(id: string): Promise<Cart | null>;
  save(cart: Cart): Promise<void>;
}

export const CART_REPOSITORY = Symbol('CartRepository');
