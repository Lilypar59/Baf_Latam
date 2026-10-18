import { useState } from 'react';
import {
  ShieldCheck,
  ShieldX,
  Wrench,
  Car,
  Plus,
  X,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { permissions, vehicles } from '@/data/mockData';
import type { Permission } from '@/types';

const scopeLabels: Record<string, string> = {
  full: 'Acceso completo',
  maintenance_only: 'Solo mantenimiento',
  diagnostic_only: 'Solo diagnóstico',
};

const scopeColors: Record<string, string> = {
  full: 'badge-info',
  maintenance_only: 'badge-success',
  diagnostic_only: 'badge-warning',
};

export default function Permissions() {
  const [showModal, setShowModal] = useState(false);
  // Antes: "Otorgar Permiso" y "Revocar" no hacían nada (el formulario solo
  // cerraba el modal, y el botón Revocar no tenía ninguna acción conectada).
  // Se guarda la lista de permisos en estado local, inicializada con los
  // datos simulados, para que ambas acciones se reflejen de verdad en pantalla.
  const [allPermissions, setAllPermissions] = useState<Permission[]>(permissions);

  const [newVehicleId, setNewVehicleId] = useState('');
  const [newWorkshopEmail, setNewWorkshopEmail] = useState('');
  const [newScope, setNewScope] = useState<Permission['scope']>('maintenance_only');
  const [newExpiry, setNewExpiry] = useState('');

  const myVehicles = vehicles.filter((v) => v.ownerId === 'u1');
  const myVehicleIds = myVehicles.map((v) => v.id);
  const myPermissions = allPermissions.filter((p) => myVehicleIds.includes(p.vehicleId));

  const granted = myPermissions.filter((p) => p.granted);
  const revoked = myPermissions.filter((p) => !p.granted);

  function handleGrant(e: React.FormEvent) {
    e.preventDefault();
    const vehicle = myVehicles.find((v) => v.id === newVehicleId);
    if (!vehicle) return;

    const newPermission: Permission = {
      id: `p${allPermissions.length + 1}`,
      workshopId: `manual-${Date.now()}`,
      workshopName: newWorkshopEmail,
      vehicleId: vehicle.id,
      vehiclePlate: vehicle.plate,
      granted: true,
      dateGranted: new Date().toISOString().slice(0, 10),
      expiryDate: newExpiry,
      scope: newScope,
    };

    setAllPermissions((prev) => [...prev, newPermission]);
    setShowModal(false);
    setNewVehicleId('');
    setNewWorkshopEmail('');
    setNewScope('maintenance_only');
    setNewExpiry('');
  }

  function handleRevoke(id: string) {
    setAllPermissions((prev) => prev.map((p) => (p.id === id ? { ...p, granted: false } : p)));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Permisos a Talleres</h1>
          <p className="mt-1 text-sm text-slate-500">Controla qué talleres pueden acceder a tus vehículos</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="h-4 w-4" />
          Otorgar Permiso
        </button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Permisos activos</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">{granted.length}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Revocados</p>
              <p className="mt-1 text-2xl font-bold text-red-600">{revoked.length}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
              <ShieldX className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Vehículos sin permiso</p>
              <p className="mt-1 text-2xl font-bold text-slate-700">
                {myVehicles.length - new Set(granted.map((p) => p.vehicleId)).size}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
              <Car className="h-5 w-5 text-slate-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Active permissions */}
      <div className="card">
        <div className="border-b border-slate-100 p-5">
          <h2 className="section-title">Permisos Activos</h2>
        </div>
        {granted.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">No hay permisos activos</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {granted.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                    <Wrench className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{p.workshopName}</p>
                    <p className="text-xs text-slate-500">
                      Vehículo: <span className="font-mono">{p.vehiclePlate}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className={`badge ${scopeColors[p.scope]}`}>{scopeLabels[p.scope]}</span>
                  <div className="hidden items-center gap-1.5 text-xs text-slate-500 sm:flex">
                    <Clock className="h-3.5 w-3.5" />
                    Expira: {p.expiryDate}
                  </div>
                  <button onClick={() => handleRevoke(p.id)} className="btn-danger">
                    <ShieldX className="h-3.5 w-3.5" />
                    Revocar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revoked */}
      {revoked.length > 0 && (
        <div className="card">
          <div className="border-b border-slate-100 p-5">
            <h2 className="section-title">Permisos Revocados</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {revoked.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 opacity-60">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    <ShieldX className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">{p.workshopName}</p>
                    <p className="text-xs text-slate-400">
                      Vehículo: <span className="font-mono">{p.vehiclePlate}</span>
                    </p>
                  </div>
                </div>
                <span className="badge badge-danger">Revocado</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grant modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Otorgar Permiso</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleGrant}>
              <div>
                <label className="label">Vehículo</label>
                <select required value={newVehicleId} onChange={(e) => setNewVehicleId(e.target.value)} className="select-field">
                  <option value="">Seleccionar vehículo...</option>
                  {myVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} — {v.plate}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Taller (Email)</label>
                <input
                  required
                  type="email"
                  value={newWorkshopEmail}
                  onChange={(e) => setNewWorkshopEmail(e.target.value)}
                  placeholder="taller@email.com"
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Alcance del permiso</label>
                <select
                  required
                  value={newScope}
                  onChange={(e) => setNewScope(e.target.value as Permission['scope'])}
                  className="select-field"
                >
                  <option value="maintenance_only">Solo mantenimiento</option>
                  <option value="diagnostic_only">Solo diagnóstico</option>
                  <option value="full">Acceso completo</option>
                </select>
              </div>

              <div>
                <label className="label">Fecha de expiración</label>
                <input required type="date" value={newExpiry} onChange={(e) => setNewExpiry(e.target.value)} className="input-field" />
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-teal-50 p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-600" />
                <p className="text-xs leading-relaxed text-teal-700">
                  Puedes revocar este permiso en cualquier momento. El taller solo podrá acceder
                  a los datos del vehículo dentro del alcance seleccionado.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">
                  <ShieldCheck className="h-4 w-4" />
                  Otorgar Permiso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
