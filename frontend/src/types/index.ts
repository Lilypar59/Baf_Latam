export type Role = 'admin' | 'owner' | 'workshop';

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  vin: string;
  ownerId: string;
  ownerName: string;
  status: 'active' | 'in_transfer' | 'transferred';
  registrationDate: string;
  mileage: number;
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
}

export interface TransferRecord {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleBrand: string;
  vehicleModel: string;
  fromOwnerId: string;
  fromOwnerName: string;
  toOwnerId: string;
  toOwnerName: string;
  date: string;
  status: 'completed' | 'pending' | 'rejected';
  price: number;
  documentHash: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  date: string;
  type: 'oil_change' | 'brake_service' | 'tire_rotation' | 'inspection' | 'repair' | 'other';
  description: string;
  workshopName: string;
  cost: number;
  mileage: number;
  status: 'completed' | 'in_progress' | 'scheduled';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  registeredDate: string;
  status: 'active' | 'suspended';
}

export interface Permission {
  id: string;
  workshopId: string;
  workshopName: string;
  vehicleId: string;
  vehiclePlate: string;
  granted: boolean;
  dateGranted: string;
  expiryDate: string;
  scope: 'full' | 'maintenance_only' | 'diagnostic_only';
}

export interface BlockchainEntry {
  id: string;
  blockNumber: number;
  hash: string;
  previousHash: string;
  timestamp: string;
  dataType: 'vehicle_registration' | 'transfer' | 'maintenance' | 'permission';
  dataId: string;
  verified: boolean;
}

// Solicitud de incorporación de un taller nuevo (HU1JT / HU1JA).
// Es distinto de `User` porque todavía no es un taller aprobado:
// vive "en espera" hasta que un administrador lo apruebe o rechace.
export interface WorkshopApplication {
  id: string;
  name: string;
  nit: string;
  address: string;
  city: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedDate: string;
}
