import { useEffect, useState } from 'react';
import { Buffer } from 'buffer';
import {
  Car,
  ChevronRight,
  Search,
  X,
  Wrench,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  PlusCircle,
  RefreshCw,
  ArrowLeftRight,
} from 'lucide-react';
import { useWallet } from '@/lib/wallet';
import { useMyVehicles, type VehicleWithChain } from '@/lib/useVehicles';
import { chain, recordHashOf, shortAddr, shortHex, type ServiceEvidence } from '@/lib/stellar';
import { serviceTypeLabels, useStore, type StoredService } from '@/lib/store';
import { TxLink } from '@/components/TxStatus';
import type { PageKey } from '@/layouts/AppLayout';

const fuelLabels: Record<string, string> = {
  gasoline: 'Gasolina',
  diesel: 'Diésel',
  electric: 'Eléctrico',
  hybrid: 'Híbrido',
};

interface HistoryRow {
  serviceIdHex: string;
  evidence: ServiceEvidence | null;
  offchain?: StoredService;
  intact: boolean | null; // null = sin registro off-chain para comparar
}

// HU2JP(2): historial del vehículo leído del contrato. Cada servicio se
// cruza con su registro off-chain y se recalcula el hash para comprobar que
// no fue modificado.
function VehicleDetail({ vehicle, onBack, onNavigate }: { vehicle: VehicleWithChain; onBack: () => void; onNavigate?: (p: PageKey) => void }) {
  const { services, applications } = useStore();
  const [rows, setRows] = useState<HistoryRow[] | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const onchain = await chain.getVehicleServices(vehicle.vehicleIdHex);
      const out = await Promise.all(
        onchain.map(async ({ serviceIdHex, evidence }) => {
          const offchain = services.find((s) => s.serviceIdHex === serviceIdHex);
          let intact: boolean | null = null;
          if (offchain && evidence) intact = (await recordHashOf(offchain)) === Buffer.from(evidence.record_hash).toString('hex');
          return { serviceIdHex, evidence, offchain, intact };
        }),
      );
      if (alive) setRows(out.reverse());
    })();
    return () => {
      alive = false;
    };
  }, [vehicle.vehicleIdHex, services]);

  const workshopName = (addr: string) => applications.find((a) => a.wallet === addr)?.name ?? shortAddr(addr);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50">
          <ChevronRight className="h-5 w-5 rotate-180 text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="page-title">{vehicle.brand} {vehicle.model}</h1>
          <p className="text-sm text-slate-500">Placa: <span className="font-mono">{vehicle.plate}</span></p>
        </div>
        {onNavigate && (
          <button onClick={() => onNavigate('transfer-history')} className="btn-secondary">
            <ArrowLeftRight className="h-4 w-4" /> Transferir historial
          </button>
        )}
      </div>

      <div className="card grid gap-4 p-6 text-sm sm:grid-cols-3">
        <div><p className="text-xs text-slate-500">Año · Color</p><p className="font-semibold text-slate-800">{vehicle.year} · {vehicle.color}</p></div>
        <div><p className="text-xs text-slate-500">Combustible</p><p className="font-semibold text-slate-800">{fuelLabels[vehicle.fuelType]}</p></div>
        <div><p className="text-xs text-slate-500">VIN</p><p className="font-mono text-slate-800">{vehicle.vin}</p></div>
        <div><p className="text-xs text-slate-500">Titular del historial (on-chain)</p><p className="font-mono text-slate-800">{vehicle.chain ? shortAddr(vehicle.chain.owner) : '—'}</p></div>
        <div><p className="text-xs text-slate-500">Servicios publicados</p><p className="font-semibold text-slate-800">{vehicle.chain?.service_count ?? 0}</p></div>
        <div><p className="text-xs text-slate-500">Transferencias del historial</p><p className="font-semibold text-slate-800">{vehicle.chain?.transfer_count ?? 0}</p></div>
      </div>

      <div className="card p-6">
        <div className="mb-5 flex items-center gap-2">
          <Wrench className="h-5 w-5 text-slate-500" />
          <h2 className="section-title">Historial de mantenimientos</h2>
        </div>

        {!rows && <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Leyendo el historial en Stellar…</p>}
        {rows?.length === 0 && (
          <p className="text-sm text-slate-500">Aún no hay servicios publicados. Cuando un taller habilitado registre un servicio a la placa {vehicle.plate}, aparecerá aquí.</p>
        )}

        <div className="space-y-4">
          {rows?.map((r) => (
            <div key={r.serviceIdHex} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">
                    {r.offchain ? serviceTypeLabels[r.offchain.type] ?? r.offchain.type : 'Servicio'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {r.offchain ? `${new Date(r.offchain.date + 'T00:00').toLocaleDateString('es-CO')} · ${r.offchain.mileage.toLocaleString('es-CO')} km · ` : ''}
                    {r.evidence ? workshopName(r.evidence.workshop) : ''}
                  </p>
                </div>
                {r.intact === true && <span className="badge badge-success"><ShieldCheck className="h-3 w-3" /> Íntegro</span>}
                {r.intact === false && <span className="badge badge-danger"><ShieldAlert className="h-3 w-3" /> Modificado off-chain</span>}
                {r.intact === null && <span className="badge badge-neutral">Solo evidencia on-chain</span>}
              </div>
              {r.offchain?.description && <p className="mt-2 text-sm text-slate-600">{r.offchain.description}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
                {r.evidence && <span>Hash: <span className="font-mono text-slate-700" title={Buffer.from(r.evidence.record_hash).toString('hex')}>{shortHex(Buffer.from(r.evidence.record_hash).toString('hex'))}</span></span>}
                {r.evidence && <span>Ledger {r.evidence.ledger}</span>}
                {r.offchain?.txHash && <TxLink hash={r.offchain.txHash} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function VehicleHistory({ onNavigate }: { onNavigate?: (p: PageKey) => void }) {
  const { address } = useWallet();
  const { vehicles, loading, reload } = useMyVehicles(address);
  const { services } = useStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const current = vehicles.find((v) => v.vehicleIdHex === selected);
  if (current) return <VehicleDetail vehicle={current} onBack={() => setSelected(null)} onNavigate={onNavigate} />;

  const q = searchQuery.toLowerCase();
  const filtered = vehicles.filter((v) => v.plate.toLowerCase().includes(q) || `${v.brand} ${v.model}`.toLowerCase().includes(q));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Mis Vehículos</h1>
          <p className="mt-1 text-sm text-slate-500">HU2JP · Vehículos cuyo historial tienes a tu nombre en VehicleChain</p>
        </div>
        <button onClick={reload} className="btn-ghost" title="Actualizar desde Stellar">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar por placa o modelo..." className="input-field pl-10" />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((v) => (
          <button key={v.vehicleIdHex} onClick={() => setSelected(v.vehicleIdHex)} className="card-hover group p-5 text-left">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50">
                <Car className="h-6 w-6 text-teal-600" />
              </div>
              <span className="badge badge-success"><ShieldCheck className="h-3 w-3" /> En Stellar</span>
            </div>
            <h3 className="mt-3 font-bold text-slate-900">{v.brand} {v.model}</h3>
            <p className="font-mono text-sm text-slate-500">{v.plate}</p>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-xs text-slate-500">{v.year} · {fuelLabels[v.fuelType]}</span>
              <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                <Wrench className="h-3 w-3" />
                {v.chain?.service_count ?? services.filter((s) => s.vehicleIdHex === v.vehicleIdHex).length}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-teal-600 opacity-0 transition-opacity group-hover:opacity-100">
              Ver historial <ChevronRight className="h-4 w-4" />
            </div>
          </button>
        ))}
      </div>

      {loading && vehicles.length === 0 && (
        <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Consultando titularidad en Stellar…</p>
      )}

      {!loading && filtered.length === 0 && (
        <div className="card p-12 text-center">
          <Car className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">
            {vehicles.length === 0 ? 'Esta cuenta aún no es titular de ningún historial.' : 'No se encontraron vehículos'}
          </p>
          {vehicles.length === 0 && onNavigate && (
            <button onClick={() => onNavigate('register-vehicle')} className="btn-primary mx-auto mt-4">
              <PlusCircle className="h-4 w-4" /> Registrar mi primer vehículo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
