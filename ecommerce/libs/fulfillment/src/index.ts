export { InventoryDomainEvent, InventoryItem } from '../domain/entities/inventory-item.aggregate';
export { Shipment, ShipmentDomainEvent } from '../domain/entities/shipment.aggregate';
export { InsufficientStockError, ShipmentNotFoundError } from '../domain/exceptions';
export {
  INVENTORY_REPOSITORY,
  InventoryRepository,
} from '../domain/repositories/inventory.repository';
export {
  SHIPMENT_REPOSITORY,
  ShipmentRepository,
} from '../domain/repositories/shipment.repository';
export { ShipmentStatus } from '../domain/value-objects/shipment-status.enum';
export { FulfillmentModule } from './fulfillment.module';
