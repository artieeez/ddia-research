import { ShipmentStatus } from '../value-objects/shipment-status.enum';

export interface FulfillmentRequestedEvent {
  readonly type: 'FulfillmentRequested';
  readonly shipmentId: string;
  readonly orderId: string;
  readonly timestamp: string;
}
export interface OrderPickedEvent {
  readonly type: 'OrderPicked';
  readonly shipmentId: string;
  readonly orderId: string;
  readonly timestamp: string;
}
export interface OrderPackedEvent {
  readonly type: 'OrderPacked';
  readonly shipmentId: string;
  readonly orderId: string;
  readonly timestamp: string;
}
export interface OrderShippedEvent {
  readonly type: 'OrderShipped';
  readonly shipmentId: string;
  readonly orderId: string;
  readonly trackingNumber: string;
  readonly carrier: string;
  readonly timestamp: string;
}
export interface OrderDeliveredEvent {
  readonly type: 'OrderDelivered';
  readonly shipmentId: string;
  readonly orderId: string;
  readonly timestamp: string;
}

export type ShipmentDomainEvent =
  | FulfillmentRequestedEvent
  | OrderPickedEvent
  | OrderPackedEvent
  | OrderShippedEvent
  | OrderDeliveredEvent;

export class Shipment {
  private _domainEvents: ShipmentDomainEvent[] = [];

  constructor(
    public readonly id: string,
    public readonly orderId: string,
    private _status: ShipmentStatus = ShipmentStatus.Requested,
    private _trackingNumber?: string,
    private _carrier?: string,
  ) {}

  get status(): ShipmentStatus {
    return this._status;
  }
  get trackingNumber(): string | undefined {
    return this._trackingNumber;
  }
  get carrier(): string | undefined {
    return this._carrier;
  }
  get domainEvents(): readonly ShipmentDomainEvent[] {
    return this._domainEvents;
  }

  static request(id: string, orderId: string): Shipment {
    const shipment = new Shipment(id, orderId);
    shipment.recordEvent({
      type: 'FulfillmentRequested',
      shipmentId: id,
      orderId,
      timestamp: new Date().toISOString(),
    });
    return shipment;
  }

  pick(): void {
    if (this._status !== ShipmentStatus.Requested) {
      throw new Error(`Cannot pick shipment ${this.id}: status is ${this._status}, not Requested`);
    }
    this._status = ShipmentStatus.Picked;
    this.recordEvent({
      type: 'OrderPicked',
      shipmentId: this.id,
      orderId: this.orderId,
      timestamp: new Date().toISOString(),
    });
  }

  pack(): void {
    if (this._status !== ShipmentStatus.Picked) {
      throw new Error(`Cannot pack shipment ${this.id}: status is ${this._status}, not Picked`);
    }
    this._status = ShipmentStatus.Packed;
    this.recordEvent({
      type: 'OrderPacked',
      shipmentId: this.id,
      orderId: this.orderId,
      timestamp: new Date().toISOString(),
    });
  }

  ship(trackingNumber: string, carrier: string): void {
    if (this._status !== ShipmentStatus.Packed) {
      throw new Error(`Cannot ship shipment ${this.id}: status is ${this._status}, not Packed`);
    }
    if (!trackingNumber?.trim()) throw new Error('Tracking number is required');
    if (!carrier?.trim()) throw new Error('Carrier is required');

    this._status = ShipmentStatus.Shipped;
    this._trackingNumber = trackingNumber;
    this._carrier = carrier;
    this.recordEvent({
      type: 'OrderShipped',
      shipmentId: this.id,
      orderId: this.orderId,
      trackingNumber,
      carrier,
      timestamp: new Date().toISOString(),
    });
  }

  confirmDelivery(): void {
    if (this._status !== ShipmentStatus.Shipped) {
      throw new Error(
        `Cannot confirm delivery for shipment ${this.id}: status is ${this._status}, not Shipped`,
      );
    }
    this._status = ShipmentStatus.Delivered;
    this.recordEvent({
      type: 'OrderDelivered',
      shipmentId: this.id,
      orderId: this.orderId,
      timestamp: new Date().toISOString(),
    });
  }

  private recordEvent(event: ShipmentDomainEvent): void {
    this._domainEvents.push(event);
  }
}
