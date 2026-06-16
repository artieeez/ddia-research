import { Money } from '@ecommerce/shared/domain';

export class OrderItem {
  constructor(
    public readonly productId: string,
    public readonly productName: string,
    public readonly quantity: number,
    public readonly unitPrice: Money,
  ) {
    if (quantity <= 0) throw new Error('OrderItem quantity must be positive');
  }

  get subtotal(): Money {
    return new Money(this.unitPrice.amount * this.quantity, this.unitPrice.currency);
  }
}
