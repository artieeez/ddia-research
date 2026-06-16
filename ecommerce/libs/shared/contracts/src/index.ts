// Shared kernel — domain events emitted across bounded contexts.
// These are the Published Language contracts from the context map.

export interface CheckoutInitiatedEvent {
  readonly type: 'CheckoutInitiated';
  readonly cartId: string;
  readonly customerId: string;
  readonly items: CartItemSnapshot[];
  readonly timestamp: string;
}

export interface OrderConfirmedEvent {
  readonly type: 'OrderConfirmed';
  readonly orderId: string;
  readonly customerId: string;
  readonly timestamp: string;
}

export interface OrderShippedEvent {
  readonly type: 'OrderShipped';
  readonly orderId: string;
  readonly shipmentId: string;
  readonly trackingNumber: string;
  readonly carrier: string;
  readonly timestamp: string;
}

export interface OrderDeliveredEvent {
  readonly type: 'OrderDelivered';
  readonly orderId: string;
  readonly shipmentId: string;
  readonly timestamp: string;
}

export interface RefundIssuedEvent {
  readonly type: 'RefundIssued';
  readonly returnId: string;
  readonly orderId: string;
  readonly paymentId: string;
  readonly amount: number;
  readonly currency: string;
  readonly timestamp: string;
}

export interface CartItemSnapshot {
  readonly productId: string;
  readonly productName: string;
  readonly quantity: number;
  readonly unitPrice: number;
}

/** Union type of all cross-context domain events. */
export type DomainEvent =
  | CheckoutInitiatedEvent
  | OrderConfirmedEvent
  | OrderShippedEvent
  | OrderDeliveredEvent
  | RefundIssuedEvent;
