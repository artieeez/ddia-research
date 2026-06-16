import type { Shipment } from '../entities/shipment.aggregate';

export interface ShipmentRepository {
  findById(id: string): Promise<Shipment | null>;
  save(shipment: Shipment): Promise<void>;
}

export const SHIPMENT_REPOSITORY = Symbol('ShipmentRepository');
