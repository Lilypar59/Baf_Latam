import { Wrench, ClipboardList, ShieldCheck, Clock3, XCircle, RefreshCw } from 'lucide-react';
import type { PageKey } from '@/layouts/AppLayout';
import { useWallet } from '@/lib/wallet';
import { serviceTypeLabels, useStore } from '@/lib/store';
import { TxLink } from '@/components/TxStatus';

interface WorkshopDashboardProps {
  onNavigate: (page: PageKey) => void;
}

// Aporte de Alexis — HU1JT / HU2JT / HU3JT
// El estado del taller (habilitado o no) se lee del contrato; la solicitud
// con nombre, NIT, etc. vive off-chain.
export default function WorkshopDashboard({ onNavigate }: WorkshopDashboardProps) {
  const { address, workshopEnabled, refresh, loading } = useWallet();
  const { services, applications } = useStore();
  const application = applications.find((a) => a.wallet === address);
  const myServices = services.filter((s) => s.workshop === address).slice().reverse();

  const status = workshopEnabled
    ? { badge: 'badge-success', text: '✓ Habilitado en Stellar', icon: ShieldCheck }
    : application?.status === 'rejected'
      ? { badge: 'badge-danger', text: 'Solicitud rechazada', icon: XCircle }
      : application
        ? { badge: 'badge-warning', text: '⏳ Pendiente de validación', icon: Clock3 }
        : { badge: 'badge-neutral', text: 'Sin solicitud', icon: Clock3 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Panel del Taller</h1>
        <p className="mt-1 text-sm text-slate-500">
          {application?.name ?? 'Tu taller'} · Publica evidencia verificable de los servicios que realizas
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="stat-card">
          <p className="text-xs font-medium text-slate-500">Servicios publicados</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{myServices.length}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Estado del taller</p>
            <button onClick={refresh} className="text-slate-400 hover:text-slate-600" title="Consultar de nuevo en Stellar">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <span className={`badge ${status.badge} mt-1`}>{status.text}</span>
        </div>
      </div>

      {!workshopEnabled && (
        <div className="card border-amber-200 bg-amber-50/50 p-5 text-sm text-slate-700">
          {application ? (
            <p>
              Tu solicitud está {application.status === 'rejected' ? 'rechazada' : 'en revisión'}. Solo los talleres habilitados por el
              administrador pueden publicar servicios: el contrato rechaza cualquier otro.
            </p>
          ) : (
            <>
              <p>Para publicar servicios, primero solicita la incorporación de tu taller. Un administrador la valida en Stellar.</p>
              <button onClick={() => onNavigate('workshop-register')} className="btn-primary mt-3">
                <ShieldCheck className="h-4 w-4" /> Solicitar incorporación
              </button>
            </>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <button onClick={() => onNavigate('workshop-register')} className="card-hover flex items-start gap-4 p-5 text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{workshopEnabled ? 'Mi taller' : 'Solicitar incorporación'}</p>
            <p className="mt-0.5 text-xs text-slate-500">HU1JT · Datos y estado de tu taller</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('workshop-service')}
          disabled={!workshopEnabled}
          className={`card-hover flex items-start gap-4 p-5 text-left ${!workshopEnabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Registrar servicio</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {workshopEnabled ? 'HU2JT / HU3JT · Publicar la evidencia de un mantenimiento' : 'Disponible cuando tu taller esté habilitado'}
            </p>
          </div>
        </button>
      </div>

      {myServices.length > 0 && (
        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-slate-500" />
            <h2 className="section-title">Últimos servicios publicados</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {myServices.map((m) => (
              <div key={m.serviceIdHex} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-slate-800">{m.description || serviceTypeLabels[m.type]}</p>
                  <p className="text-xs text-slate-500">
                    {m.plate} · {new Date(m.date + 'T00:00').toLocaleDateString('es-CO')} · {m.mileage.toLocaleString('es-CO')} km
                  </p>
                </div>
                <TxLink hash={m.txHash} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
