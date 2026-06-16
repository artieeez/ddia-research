import { Money } from '@ecommerce/shared/domain';

/** A line item within a Cart. Immutable value object. */
export class CartItem {
  constructor(
    public readonly productId: string,
    public readonly productName: string,
    public readonly quantity: number,
    public readonly unitPrice: Money,
  ) {
    if (quantity <= 0) throw new Error('CartItem quantity must be positive');
  }

  /** Returns a new CartItem with the given quantity. Does not mutate. */
  withQuantity(newQuantity: number): CartItem {
    return new CartItem(this.productId, this.productName, newQuantity, this.unitPrice);
  }

  /** Total price for this line item. */
  get subtotal(): Money {
    return new Money(this.unitPrice.amount * this.quantity, this.unitPrice.currency);
  }
}
