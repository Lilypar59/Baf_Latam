import { useEffect, useState } from 'react';
import { Wrench, CheckCircle2, Loader2, Car, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useWallet } from '@/lib/wallet';
import { chain, recordHashOf, serviceIdOf, shortAddr, shortHex, type ChainVehicle } from '@/lib/stellar';
import { serviceTypeLabels, store, useStore, type StoredService } from '@/lib/store';
import { TxLink, TxProgress, useTx } from '@/components/TxStatus';
import type { PageKey } from '@/layouts/AppLayout';

// Aporte de Alexis — HU2JT: registro de servicio, y HU3JT: evidencia de publicación.
// El registro completo queda off-chain; al contrato va el id del servicio y el
// SHA-256 del registro, firmado por la cuenta del taller habilitado.
export default function RegisterService({ onNavigate }: { onNavigate?: (p: PageKey) => void }) {
  const { address, workshopEnabled } = useWallet();
  const { vehicles, services, applications } = useStore();
  const tx = useTx();
  const [plate, setPlate] = useState('');
  const [type, setType] = useState('oil_change');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [mileage, setMileage] = useState('');
  const [result, setResult] = useState<StoredService | null>(null);
  const [onchain, setOnchain] = useState<ChainVehicle | null | undefined>(undefined);

  const vehicle = vehicles.find((v) => v.plate === plate.trim().toUpperCase());
  const lastMileage = Math.max(0, ...services.filter((s) => s.vehicleIdHex === vehicle?.vehicleIdHex).map((s) => s.mileage));
  const workshopName = applications.find((a) => a.wallet === address)?.name ?? 'Taller';

  // Confirma en el contrato que el vehículo existe antes de firmar.
  useEffect(() => {
    setOnchain(undefined);
    if (!vehicle) return;
    let alive = true;
    chain.getVehicle(vehicle.vehicleIdHex).then((v) => alive && setOnchain(v));
    return () => {
      alive = false;
    };
  }, [vehicle?.vehicleIdHex]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address || !vehicle || !onchain || tx.busy) return;
    const serviceId = `svc-${Date.now()}`;
    const fields = { serviceId, plate: vehicle.plate, type, mileage: Number(mileage), date, description: description.trim() };
    const [serviceIdHex, recordHashHex] = await Promise.all([serviceIdOf(serviceId), recordHashOf(fields)]);
    const hash = await tx.run((onPhase) =>
      chain.publishService(address, vehicle.vehicleIdHex, serviceIdHex, recordHashHex, onPhase),
    );
    if (!hash) return;
    const saved: StoredService = {
      ...fields,
      serviceIdHex,
      vehicleIdHex: vehicle.vehicleIdHex,
      workshop: address,
      workshopName,
      recordHashHex,
      txHash: hash,
    };
    store.addService(saved);
    setResult(saved);
  }

  if (!workshopEnabled) {
    return (
      <div className="card mx-auto max-w-md p-8 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-amber-500" />
        <h2 className="mt-3 font-bold text-slate-900">Tu taller aún no está habilitado</h2>
        <p className="mt-2 text-sm text-slate-500">
          El contrato solo acepta servicios de talleres validados por el administrador.
        </p>
        {onNavigate && (
          <button onClick={() => onNavigate('workshop-register')} className="btn-primary mx-auto mt-4">Ver mi solicitud</button>
        )}
      </div>
    );
  }

  if (result) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="card max-w-md p-8 text-center animate-scale-in">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Publicación del mantenimiento</h2>
          <span className="badge badge-success mt-2">✓ Publicado en Stellar</span>

          <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-4 text-left text-xs">
            <p className="text-slate-500">Vehículo <span className="float-right font-mono text-slate-700">{result.plate}</span></p>
            <p className="text-slate-500">Network <span className="float-right font-mono text-slate-700">Stellar Testnet</span></p>
            <p className="text-slate-500">Transaction <span className="float-right"><TxLink hash={result.txHash} label="hash" /></span></p>
            <p className="text-slate-500">Hash del registro <span className="float-right font-mono text-slate-700" title={result.recordHashHex}>{shortHex(result.recordHashHex)}</span></p>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            El propietario ya ve este servicio en su historial. Si alguien modifica el registro off-chain, el hash deja de coincidir.
          </p>

          <button
            onClick={() => {
              setResult(null);
              tx.reset();
              setPlate(''); setDescription(''); setMileage('');
            }}
            className="btn-primary mt-6 w-full"
          >
            Registrar otro servicio
          </button>
        </div>
      </div>
    );
  }

  const mileageLow = vehicle && mileage !== '' && Number(mileage) < lastMileage;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="page-title">Registrar servicio</h1>
        <p className="mt-1 text-sm text-slate-500">HU2JT · Deja evidencia verificable del mantenimiento realizado</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6 p-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
            <Wrench className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Detalle del servicio</h2>
            <p className="text-xs text-slate-500">El vehículo debe estar registrado por su propietario</p>
          </div>
        </div>

        <div>
          <label className="label">Placa del vehículo</label>
          <input
            required
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            placeholder="ABC123"
            className="input-field font-mono uppercase"
          />
          {plate.length >= 5 && !vehicle && (
            <p className="mt-2 flex items-center gap-2 text-xs text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5" /> No hay un vehículo registrado con esa placa. El propietario debe registrarlo primero.
            </p>
          )}
          {vehicle && (
            <div className="mt-2 flex items-center gap-3 rounded-lg bg-slate-50 p-3 text-xs">
              <Car className="h-4 w-4 text-teal-600" />
              <span className="font-semibold text-slate-800">{vehicle.brand} {vehicle.model} {vehicle.year}</span>
              <span className="ml-auto text-slate-500">
                {onchain === undefined && <Loader2 className="inline h-3.5 w-3.5 animate-spin" />}
                {onchain === null && <span className="text-red-600">No está en el contrato</span>}
                {onchain && <>Titular <span className="font-mono">{shortAddr(onchain.owner)}</span> · {onchain.service_count} servicios</>}
              </span>
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Tipo de servicio</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="select-field">
              {Object.entries(serviceTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Fecha</label>
            <input required type="date" value={date} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Descripción</label>
            <input required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Cambio de aceite sintético 5W-30" className="input-field" />
          </div>
          <div>
            <label className="label">Kilometraje</label>
            <input required type="number" min={0} value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder={lastMileage ? String(lastMileage) : '45000'} className="input-field" />
            {mileageLow && <p className="mt-1 text-xs text-amber-700">Es menor que el último registrado ({lastMileage.toLocaleString('es-CO')} km).</p>}
          </div>
        </div>

        <TxProgress state={tx.state} />

        <div className="flex justify-end">
          <button type="submit" disabled={tx.busy || !vehicle || !onchain} className="btn-primary">
            {tx.busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publicando evidencia…
              </>
            ) : (
              <>
                <Wrench className="h-4 w-4" />
                Firmar y publicar
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
