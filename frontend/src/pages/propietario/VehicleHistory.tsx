import { useState } from 'react';
import {
  Car,
  Fuel,
  Calendar,
  Gauge,
  Palette,
  Hash,
  ChevronRight,
  Search,
  X,
  Wrench,
  CheckCircle2,
  Clock,
  CalendarPlus,
} from 'lucide-react';
import { vehicles, maintenanceRecords } from '@/data/mockData';
import type { Vehicle } from '@/types';

const fuelLabels: Record<string, string> = {
  gasoline: 'Gasolina',
  diesel: 'Diésel',
  electric: 'Eléctrico',
  hybrid: 'Híbrido',
};

const maintenanceTypeLabels: Record<string, string> = {
  oil_change: 'Cambio de aceite',
  brake_service: 'Servicio de frenos',
  tire_rotation: 'Rotación de neumáticos',
  inspection: 'Inspección',
  repair: 'Reparación',
  other: 'Otro',
};

const statusConfig = {
  completed: { icon: CheckCircle2, badge: 'badge-success', label: 'Completado' },
  in_progress: { icon: Clock, badge: 'badge-warning', label: 'En progreso' },
  scheduled: { icon: CalendarPlus, badge: 'badge-info', label: 'Programado' },
};

export default function VehicleHistory() {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const myVehicles = vehicles.filter((v) => v.ownerId === 'u1');
  const filteredVehicles = myVehicles.filter(
    (v) =>
      v.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${v.brand} ${v.model}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedVehicle) {
    const vehicleMaintenance = maintenanceRecords.filter((m) => m.vehicleId === selectedVehicle.id);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedVehicle(null)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white transition-colors hover:bg-slate-50"
          >
            <ChevronRight className="h-5 w-5 rotate-180 text-slate-600" />
          </button>
          <div>
            <h1 className="page-title">{selectedVehicle.brand} {selectedVehicle.model}</h1>
            <p className="text-sm text-slate-500">Placa: <span className="font-mono">{selectedVehicle.plate}</span></p>
          </div>
        </div>

        {/* Vehicle details */}
        <div className="card overflow-hidden">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-teal-50">
                  <Car className="h-8 w-8 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedVehicle.brand} {selectedVehicle.model}</h2>
                  <p className="font-mono text-sm text-slate-500">{selectedVehicle.plate}</p>
                </div>
              </div>
              {selectedVehicle.status === 'active' && <span className="badge badge-success">Activo</span>}
              {selectedVehicle.status === 'in_transfer' && <span className="badge badge-warning">En transferencia</span>}
              {selectedVehicle.status === 'transferred' && <span className="badge badge-neutral">Transferido</span>}
            </div>
          </div>

          <div className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Calendar, label: 'Año', value: String(selectedVehicle.year) },
              { icon: Palette, label: 'Color', value: selectedVehicle.color },
              { icon: Fuel, label: 'Combustible', value: fuelLabels[selectedVehicle.fuelType] },
              { icon: Gauge, label: 'Kilometraje', value: `${selectedVehicle.mileage.toLocaleString()} km` },
              { icon: Hash, label: 'VIN', value: selectedVehicle.vin },
              { icon: Calendar, label: 'Registrado', value: selectedVehicle.registrationDate },
            ].map((detail) => {
              const Icon = detail.icon;
              return (
                <div key={detail.label} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Icon className="h-4 w-4" />
                    {detail.label}
                  </div>
                  <p className="mt-1.5 font-medium text-slate-900">{detail.value}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Maintenance timeline */}
        <div className="card p-6">
          <h3 className="mb-5 section-title">Historial de Mantenimientos</h3>
          {vehicleMaintenance.length === 0 ? (
            <div className="py-10 text-center">
              <Wrench className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm text-slate-400">No hay mantenimientos registrados</p>
            </div>
          ) : (
            <div className="relative space-y-4 before:absolute before:left-[19px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-slate-200">
              {vehicleMaintenance.map((m) => {
                const StatusIcon = statusConfig[m.status].icon;
                return (
                  <div key={m.id} className="relative flex gap-4">
                    <div className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-white bg-teal-100 shadow-sm">
                      <div className="h-2.5 w-2.5 rounded-full bg-teal-600" />
                    </div>
                    <div className="flex-1 rounded-lg border border-slate-200 p-4 transition-shadow hover:shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-slate-900">{maintenanceTypeLabels[m.type]}</p>
                          <p className="text-xs text-slate-500">{m.date} · {m.workshopName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-700">${m.cost.toLocaleString('es-CO')}</span>
                          <span className={`badge ${statusConfig[m.status].badge}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig[m.status].label}
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{m.description}</p>
                      <p className="mt-1 text-xs text-slate-400">Kilometraje: {m.mileage.toLocaleString()} km</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Mis Vehículos</h1>
        <p className="mt-1 text-sm text-slate-500">Selecciona un vehículo para ver su historial completo</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por placa o modelo..."
          className="input-field pl-10"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredVehicles.map((v) => {
          const maintCount = maintenanceRecords.filter((m) => m.vehicleId === v.id).length;
          return (
            <button
              key={v.id}
              onClick={() => setSelectedVehicle(v)}
              className="card-hover group p-5 text-left"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50">
                  <Car className="h-6 w-6 text-teal-600" />
                </div>
                {v.status === 'active' && <span className="badge badge-success">Activo</span>}
                {v.status === 'in_transfer' && <span className="badge badge-warning">En transferencia</span>}
                {v.status === 'transferred' && <span className="badge badge-neutral">Transferido</span>}
              </div>
              <h3 className="mt-3 font-bold text-slate-900">{v.brand} {v.model}</h3>
              <p className="font-mono text-sm text-slate-500">{v.plate}</p>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-500">{v.year} · {v.mileage.toLocaleString()} km</span>
                <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                  <Wrench className="h-3 w-3" />
                  {maintCount}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-teal-600 opacity-0 transition-opacity group-hover:opacity-100">
                Ver historial <ChevronRight className="h-4 w-4" />
              </div>
            </button>
          );
        })}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="card p-12 text-center">
          <Car className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-400">No se encontraron vehículos</p>
        </div>
      )}
    </div>
  );
}
