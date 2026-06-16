export class ShipmentNotFoundError extends Error {
  constructor(id: string) {
    super(`Shipment ${id} not found`);
    this.name = 'ShipmentNotFoundError';
  }
}

export class InsufficientStockError extends Error {
  constructor(productId: string, requested: number, available: number) {
    super(`Insufficient stock for ${productId}: requested ${requested}, available ${available}`);
    this.name = 'InsufficientStockError';
  }
}
