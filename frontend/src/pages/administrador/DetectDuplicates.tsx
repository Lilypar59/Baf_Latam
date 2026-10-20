import { AlertTriangle } from 'lucide-react';
import { findDuplicateServices, serviceTypeLabels, useStore } from '@/lib/store';
import { TxLink } from '@/components/TxStatus';

// Aporte de Lily — HU6JA: Detectar registros potencialmente duplicados.
// Agrupa servicios con el mismo vehículo, tipo y fecha publicados por talleres
// distintos. Corre off-chain (backend), como define el Blueprint; la evidencia
// en Stellar no se borra, el administrador solo la marca para revisión.
export default function DetectDuplicates() {
  const { services } = useStore();
  const groups = findDuplicateServices(services);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="page-title">Detectar duplicados</h1>
        <p className="mt-1 text-sm text-slate-500">
          HU6JA · Servicios con el mismo vehículo, tipo y fecha, registrados por talleres distintos
        </p>
      </div>

      {groups.length === 0 && (
        <div className="card p-6 text-sm text-slate-500">No se encontraron registros potencialmente duplicados.</div>
      )}

      {groups.map((group, i) => (
        <div key={i} className="card space-y-3 p-5">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-4 w-4" />
            <h2 className="text-sm font-semibold">Posible registro duplicado</h2>
          </div>

          {group.map((m) => (
            <div key={m.serviceIdHex} className="rounded-lg bg-slate-50 p-3 text-xs">
              <p className="text-slate-500">Fecha <span className="float-right font-mono text-slate-700">{m.date}</span></p>
              <p className="text-slate-500">Vehículo <span className="float-right font-mono text-slate-700">{m.plate}</span></p>
              <p className="text-slate-500">Tipo <span className="float-right text-slate-700">{serviceTypeLabels[m.type] ?? m.type}</span></p>
              <p className="text-slate-500">Taller <span className="float-right text-slate-700">{m.workshopName}</span></p>
              <p className="text-slate-500">Evidencia <span className="float-right"><TxLink hash={m.txHash} /></span></p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
