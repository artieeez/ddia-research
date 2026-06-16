import type { Money } from '@ecommerce/shared/domain';
import { ReturnStatus } from '../value-objects/return-status.enum';

export interface ReturnRequestedEvent {
  readonly type: 'ReturnRequested';
  readonly returnId: string;
  readonly orderId: string;
  readonly customerId: string;
  readonly items: ReturnItemSnapshot[];
  readonly reason: string;
  readonly timestamp: string;
}
export interface ReturnApprovedEvent {
  readonly type: 'ReturnApproved';
  readonly returnId: string;
  readonly orderId: string;
  readonly timestamp: string;
}
export interface ReturnRejectedEvent {
  readonly type: 'ReturnRejected';
  readonly returnId: string;
  readonly orderId: string;
  readonly reason: string;
  readonly timestamp: string;
}
export interface ReturnReceivedEvent {
  readonly type: 'ReturnReceived';
  readonly returnId: string;
  readonly orderId: string;
  readonly timestamp: string;
}
export interface RefundIssuedEvent {
  readonly type: 'RefundIssued';
  readonly returnId: string;
  readonly orderId: string;
  readonly paymentId: string;
  readonly amount: Money;
  readonly timestamp: string;
}

export type ReturnDomainEvent =
  | ReturnRequestedEvent
  | ReturnApprovedEvent
  | ReturnRejectedEvent
  | ReturnReceivedEvent
  | RefundIssuedEvent;

export interface ReturnItemSnapshot {
  readonly productId: string;
  readonly productName: string;
  readonly quantity: number;
}

/** Return aggregate root. Manages the return lifecycle. */
export class Return {
  private _domainEvents: ReturnDomainEvent[] = [];

  constructor(
    public readonly id: string,
    public readonly orderId: string,
    private _status: ReturnStatus,
    private _items: ReturnItemSnapshot[],
    private _reason?: string,
    private _rejectionReason?: string,
  ) {}

  get status(): ReturnStatus {
    return this._status;
  }
  get items(): readonly ReturnItemSnapshot[] {
    return this._items;
  }
  get reason(): string | undefined {
    return this._reason;
  }
  get rejectionReason(): string | undefined {
    return this._rejectionReason;
  }
  get domainEvents(): readonly ReturnDomainEvent[] {
    return this._domainEvents;
  }

  static request(
    id: string,
    orderId: string,
    customerId: string,
    items: ReturnItemSnapshot[],
    reason: string,
  ): Return {
    if (items.length === 0) throw new Error('At least one item must be returned');
    if (!reason?.trim()) throw new Error('Return reason is required');

    const ret = new Return(id, orderId, ReturnStatus.Requested, items, reason);
    ret.recordEvent({
      type: 'ReturnRequested',
      returnId: id,
      orderId,
      customerId,
      items,
      reason,
      timestamp: new Date().toISOString(),
    });
    return ret;
  }

  approve(): void {
    if (this._status !== ReturnStatus.Requested) {
      throw new Error(`Cannot approve return ${this.id}: status is ${this._status}, not Requested`);
    }
    this._status = ReturnStatus.Approved;
    this.recordEvent({
      type: 'ReturnApproved',
      returnId: this.id,
      orderId: this.orderId,
      timestamp: new Date().toISOString(),
    });
  }

  reject(reason: string): void {
    if (this._status !== ReturnStatus.Requested) {
      throw new Error(`Cannot reject return ${this.id}: status is ${this._status}, not Requested`);
    }
    if (!reason?.trim()) throw new Error('Rejection reason is required');
    this._status = ReturnStatus.Rejected;
    this._rejectionReason = reason;
    this.recordEvent({
      type: 'ReturnRejected',
      returnId: this.id,
      orderId: this.orderId,
      reason,
      timestamp: new Date().toISOString(),
    });
  }

  receive(): void {
    if (this._status !== ReturnStatus.Approved) {
      throw new Error(`Cannot receive return ${this.id}: status is ${this._status}, not Approved`);
    }
    this._status = ReturnStatus.Received;
    this.recordEvent({
      type: 'ReturnReceived',
      returnId: this.id,
      orderId: this.orderId,
      timestamp: new Date().toISOString(),
    });
  }

  issueRefund(paymentId: string, amount: Money): void {
    if (this._status !== ReturnStatus.Received) {
      throw new Error(
        `Cannot issue refund for return ${this.id}: status is ${this._status}, not Received`,
      );
    }
    this._status = ReturnStatus.Refunded;
    this.recordEvent({
      type: 'RefundIssued',
      returnId: this.id,
      orderId: this.orderId,
      paymentId,
      amount,
      timestamp: new Date().toISOString(),
    });
  }

  private recordEvent(event: ReturnDomainEvent): void {
    this._domainEvents.push(event);
  }
}
