export interface InventoryReservedEvent {
  readonly type: 'InventoryReserved';
  readonly productId: string;
  readonly orderId: string;
  readonly quantity: number;
  readonly timestamp: string;
}

export type InventoryDomainEvent = InventoryReservedEvent;

/** Inventory aggregate. Enforces "don't sell what we don't have". */
export class InventoryItem {
  private _domainEvents: InventoryDomainEvent[] = [];

  constructor(
    public readonly productId: string,
    private _availableQuantity: number,
    private _reservedQuantity: number = 0,
  ) {}

  get availableQuantity(): number {
    return this._availableQuantity;
  }
  get reservedQuantity(): number {
    return this._reservedQuantity;
  }
  get domainEvents(): readonly InventoryDomainEvent[] {
    return this._domainEvents;
  }

  reserve(orderId: string, quantity: number): void {
    if (quantity <= 0) throw new Error('Quantity to reserve must be positive');
    if (this._availableQuantity < quantity) {
      throw new Error(
        `Insufficient stock for ${this.productId}: requested ${quantity}, available ${this._availableQuantity}`,
      );
    }
    this._availableQuantity -= quantity;
    this._reservedQuantity += quantity;
    this.recordEvent({
      type: 'InventoryReserved',
      productId: this.productId,
      orderId,
      quantity,
      timestamp: new Date().toISOString(),
    });
  }

  private recordEvent(event: InventoryDomainEvent): void {
    this._domainEvents.push(event);
  }
}
