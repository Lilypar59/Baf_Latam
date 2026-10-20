// Conexión con el contrato VehicleChain en Stellar Testnet.
// El cliente tipado (`@/contracts/vehiclechain`) se generó con
// `stellar contract bindings typescript --contract-id vehiclechain`.
import { Buffer } from 'buffer';
import { signTransaction } from '@stellar/freighter-api';
import { Client, networks, type Vehicle as ChainVehicle, type ServiceEvidence } from '@/contracts/vehiclechain';
import type { AssembledTransaction } from '@stellar/stellar-sdk/contract';
import { StrKey } from '@stellar/stellar-sdk';

export const NETWORK = {
  name: 'Testnet',
  rpcUrl: 'https://soroban-testnet.stellar.org',
  horizonUrl: 'https://horizon-testnet.stellar.org',
  friendbotUrl: 'https://friendbot.stellar.org',
  networkPassphrase: networks.testnet.networkPassphrase,
  contractId: networks.testnet.contractId,
};

export type { ChainVehicle, ServiceEvidence };

export const explorer = {
  tx: (hash: string) => `https://stellar.expert/explorer/testnet/tx/${hash}`,
  contract: () => `https://stellar.expert/explorer/testnet/contract/${NETWORK.contractId}`,
  account: (addr: string) => `https://stellar.expert/explorer/testnet/account/${addr}`,
};

export function shortAddr(addr: string) {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export function shortHex(hex: string) {
  return `${hex.slice(0, 8)}…${hex.slice(-6)}`;
}

export function isValidAddress(addr: string) {
  return StrKey.isValidEd25519PublicKey(addr.trim());
}

// ---------- Hashes (nada personal va al ledger) ----------

export async function sha256Hex(text: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

export const toBytes = (hex: string) => Buffer.from(hex, 'hex');
export const fromBytes = (buf: Buffer | Uint8Array) => Buffer.from(buf).toString('hex');

/** vehicle_id = SHA-256(VIN en mayúsculas). */
export const vehicleIdOf = (vin: string) => sha256Hex(vin.trim().toUpperCase());

/** service_id = SHA-256(id off-chain del servicio). */
export const serviceIdOf = (serviceId: string) => sha256Hex(serviceId);

export interface ServiceRecordFields {
  serviceId: string;
  plate: string;
  type: string;
  mileage: number;
  date: string;
  description?: string;
}

/**
 * record_hash = SHA-256 del registro off-chain en JSON canónico (orden fijo de
 * campos). Si alguien modifica el registro en la base de datos, el hash deja de
 * coincidir con el publicado en el contrato.
 */
export function recordHashOf(r: ServiceRecordFields) {
  const canonical = {
    serviceId: r.serviceId,
    plate: r.plate,
    type: r.type,
    mileage: r.mileage,
    date: r.date,
    ...(r.description ? { description: r.description } : {}),
  };
  return sha256Hex(JSON.stringify(canonical));
}

// ---------- Cliente del contrato ----------

export type TxPhase = 'simulating' | 'signing' | 'sending';

function client(publicKey?: string, onPhase?: (p: TxPhase) => void) {
  return new Client({
    contractId: NETWORK.contractId,
    networkPassphrase: NETWORK.networkPassphrase,
    rpcUrl: NETWORK.rpcUrl,
    publicKey,
    signTransaction: async (xdr, opts) => {
      onPhase?.('signing');
      const res = await signTransaction(xdr, {
        networkPassphrase: opts?.networkPassphrase ?? NETWORK.networkPassphrase,
        address: publicKey,
      });
      if (res.error) throw new Error(res.error.message || 'Firma rechazada en Freighter');
      onPhase?.('sending');
      return { signedTxXdr: res.signedTxXdr, signerAddress: res.signerAddress };
    },
  });
}

const contractErrors: Record<string, string> = {
  WorkshopNotEnabled: 'El taller no está habilitado por el administrador.',
  VehicleAlreadyRegistered: 'Este vehículo (VIN) ya está registrado en VehicleChain.',
  VehicleNotFound: 'El vehículo no está registrado en VehicleChain.',
  ServiceAlreadyPublished: 'Este servicio ya fue publicado y no se puede sobrescribir.',
  ServiceNotFound: 'No hay evidencia publicada para este servicio.',
  SameOwner: 'El nuevo titular es la misma cuenta que el titular actual.',
};

export function friendlyError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  for (const [k, v] of Object.entries(contractErrors)) if (msg.includes(k)) return v;
  const code = msg.match(/Error\(Contract, #(\d+)\)/)?.[1];
  if (code) {
    const name = Object.keys(contractErrors)[Number(code) - 1];
    if (name) return contractErrors[name];
  }
  const signer = msg.match(/requires signatures from (G[A-Z2-7]{55})/)?.[1];
  if (signer) return `La cuenta conectada no puede hacer esta operación: solo ${shortAddr(signer)} puede firmarla.`;
  if (/auth|Unauthorized|InvalidAction/i.test(msg)) return 'La cuenta conectada no tiene permiso para esta operación.';
  if (/rejected|declined|denied/i.test(msg)) return 'Firmaste "Rechazar" en Freighter. No se envió nada.';
  if (/not found|Account not found|404/i.test(msg)) return 'La cuenta no existe en Testnet. Fondéala con Friendbot.';
  return msg.length > 220 ? `${msg.slice(0, 220)}…` : msg;
}

/** Firma y envía una invocación; devuelve el hash de la transacción. */
async function send<T>(tx: AssembledTransaction<T>): Promise<string> {
  // Los errores del contrato (Result::Err) aparecen ya en la simulación.
  const r = tx.result as unknown as { isErr?: () => boolean; unwrapErr?: () => { message: string } };
  if (r && typeof r.isErr === 'function' && r.isErr()) {
    // El SDK a veces deja el mensaje vacío; el código viene en el error de simulación.
    const sim = (tx as unknown as { simulation?: { error?: string } }).simulation;
    throw new Error(r.unwrapErr!().message || sim?.error || 'El contrato rechazó la operación');
  }
  const sent = await tx.signAndSend();
  const hash = sent.sendTransactionResponse?.hash ?? sent.getTransactionResponse?.txHash;
  if (!hash) throw new Error('La red no devolvió el hash de la transacción');
  return hash;
}

function unwrap<T>(res: unknown): T | null {
  const r = res as { isOk?: () => boolean; unwrap?: () => T };
  if (r && typeof r.isOk === 'function') return r.isOk() ? r.unwrap!() : null;
  return res as T;
}

export const chain = {
  // --- lecturas (simulación, sin firma) ---
  async getAdmin() {
    return (await client().get_admin()).result;
  },
  async isWorkshopEnabled(workshop: string) {
    return (await client().is_workshop_enabled({ workshop })).result;
  },
  async getVehicle(vehicleIdHex: string): Promise<ChainVehicle | null> {
    try {
      return unwrap<ChainVehicle>((await client().get_vehicle({ vehicle_id: toBytes(vehicleIdHex) })).result);
    } catch {
      return null;
    }
  },
  async getVehicleServices(vehicleIdHex: string) {
    const ids =
      unwrap<Buffer[]>(
        (await client().get_vehicle_services({ vehicle_id: toBytes(vehicleIdHex), start: 0, limit: 50 })).result,
      ) ?? [];
    return Promise.all(
      ids.map(async (id) => {
        const ev = unwrap<ServiceEvidence>((await client().get_service({ service_id: id })).result);
        return { serviceIdHex: fromBytes(id), evidence: ev };
      }),
    );
  },

  // --- escrituras (firma con Freighter) ---
  async setWorkshop(admin: string, workshop: string, enabled: boolean, onPhase?: (p: TxPhase) => void) {
    onPhase?.('simulating');
    return send(await client(admin, onPhase).set_workshop({ workshop, enabled }));
  },
  async registerVehicle(owner: string, vehicleIdHex: string, onPhase?: (p: TxPhase) => void) {
    onPhase?.('simulating');
    return send(await client(owner, onPhase).register_vehicle({ vehicle_id: toBytes(vehicleIdHex), owner }));
  },
  async publishService(
    workshop: string,
    vehicleIdHex: string,
    serviceIdHex: string,
    recordHashHex: string,
    onPhase?: (p: TxPhase) => void,
  ) {
    onPhase?.('simulating');
    return send(
      await client(workshop, onPhase).publish_service({
        workshop,
        vehicle_id: toBytes(vehicleIdHex),
        service_id: toBytes(serviceIdHex),
        record_hash: toBytes(recordHashHex),
      }),
    );
  },
  async transferHistory(owner: string, vehicleIdHex: string, newOwner: string, onPhase?: (p: TxPhase) => void) {
    onPhase?.('simulating');
    return send(
      await client(owner, onPhase).transfer_history({ vehicle_id: toBytes(vehicleIdHex), new_owner: newOwner }),
    );
  },
};

// ---------- Cuenta ----------

export async function isAccountFunded(addr: string) {
  const res = await fetch(`${NETWORK.horizonUrl}/accounts/${addr}`);
  return res.ok;
}

export async function fundWithFriendbot(addr: string) {
  const res = await fetch(`${NETWORK.friendbotUrl}?addr=${encodeURIComponent(addr)}`);
  if (!res.ok && !(await isAccountFunded(addr))) throw new Error('Friendbot no pudo fondear la cuenta');
}
