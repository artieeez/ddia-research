import type { Money } from '@ecommerce/shared/domain';
import { CartItem } from '../value-objects/cart-item.value-object';
import { CartStatus } from '../value-objects/cart-status.enum';

/** Cart events emitted by the aggregate after successful state changes. */
export interface ProductAddedToCartEvent {
  readonly type: 'ProductAddedToCart';
  readonly cartId: string;
  readonly productId: string;
  readonly productName: string;
  readonly quantity: number;
  readonly unitPrice: Money;
  readonly timestamp: string;
}

export interface ProductRemovedFromCartEvent {
  readonly type: 'ProductRemovedFromCart';
  readonly cartId: string;
  readonly productId: string;
  readonly timestamp: string;
}

export interface CartItemQuantityChangedEvent {
  readonly type: 'CartItemQuantityChanged';
  readonly cartId: string;
  readonly productId: string;
  readonly oldQuantity: number;
  readonly newQuantity: number;
  readonly timestamp: string;
}

export interface CartAbandonedEvent {
  readonly type: 'CartAbandoned';
  readonly cartId: string;
  readonly customerId: string;
  readonly timestamp: string;
}

export type CartDomainEvent =
  | ProductAddedToCartEvent
  | ProductRemovedFromCartEvent
  | CartItemQuantityChangedEvent
  | CartAbandonedEvent;

/** Aggregate root for Cart. All mutations flow through this entity. */
export class Cart {
  private _items: CartItem[] = [];
  private _domainEvents: CartDomainEvent[] = [];

  constructor(
    public readonly id: string,
    public readonly customerId: string,
    private _status: CartStatus = CartStatus.Active,
  ) {}

  get items(): readonly CartItem[] {
    return this._items;
  }

  get status(): CartStatus {
    return this._status;
  }

  get domainEvents(): readonly CartDomainEvent[] {
    return this._domainEvents;
  }

  // ---- Mutations (commands mapped from Phase 2) ----

  addProduct(productId: string, productName: string, quantity: number, unitPrice: Money): void {
    this.assertNotAbandoned();

    const existing = this._items.find((i) => i.productId === productId);
    if (existing) {
      const newQty = existing.quantity + quantity;
      this._items = this._items.map((i) =>
        i.productId === productId ? i.withQuantity(newQty) : i,
      );
    } else {
      this._items = [...this._items, new CartItem(productId, productName, quantity, unitPrice)];
    }

    this.recordEvent({
      type: 'ProductAddedToCart',
      cartId: this.id,
      productId,
      productName,
      quantity,
      unitPrice,
      timestamp: new Date().toISOString(),
    });
  }

  removeProduct(productId: string): void {
    const item = this._items.find((i) => i.productId === productId);
    if (!item) throw new Error(`Product ${productId} not found in cart ${this.id}`);

    this._items = this._items.filter((i) => i.productId !== productId);

    this.recordEvent({
      type: 'ProductRemovedFromCart',
      cartId: this.id,
      productId,
      timestamp: new Date().toISOString(),
    });
  }

  changeItemQuantity(productId: string, newQuantity: number): void {
    this.assertNotAbandoned();
    if (newQuantity <= 0) throw new Error('Quantity must be positive');

    const item = this._items.find((i) => i.productId === productId);
    if (!item) throw new Error(`Product ${productId} not found in cart ${this.id}`);

    const oldQuantity = item.quantity;
    this._items = this._items.map((i) =>
      i.productId === productId ? i.withQuantity(newQuantity) : i,
    );

    this.recordEvent({
      type: 'CartItemQuantityChanged',
      cartId: this.id,
      productId,
      oldQuantity,
      newQuantity,
      timestamp: new Date().toISOString(),
    });
  }

  abandon(): void {
    if (this._status !== CartStatus.Active) {
      throw new Error(`Cart ${this.id} is already ${this._status}`);
    }

    this._status = CartStatus.Abandoned;

    this.recordEvent({
      type: 'CartAbandoned',
      cartId: this.id,
      customerId: this.customerId,
      timestamp: new Date().toISOString(),
    });
  }

  get totalItems(): number {
    return this._items.reduce((sum, item) => sum + item.quantity, 0);
  }

  get isEmpty(): boolean {
    return this._items.length === 0;
  }

  // ---- Guards ----

  private assertNotAbandoned(): void {
    if (this._status === CartStatus.Abandoned) {
      throw new Error(`Cannot modify cart ${this.id}: cart is abandoned`);
    }
  }

  private recordEvent(event: CartDomainEvent): void {
    this._domainEvents.push(event);
  }
}
