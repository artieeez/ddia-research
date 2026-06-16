export class ReturnNotFoundError extends Error {
  constructor(id: string) {
    super(`Return ${id} not found`);
    this.name = 'ReturnNotFoundError';
  }
}

export class ReturnNotAllowedError extends Error {
  constructor(id: string) {
    super(`Return ${id} cannot be processed`);
    this.name = 'ReturnNotAllowedError';
  }
}
