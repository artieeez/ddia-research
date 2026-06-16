export enum PaymentMethodType {
  CreditCard = 'CreditCard',
  PayPal = 'PayPal',
}

export class PaymentMethod {
  constructor(
    public readonly type: PaymentMethodType,
    public readonly lastFourDigits?: string,
  ) {}
}
