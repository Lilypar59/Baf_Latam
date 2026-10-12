import { useState } from 'react';
import {
  ArrowLeftRight,
  ArrowRight,
  Plus,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  Link as LinkIcon,
} from 'lucide-react';
import { transfers, vehicles } from '@/data/mockData';

export default function TransferHistory() {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'rejected'>('all');

  const myTransfers = transfers.filter((t) => t.fromOwnerId === 'u1' || t.toOwnerId === 'u1');
  const filteredTransfers = filter === 'all' ? myTransfers : myTransfers.filter((t) => t.status === filter);
  const myVehicles = vehicles.filter((v) => v.ownerId === 'u1' && v.status === 'active');

  const statusConfig = {
    completed: { icon: CheckCircle2, badge: 'badge-success', label: 'Completada' },
    pending: { icon: Clock, badge: 'badge-warning', label: 'Pendiente' },
    rejected: { icon: XCircle, badge: 'badge-danger', label: 'Rechazada' },
  };

  const filterTabs = [
    { key: 'all' as const, label: 'Todas', count: myTransfers.length },
    { key: 'completed' as const, label: 'Completadas', count: myTransfers.filter((t) => t.status === 'completed').length },
    { key: 'pending' as const, label: 'Pendientes', count: myTransfers.filter((t) => t.status === 'pending').length },
    { key: 'rejected' as const, label: 'Rechazadas', count: myTransfers.filter((t) => t.status === 'rejected').length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Transferencias</h1>
          <p className="mt-1 text-sm text-slate-500">Historial de transferencias de tus vehículos</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="h-4 w-4" />
          Nueva Transferencia
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              filter === tab.key ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
            <span className={`rounded-full px-1.5 text-xs ${filter === tab.key ? 'bg-teal-700/50' : 'bg-slate-100'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Transfer list */}
      <div className="space-y-3">
        {filteredTransfers.map((t) => {
          const StatusIcon = statusConfig[t.status].icon;
          return (
            <div key={t.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                    <ArrowLeftRight className="h-6 w-6 text-slate-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900">{t.vehicleBrand} {t.vehicleModel}</h3>
                      <span className="font-mono text-sm text-slate-500">{t.vehiclePlate}</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 text-sm">
                      <span className="font-medium text-slate-700">{t.fromOwnerName}</span>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                      <span className="font-medium text-slate-700">{t.toOwnerName}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{t.date}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-lg font-bold text-slate-900">${t.price.toLocaleString('es-CO')}</span>
                  <span className={`badge ${statusConfig[t.status].badge}`}>
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig[t.status].label}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                <LinkIcon className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs text-slate-500">Hash:</span>
                <span className="font-mono text-xs text-slate-700">{t.documentHash}</span>
                <span className="ml-auto flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" />
                  Verificado
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTransfers.length === 0 && (
        <div className="card p-12 text-center">
          <ArrowLeftRight className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-400">No hay transferencias en esta categoría</p>
        </div>
      )}

      {/* New transfer modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Nueva Transferencia</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowModal(false); }}>
              <div>
                <label className="label">Vehículo</label>
                <select required className="select-field">
                  <option value="">Seleccionar vehículo...</option>
                  {myVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} — {v.plate}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Comprador (Email)</label>
                <input required type="email" placeholder="comprador@email.com" className="input-field" />
              </div>

              <div>
                <label className="label">Precio (COP)</label>
                <input required type="number" min={0} placeholder="50000000" className="input-field" />
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3">
                <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                <p className="text-xs leading-relaxed text-amber-700">
                  La transferencia quedará pendiente hasta que el comprador confirme.
                  Una vez confirmada, se registrará en la blockchain.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">
                  <ArrowLeftRight className="h-4 w-4" />
                  Crear Transferencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
