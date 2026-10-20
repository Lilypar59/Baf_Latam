// Almacén off-chain del MVP. Hace el papel de la base de datos (PostgreSQL en el
// Blueprint) mientras no hay backend: guarda en localStorage los datos que NO
// van al ledger (placa, marca, descripción del servicio, datos del taller…).
// El contrato solo guarda hashes y direcciones; la verdad sobre titularidad,
// talleres habilitados y evidencia se lee siempre del contrato.
import { useSyncExternalStore } from 'react';

export interface StoredVehicle {
  vin: string;
  vehicleIdHex: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  mileage: number;
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  registeredBy: string;
  registeredAt: string;
  txHash?: string;
}

export interface StoredService {
  serviceId: string;
  serviceIdHex: string;
  vehicleIdHex: string;
  plate: string;
  type: string;
  description?: string;
  date: string;
  mileage: number;
  workshop: string;
  workshopName: string;
  recordHashHex: string;
  txHash: string;
}

export interface StoredApplication {
  id: string;
  wallet: string;
  name: string;
  nit: string;
  address: string;
  city: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedDate: string;
  txHash?: string;
}

export interface StoredTransfer {
  id: string;
  vehicleIdHex: string;
  plate: string;
  from: string;
  to: string;
  date: string;
  txHash: string;
}

interface State {
  vehicles: StoredVehicle[];
  services: StoredService[];
  applications: StoredApplication[];
  transfers: StoredTransfer[];
}

const KEY = 'vehiclechain.offchain.v1';

// Datos de la demo publicados en Testnet desde Stellar CLI el 19/10/2026.
const SEED: State = {
  vehicles: [
    {
      vin: 'JTDKARFP6N3024567',
      vehicleIdHex: 'acb06a6dd3a701c33abe5664a9247e28553abd470006c24a7cc7ed0ab607dc83',
      plate: 'ABC123',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2022,
      color: 'Plata',
      mileage: 45200,
      fuelType: 'gasoline',
      registeredBy: 'GCLIZOKUAJDZLOBYT7WP7QZCDSU23MS3YMHA3CXY65XUW3T47LWTPN7K',
      registeredAt: '2026-10-19',
      txHash: '8f653ead53621670e0ffe1d1eaa263de598217cc4765d93fc5f22fb2daecf1bc',
    },
  ],
  services: [
    {
      serviceId: 'svc-demo-001',
      serviceIdHex: 'e3f17b400db1b9ab06ca82b0c229149cdaf31230a675316bf1aa5caed15d0729',
      vehicleIdHex: 'acb06a6dd3a701c33abe5664a9247e28553abd470006c24a7cc7ed0ab607dc83',
      plate: 'ABC123',
      type: 'oil_change',
      date: '2026-10-19',
      mileage: 45200,
      workshop: 'GAQG5Q4CQFSLCMVAQBTRNWMDPRM4MO7KL754RBJQMWK6VKDWQMX3GCWT',
      workshopName: 'Taller MotorPlus',
      recordHashHex: 'f4a41f9d6423fc7fded4b593691b5040e98f975b3deef00f52e5ca2685f59e41',
      txHash: '70f5463d2b5b8dfeb10d72b8ea818a4f72db036fc856c8fff3ab1b4b18fb1180',
    },
  ],
  applications: [
    {
      id: 'w1',
      wallet: 'GAQG5Q4CQFSLCMVAQBTRNWMDPRM4MO7KL754RBJQMWK6VKDWQMX3GCWT',
      name: 'Taller MotorPlus',
      nit: '900123456',
      address: 'Calle 45 #12-30',
      city: 'Bogotá',
      email: 'contacto@motorplus.com',
      phone: '+57 310 222 1144',
      status: 'approved',
      requestedDate: '2026-10-19',
      txHash: '3657ac33f9ca1c6364d0148116b6335210dc0783b1337ebcbc9acdcc468bce35',
    },
  ],
  transfers: [
    {
      id: 't1',
      vehicleIdHex: 'acb06a6dd3a701c33abe5664a9247e28553abd470006c24a7cc7ed0ab607dc83',
      plate: 'ABC123',
      from: 'GCLIZOKUAJDZLOBYT7WP7QZCDSU23MS3YMHA3CXY65XUW3T47LWTPN7K',
      to: 'GAAZ5HKIDGNBU3PRE2D2WK4QI7I6VEUKVUW47VBXFULL6KZ7RJ2QFVML',
      date: '2026-10-19',
      txHash: '1583cf157585b555ef33361171bb7c5e941cff40104c7fcdc006717b02bc2cb4',
    },
  ],
};

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...SEED, ...JSON.parse(raw) };
  } catch {
    /* sin almacenamiento: se usa la semilla */
  }
  return structuredClone(SEED);
}

let state: State = load();
const listeners = new Set<() => void>();

function commit(next: State) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignorar */
  }
  listeners.forEach((l) => l());
}

export const store = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  addVehicle(v: StoredVehicle) {
    commit({ ...state, vehicles: [...state.vehicles.filter((x) => x.vehicleIdHex !== v.vehicleIdHex), v] });
  },
  addService(s: StoredService) {
    commit({ ...state, services: [...state.services, s] });
  },
  addApplication(a: StoredApplication) {
    commit({ ...state, applications: [...state.applications.filter((x) => x.wallet !== a.wallet), a] });
  },
  updateApplication(id: string, patch: Partial<StoredApplication>) {
    commit({ ...state, applications: state.applications.map((a) => (a.id === id ? { ...a, ...patch } : a)) });
  },
  addTransfer(t: StoredTransfer) {
    commit({ ...state, transfers: [...state.transfers, t] });
  },
  reset() {
    commit(structuredClone(SEED));
  },
};

export function useStore(): State {
  return useSyncExternalStore(store.subscribe, store.get);
}

/**
 * `HU6JA(2)` (off-chain): servicios con el mismo vehículo, tipo y fecha
 * publicados por talleres distintos. Regla simple de demostración.
 */
export function findDuplicateServices(services: StoredService[]): StoredService[][] {
  const groups = new Map<string, StoredService[]>();
  for (const s of services) {
    const key = `${s.vehicleIdHex}__${s.type}__${s.date}`;
    groups.set(key, [...(groups.get(key) ?? []), s]);
  }
  return Array.from(groups.values()).filter((g) => g.length > 1 && new Set(g.map((s) => s.workshop)).size > 1);
}

export const serviceTypeLabels: Record<string, string> = {
  oil_change: 'Cambio de aceite',
  brake_service: 'Servicio de frenos',
  tire_rotation: 'Rotación de neumáticos',
  inspection: 'Inspección',
  repair: 'Reparación',
  other: 'Otro',
};
