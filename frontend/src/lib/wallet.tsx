// Wallet (Freighter) + roles leídos del contrato.
// - Administrador: la cuenta conectada es `get_admin()`.
// - Taller habilitado: `is_workshop_enabled(cuenta)`.
// - Propietario: cualquier cuenta; sus vehículos son los que el contrato le asigna.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { getAddress, getNetwork, isConnected, requestAccess } from '@stellar/freighter-api';
import { NETWORK, chain, fundWithFriendbot, isAccountFunded } from '@/lib/stellar';

interface WalletState {
  installed: boolean | null;
  address: string | null;
  wrongNetwork: boolean;
  funded: boolean | null;
  isAdmin: boolean;
  workshopEnabled: boolean;
  loading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  refresh: () => Promise<void>;
  fund: () => Promise<void>;
}

const Ctx = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [installed, setInstalled] = useState<boolean | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [funded, setFunded] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [workshopEnabled, setWorkshopEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualDisconnect, setManualDisconnect] = useState(false);
  const addressRef = useRef<string | null>(null);

  const loadRoles = useCallback(async (addr: string) => {
    setLoading(true);
    try {
      const [net, isFunded, admin, enabled] = await Promise.all([
        getNetwork(),
        isAccountFunded(addr),
        chain.getAdmin(),
        chain.isWorkshopEnabled(addr),
      ]);
      setWrongNetwork(!net.error && net.networkPassphrase !== NETWORK.networkPassphrase);
      setFunded(isFunded);
      setIsAdmin(admin === addr);
      setWorkshopEnabled(enabled);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  // Detecta la extensión y la cuenta ya autorizada; vigila cambios de cuenta en Freighter.
  useEffect(() => {
    let alive = true;
    async function poll() {
      const c = await isConnected();
      if (!alive) return;
      setInstalled(!c.error && c.isConnected);
      if (c.error || !c.isConnected || manualDisconnect) return;
      const a = await getAddress();
      if (!alive || a.error) return;
      const next = a.address || null;
      if (next !== addressRef.current) {
        addressRef.current = next;
        setAddress(next);
        if (next) loadRoles(next);
      }
    }
    poll();
    const id = setInterval(poll, 2500);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [loadRoles, manualDisconnect]);

  const connect = useCallback(async () => {
    setError(null);
    const c = await isConnected();
    if (c.error || !c.isConnected) {
      setInstalled(false);
      setError('Instala la extensión Freighter para continuar.');
      return;
    }
    const res = await requestAccess();
    if (res.error) {
      setError(res.error.message || 'No se otorgó acceso a la wallet');
      return;
    }
    setManualDisconnect(false);
    addressRef.current = res.address;
    setAddress(res.address);
    await loadRoles(res.address);
  }, [loadRoles]);

  const disconnect = useCallback(() => {
    setManualDisconnect(true);
    addressRef.current = null;
    setAddress(null);
    setIsAdmin(false);
    setWorkshopEnabled(false);
    setFunded(null);
  }, []);

  const refresh = useCallback(async () => {
    if (address) await loadRoles(address);
  }, [address, loadRoles]);

  const fund = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      await fundWithFriendbot(address);
      await loadRoles(address);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setLoading(false);
    }
  }, [address, loadRoles]);

  return (
    <Ctx.Provider
      value={{ installed, address, wrongNetwork, funded, isAdmin, workshopEnabled, loading, error, connect, disconnect, refresh, fund }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useWallet fuera de WalletProvider');
  return ctx;
}
