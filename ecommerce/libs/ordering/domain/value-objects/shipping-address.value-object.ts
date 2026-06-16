export class ShippingAddress {
  constructor(
    public readonly street: string,
    public readonly city: string,
    public readonly state: string,
    public readonly zipCode: string,
    public readonly country: string,
  ) {
    if (!street?.trim()) throw new Error('Street is required');
    if (!city?.trim()) throw new Error('City is required');
    if (!country?.trim()) throw new Error('Country is required');
  }
}
