import type { InventoryItem } from '../entities/inventory-item.aggregate';

export interface InventoryRepository {
  findByProductId(productId: string): Promise<InventoryItem | null>;
  save(item: InventoryItem): Promise<void>;
}

export const INVENTORY_REPOSITORY = Symbol('InventoryRepository');
