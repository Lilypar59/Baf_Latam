import {
  Car,
  ArrowLeftRight,
  Wrench,
  PlusCircle,
  ChevronRight,
  Clock,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { vehicles, transfers, maintenanceRecords, permissions } from '@/data/mockData';

interface OwnerDashboardProps {
  onNavigate: (page: 'register-vehicle' | 'vehicle-history' | 'transfer-history' | 'permissions') => void;
}

export default function OwnerDashboard({ onNavigate }: OwnerDashboardProps) {
  const myVehicles = vehicles.filter((v) => v.ownerId === 'u1' && v.status !== 'transferred');
  const myTransfers = transfers.filter((t) => t.fromOwnerId === 'u1' || t.toOwnerId === 'u1');
  const myMaintenance = maintenanceRecords.filter((m) =>
    vehicles.some((v) => v.id === m.vehicleId && v.ownerId === 'u1')
  );
  const activePermissions = permissions.filter(
    (p) => p.granted && vehicles.some((v) => v.id === p.vehicleId && v.ownerId === 'u1')
  );
  const pendingTransfers = myTransfers.filter((t) => t.status === 'pending');

  const stats = [
    {
      label: 'Vehículos',
      value: myVehicles.length,
      sub: `${myVehicles.filter((v) => v.status === 'active').length} activos`,
      icon: Car,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
    {
      label: 'Transferencias',
      value: myTransfers.length,
      sub: `${pendingTransfers.length} pendientes`,
      icon: ArrowLeftRight,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Mantenimientos',
      value: myMaintenance.length,
      sub: `${myMaintenance.filter((m) => m.status === 'in_progress').length} en curso`,
      icon: Wrench,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Permisos activos',
      value: activePermissions.length,
      sub: 'talleres autorizados',
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  const quickActions = [
    {
      label: 'Registrar Vehículo',
      desc: 'Añade un nuevo vehículo',
      icon: PlusCircle,
      color: 'bg-teal-600',
      hover: 'hover:bg-teal-700',
      onClick: () => onNavigate('register-vehicle'),
    },
    {
      label: 'Nueva Transferencia',
      desc: 'Transfiere un vehículo',
      icon: ArrowLeftRight,
      color: 'bg-purple-600',
      hover: 'hover:bg-purple-700',
      onClick: () => onNavigate('transfer-history'),
    },
    {
      label: 'Autorizar Taller',
      desc: 'Da acceso a un taller',
      icon: ShieldCheck,
      color: 'bg-emerald-600',
      hover: 'hover:bg-emerald-700',
      onClick: () => onNavigate('permissions'),
    },
  ];

  const recentActivity = [
    ...myTransfers.map((t) => ({
      type: 'transfer' as const,
      title: `Transferencia ${t.status === 'completed' ? 'completada' : 'pendiente'}`,
      desc: `${t.vehicleBrand} ${t.vehicleModel} · ${t.vehiclePlate}`,
      date: t.date,
      status: t.status,
    })),
    ...myMaintenance.map((m) => ({
      type: 'maintenance' as const,
      title: m.status === 'completed' ? 'Mantenimiento completado' : m.status === 'in_progress' ? 'Mantenimiento en curso' : 'Mantenimiento programado',
      desc: `${m.workshopName} · ${m.vehiclePlate}`,
      date: m.date,
      status: m.status === 'completed' ? 'completed' : m.status === 'in_progress' ? 'in_progress' : 'scheduled',
    })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Hola, Carlos</h1>
          <p className="mt-0.5 text-sm text-slate-500">Aquí está el resumen de tus vehículos</p>
        </div>
        <button onClick={() => onNavigate('register-vehicle')} className="btn-primary">
          <PlusCircle className="h-4 w-4" />
          Registrar Vehículo
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="stat-card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">{stat.value}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{stat.sub}</p>
                </div>
                <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={action.onClick}
              className="card-hover group flex items-center gap-4 p-4 text-left"
            >
              <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${action.color} text-white transition-transform group-hover:scale-105`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                <p className="text-xs text-slate-500">{action.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-slate-400" />
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* My vehicles */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <h2 className="section-title">Mis Vehículos</h2>
            <button onClick={() => onNavigate('vehicle-history')} className="text-sm font-semibold text-teal-600 hover:text-teal-700">
              Ver todos →
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {myVehicles.map((v) => {
              const maintCount = myMaintenance.filter((m) => m.vehicleId === v.id).length;
              return (
                <button
                  key={v.id}
                  onClick={() => onNavigate('vehicle-history')}
                  className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-slate-50"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100">
                    <Car className="h-6 w-6 text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{v.brand} {v.model}</p>
                    <p className="text-xs text-slate-500">
                      <span className="font-mono">{v.plate}</span> · {v.year} · {v.mileage.toLocaleString()} km · {maintCount} mantenimientos
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-3">
                    {v.status === 'active' && <span className="badge badge-success">Activo</span>}
                    {v.status === 'in_transfer' && <span className="badge badge-warning">En transferencia</span>}
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div className="card">
          <div className="border-b border-slate-100 p-5">
            <h2 className="section-title">Actividad Reciente</h2>
          </div>
          <div className="max-h-80 overflow-y-auto p-3">
            {recentActivity.map((activity, i) => {
              const Icon = activity.type === 'transfer' ? ArrowLeftRight : Wrench;
              const statusBadge = activity.status === 'completed' ? 'badge-success' : activity.status === 'pending' || activity.status === 'in_progress' ? 'badge-warning' : 'badge-info';
              const statusLabel = activity.status === 'completed' ? 'Completado' : activity.status === 'pending' ? 'Pendiente' : activity.status === 'in_progress' ? 'En curso' : 'Programado';
              return (
                <div key={i} className="flex gap-3 rounded-lg p-2.5 transition-colors hover:bg-slate-50">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <Icon className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                    <p className="truncate text-xs text-slate-500">{activity.desc}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">{activity.date}</span>
                      <span className={`badge ${statusBadge} text-[10px]`}>{statusLabel}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pending transfer alert */}
      {pendingTransfers.length > 0 && (
        <div className="flex items-center gap-4 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">
              Tienes {pendingTransfers.length} transferencia{pendingTransfers.length > 1 ? 's' : ''} pendiente{pendingTransfers.length > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-amber-700">Revisa el estado de tus transferencias en progreso</p>
          </div>
          <button
            onClick={() => onNavigate('transfer-history')}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
          >
            Revisar
          </button>
        </div>
      )}
    </div>
  );
}
