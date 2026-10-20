import { useCallback, useEffect, useState } from 'react';
import { chain, type ChainVehicle } from '@/lib/stellar';
import { useStore, type StoredVehicle } from '@/lib/store';

export interface VehicleWithChain extends StoredVehicle {
  chain: ChainVehicle | null;
}

/**
 * Vehículos conocidos off-chain, enriquecidos con su estado en el contrato.
 * El titular se toma SIEMPRE del contrato (`get_vehicle`), no del almacén:
 * así una transferencia se refleja aunque el registro off-chain no cambie.
 */
export function useChainVehicles() {
  const { vehicles } = useStore();
  const [data, setData] = useState<VehicleWithChain[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const rows = await Promise.all(
      vehicles.map(async (v) => ({ ...v, chain: await chain.getVehicle(v.vehicleIdHex) })),
    );
    setData(rows);
    setLoading(false);
  }, [vehicles]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { vehicles: data, loading, reload };
}

export function useMyVehicles(address: string | null) {
  const all = useChainVehicles();
  return {
    ...all,
    vehicles: all.vehicles.filter((v) => address && v.chain?.owner === address),
  };
}
