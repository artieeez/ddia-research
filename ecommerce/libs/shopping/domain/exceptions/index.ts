export class CartNotFoundError extends Error {
  constructor(id: string) {
    super(`Cart ${id} not found`);
    this.name = 'CartNotFoundError';
  }
}

export class CartNotModifiableError extends Error {
  constructor(id: string) {
    super(`Cart ${id} cannot be modified`);
    this.name = 'CartNotModifiableError';
  }
}
