/** Monetary value with currency. Immutable value object shared across contexts. */
export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string,
  ) {
    if (amount < 0) throw new Error('Amount cannot be negative');
    if (currency?.length !== 3) throw new Error('Invalid currency code');
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) throw new Error('Currency mismatch');
    return new Money(this.amount + other.amount, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toString(): string {
    return `${(this.amount / 100).toFixed(2)} ${this.currency}`;
  }
}

/** Unique identifier value object. */
export class Identifier {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) throw new Error('Identifier cannot be empty');
  }

  equals(other: Identifier): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
