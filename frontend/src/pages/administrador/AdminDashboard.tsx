import { ShieldCheck, AlertTriangle } from 'lucide-react';
import type { PageKey } from '@/layouts/AppLayout';
import { findDuplicateServices, useStore } from '@/lib/store';

interface AdminDashboardProps {
  onNavigate: (page: PageKey) => void;
}

// Aporte de Lily — HU1JA / HU6JA
// Dashboard del rol Administrador: validar talleres y detectar duplicados.
export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { applications, services } = useStore();
  const pending = applications.filter((w) => w.status === 'pending');
  const duplicateGroups = findDuplicateServices(services);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Panel del Administrador</h1>
        <p className="mt-1 text-sm text-slate-500">Valida talleres nuevos y revisa registros potencialmente duplicados</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="stat-card">
          <p className="text-xs font-medium text-slate-500">Talleres pendientes</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{pending.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-medium text-slate-500">Posibles duplicados</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{duplicateGroups.length}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button onClick={() => onNavigate('admin-workshops')} className="card-hover flex items-start gap-4 p-5 text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Validar talleres</p>
            <p className="mt-0.5 text-xs text-slate-500">HU1JA · Aprobar o rechazar solicitudes</p>
          </div>
        </button>

        <button onClick={() => onNavigate('admin-duplicates')} className="card-hover flex items-start gap-4 p-5 text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Detectar duplicados</p>
            <p className="mt-0.5 text-xs text-slate-500">HU6JA · Revisar registros potencialmente repetidos</p>
          </div>
        </button>
      </div>
    </div>
  );
}
