export class OrderNotFoundError extends Error {
  constructor(id: string) {
    super(`Order ${id} not found`);
    this.name = 'OrderNotFoundError';
  }
}

export class OrderNotModifiableError extends Error {
  constructor(id: string) {
    super(`Order ${id} cannot be modified`);
    this.name = 'OrderNotModifiableError';
  }
}

export class IncompleteOrderError extends Error {
  constructor(id: string) {
    super(`Order ${id} is incomplete — shipping address and payment method required`);
    this.name = 'IncompleteOrderError';
  }
}

export class PaymentNotFoundError extends Error {
  constructor(id: string) {
    super(`Payment ${id} not found`);
    this.name = 'PaymentNotFoundError';
  }
}

export class PaymentNotAuthorizedError extends Error {
  constructor(id: string) {
    super(`Payment ${id} is not authorized`);
    this.name = 'PaymentNotAuthorizedError';
  }
}
