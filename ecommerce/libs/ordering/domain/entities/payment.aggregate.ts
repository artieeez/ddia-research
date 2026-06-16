import { PaymentStatus } from '../value-objects/payment-status.enum';

export interface PaymentAuthorizedEvent {
  readonly type: 'PaymentAuthorized';
  readonly paymentId: string;
  readonly orderId: string;
  readonly amount: number;
  readonly currency: string;
  readonly gatewayTransactionId: string;
  readonly timestamp: string;
}

export interface PaymentCapturedEvent {
  readonly type: 'PaymentCaptured';
  readonly paymentId: string;
  readonly orderId: string;
  readonly amount: number;
  readonly currency: string;
  readonly gatewayTransactionId: string;
  readonly timestamp: string;
}

export type PaymentDomainEvent = PaymentAuthorizedEvent | PaymentCapturedEvent;

/** Payment aggregate root. Manages the authorization → capture lifecycle. */
export class Payment {
  private _domainEvents: PaymentDomainEvent[] = [];

  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly amount: number,
    public readonly currency: string,
    private _status: PaymentStatus = PaymentStatus.Authorized,
    public readonly gatewayTransactionId?: string,
  ) {}

  get status(): PaymentStatus {
    return this._status;
  }
  get domainEvents(): readonly PaymentDomainEvent[] {
    return this._domainEvents;
  }

  /** Create payment and authorize it. Called by AuthorizePayment command. */
  static authorize(
    id: string,
    orderId: string,
    amount: number,
    currency: string,
    gatewayTransactionId: string,
  ): Payment {
    const payment = new Payment(
      id,
      orderId,
      amount,
      currency,
      PaymentStatus.Authorized,
      gatewayTransactionId,
    );
    payment.recordEvent({
      type: 'PaymentAuthorized',
      paymentId: id,
      orderId,
      amount,
      currency,
      gatewayTransactionId,
      timestamp: new Date().toISOString(),
    });
    return payment;
  }

  capture(): void {
    if (this._status !== PaymentStatus.Authorized) {
      throw new Error(
        `Cannot capture payment ${this.id}: payment is ${this._status}, not Authorized`,
      );
    }
    this._status = PaymentStatus.Captured;
    this.recordEvent({
      type: 'PaymentCaptured',
      paymentId: this.id,
      orderId: this.orderId,
      amount: this.amount,
      currency: this.currency,
      gatewayTransactionId: this.gatewayTransactionId ?? '',
      timestamp: new Date().toISOString(),
    });
  }

  private recordEvent(event: PaymentDomainEvent): void {
    this._domainEvents.push(event);
  }
}
