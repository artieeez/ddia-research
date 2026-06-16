import { Money } from '@ecommerce/shared/domain';
import type { OrderItem } from '../value-objects/order-item.value-object';
import { OrderStatus } from '../value-objects/order-status.enum';
import type { PaymentMethod } from '../value-objects/payment-method.value-object';
import type { ShippingAddress } from '../value-objects/shipping-address.value-object';

/** Order domain events. */
export interface CheckoutInitiatedEvent {
  readonly type: 'CheckoutInitiated';
  readonly orderId: string;
  readonly cartId: string;
  readonly customerId: string;
  readonly items: OrderItem[];
  readonly timestamp: string;
}
export interface ShippingAddressProvidedEvent {
  readonly type: 'ShippingAddressProvided';
  readonly orderId: string;
  readonly address: ShippingAddress;
  readonly timestamp: string;
}
export interface PaymentMethodSelectedEvent {
  readonly type: 'PaymentMethodSelected';
  readonly orderId: string;
  readonly paymentMethod: PaymentMethod;
  readonly timestamp: string;
}
export interface OrderReviewedEvent {
  readonly type: 'OrderReviewed';
  readonly orderId: string;
  readonly timestamp: string;
}
export interface OrderPlacedEvent {
  readonly type: 'OrderPlaced';
  readonly orderId: string;
  readonly customerId: string;
  readonly items: OrderItem[];
  readonly total: Money;
  readonly timestamp: string;
}
export interface OrderConfirmedEvent {
  readonly type: 'OrderConfirmed';
  readonly orderId: string;
  readonly timestamp: string;
}

export type OrderDomainEvent =
  | CheckoutInitiatedEvent
  | ShippingAddressProvidedEvent
  | PaymentMethodSelectedEvent
  | OrderReviewedEvent
  | OrderPlacedEvent
  | OrderConfirmedEvent;

/** Order aggregate root. Manages the full checkout lifecycle. */
export class Order {
  private _items: OrderItem[] = [];
  private _shippingAddress?: ShippingAddress;
  private _paymentMethod?: PaymentMethod;
  private _domainEvents: OrderDomainEvent[] = [];

  constructor(
    public readonly id: string,
    public readonly customerId: string,
    private _status: OrderStatus = OrderStatus.Draft,
  ) {}

  get items(): readonly OrderItem[] {
    return this._items;
  }
  get status(): OrderStatus {
    return this._status;
  }
  get shippingAddress(): ShippingAddress | undefined {
    return this._shippingAddress;
  }
  get paymentMethod(): PaymentMethod | undefined {
    return this._paymentMethod;
  }
  get domainEvents(): readonly OrderDomainEvent[] {
    return this._domainEvents;
  }

  /** Create an Order from cart data. Called by InitiateCheckout command. */
  static initiate(id: string, customerId: string, cartId: string, items: OrderItem[]): Order {
    if (items.length === 0) throw new Error('Cannot initiate checkout with empty cart');

    const order = new Order(id, customerId);
    order._items = items;
    order.recordEvent({
      type: 'CheckoutInitiated',
      orderId: id,
      cartId,
      customerId,
      items,
      timestamp: new Date().toISOString(),
    });
    return order;
  }

  provideShippingAddress(address: ShippingAddress): void {
    this.assertInDraft();
    this._shippingAddress = address;
    this.recordEvent({
      type: 'ShippingAddressProvided',
      orderId: this.id,
      address,
      timestamp: new Date().toISOString(),
    });
  }

  selectPaymentMethod(method: PaymentMethod): void {
    this.assertInDraft();
    this._paymentMethod = method;
    this.recordEvent({
      type: 'PaymentMethodSelected',
      orderId: this.id,
      paymentMethod: method,
      timestamp: new Date().toISOString(),
    });
  }

  review(): void {
    this.assertInDraft();
    if (!this._shippingAddress) throw new Error('Shipping address must be provided before review');
    if (!this._paymentMethod) throw new Error('Payment method must be selected before review');
    this.recordEvent({
      type: 'OrderReviewed',
      orderId: this.id,
      timestamp: new Date().toISOString(),
    });
  }

  place(): void {
    this.assertInDraft();
    if (!this._shippingAddress) throw new Error('Shipping address is required to place order');
    if (!this._paymentMethod) throw new Error('Payment method is required to place order');

    this._status = OrderStatus.Placed;
    this.recordEvent({
      type: 'OrderPlaced',
      orderId: this.id,
      customerId: this.customerId,
      items: this._items,
      total: this.total,
      timestamp: new Date().toISOString(),
    });
  }

  confirm(): void {
    if (this._status !== OrderStatus.Placed) {
      throw new Error(`Cannot confirm order ${this.id}: order is ${this._status}, not Placed`);
    }
    this._status = OrderStatus.Confirmed;
    this.recordEvent({
      type: 'OrderConfirmed',
      orderId: this.id,
      timestamp: new Date().toISOString(),
    });
  }

  get total(): Money {
    return this._items.reduce((sum, item) => sum.add(item.subtotal), new Money(0, 'USD'));
  }

  private assertInDraft(): void {
    if (this._status !== OrderStatus.Draft) {
      throw new Error(`Cannot modify order ${this.id}: order is ${this._status}, not Draft`);
    }
  }

  private recordEvent(event: OrderDomainEvent): void {
    this._domainEvents.push(event);
  }
}
