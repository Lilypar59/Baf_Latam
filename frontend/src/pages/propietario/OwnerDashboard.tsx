import { Car, ArrowLeftRight, Wrench, PlusCircle, ChevronRight, ShieldCheck, Loader2 } from 'lucide-react';
import { useWallet } from '@/lib/wallet';
import { useMyVehicles } from '@/lib/useVehicles';
import { serviceTypeLabels, useStore } from '@/lib/store';
import { shortAddr } from '@/lib/stellar';
import { TxLink } from '@/components/TxStatus';

interface OwnerDashboardProps {
  onNavigate: (page: 'register-vehicle' | 'vehicle-history' | 'transfer-history' | 'permissions') => void;
}

export default function OwnerDashboard({ onNavigate }: OwnerDashboardProps) {
  const { address } = useWallet();
  const { vehicles, loading } = useMyVehicles(address);
  const { services, transfers, applications } = useStore();

  const myIds = new Set(vehicles.map((v) => v.vehicleIdHex));
  const myServices = services.filter((s) => myIds.has(s.vehicleIdHex)).slice().reverse();
  const myTransfers = transfers.filter((t) => t.from === address || t.to === address);
  const serviceCount = vehicles.reduce((n, v) => n + (v.chain?.service_count ?? 0), 0);

  const stats = [
    { label: 'Vehículos', value: vehicles.length, sub: 'historiales a tu nombre', icon: Car, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Servicios', value: serviceCount, sub: 'publicados en Stellar', icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Transferencias', value: myTransfers.length, sub: 'enviadas o recibidas', icon: ArrowLeftRight, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const actions = [
    { key: 'register-vehicle' as const, label: 'Registrar vehículo', desc: 'HU1JP · Empieza un historial verificable', icon: PlusCircle },
    { key: 'vehicle-history' as const, label: 'Ver historial', desc: 'HU2JP · Servicios y su verificación', icon: Car },
    { key: 'permissions' as const, label: 'Permisos a talleres', desc: 'HU3JP · Quién puede consultar tu historial', icon: ShieldCheck },
    { key: 'transfer-history' as const, label: 'Transferir historial', desc: 'HU4JP · Entregar la titularidad a otra cuenta', icon: ArrowLeftRight },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Hola 👋</h1>
        <p className="mt-1 text-sm text-slate-500">
          Cuenta <span className="font-mono">{address ? shortAddr(address) : ''}</span> · historial de tus vehículos en Stellar Testnet
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="stat-card flex items-center gap-4">
            <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${s.bg}`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{loading ? <Loader2 className="h-5 w-5 animate-spin text-slate-300" /> : s.value}</p>
              <p className="text-xs text-slate-500">{s.label} · {s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {!loading && vehicles.length === 0 && (
        <div className="card border-teal-200 bg-teal-50/50 p-6">
          <h2 className="font-semibold text-slate-900">Empieza aquí</h2>
          <ol className="mt-3 space-y-2 text-sm text-slate-600">
            <li>1. <strong>Registra tu vehículo</strong> con su VIN. Firmas con Freighter y quedas como titular del historial.</li>
            <li>2. Lleva el vehículo a un <strong>taller habilitado</strong>: él publica la evidencia de cada servicio usando la placa.</li>
            <li>3. Consulta el historial cuando quieras: cada servicio se verifica contra su hash en Stellar.</li>
          </ol>
          <button onClick={() => onNavigate('register-vehicle')} className="btn-primary mt-4">
            <PlusCircle className="h-4 w-4" /> Registrar vehículo
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {actions.map((a) => (
          <button key={a.key} onClick={() => onNavigate(a.key)} className="card-hover group flex items-center gap-4 p-5 text-left">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <a.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">{a.label}</p>
              <p className="mt-0.5 text-xs text-slate-500">{a.desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-teal-600" />
          </button>
        ))}
      </div>

      {myServices.length > 0 && (
        <div className="card p-5">
          <h2 className="section-title mb-3">Últimos servicios en tus vehículos</h2>
          <div className="divide-y divide-slate-100">
            {myServices.slice(0, 5).map((s) => (
              <div key={s.serviceIdHex} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-slate-800">{serviceTypeLabels[s.type] ?? s.type} · <span className="font-mono">{s.plate}</span></p>
                  <p className="text-xs text-slate-500">
                    {s.date} · {applications.find((a) => a.wallet === s.workshop)?.name ?? s.workshopName}
                  </p>
                </div>
                <TxLink hash={s.txHash} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
