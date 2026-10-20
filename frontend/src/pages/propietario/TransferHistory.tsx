import { useState } from 'react';
import { ArrowLeftRight, ArrowRight, Plus, X, Info, Loader2 } from 'lucide-react';
import { useWallet } from '@/lib/wallet';
import { useMyVehicles } from '@/lib/useVehicles';
import { chain, isValidAddress, shortAddr } from '@/lib/stellar';
import { store, useStore } from '@/lib/store';
import { TxLink, TxProgress, TxSuccess, useTx } from '@/components/TxStatus';

// HU4JP(4): transferencia de la TITULARIDAD DEL HISTORIAL dentro de VehicleChain.
// No es el traspaso jurídico del vehículo: no hay comprador ni precio, y los
// servicios anteriores no cambian. Solo el titular actual puede firmarla.
export default function TransferHistory() {
  const { address } = useWallet();
  const { vehicles, reload } = useMyVehicles(address);
  const { transfers } = useStore();
  const tx = useTx();
  const [showModal, setShowModal] = useState(false);
  const [vehicleId, setVehicleId] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const myTransfers = transfers.filter((t) => t.from === address || t.to === address).slice().reverse();
  const vehicle = vehicles.find((v) => v.vehicleIdHex === vehicleId);
  const addrOk = isValidAddress(newOwner);
  const sameOwner = newOwner.trim() === address;

  function close() {
    if (tx.busy) return;
    setShowModal(false);
    setVehicleId('');
    setNewOwner('');
    setConfirmed(false);
    tx.reset();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address || !vehicle || !addrOk || sameOwner || !confirmed) return;
    const to = newOwner.trim();
    const hash = await tx.run((onPhase) => chain.transferHistory(address, vehicle.vehicleIdHex, to, onPhase));
    if (!hash) return;
    store.addTransfer({
      id: `t${Date.now()}`,
      vehicleIdHex: vehicle.vehicleIdHex,
      plate: vehicle.plate,
      from: address,
      to,
      date: new Date().toISOString().slice(0, 10),
      txHash: hash,
    });
    reload();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Transferir historial</h1>
          <p className="mt-1 text-sm text-slate-500">HU4JP · Entrega la titularidad del historial de un vehículo a otra cuenta</p>
        </div>
        <button onClick={() => setShowModal(true)} disabled={vehicles.length === 0} className="btn-primary">
          <Plus className="h-4 w-4" />
          Nueva transferencia
        </button>
      </div>

      <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <p>
          La transferencia cambia quién es el titular del historial <strong>dentro de VehicleChain</strong>. No reemplaza el traspaso
          jurídico del vehículo, que se hace por los canales oficiales. Los servicios ya publicados no se modifican.
        </p>
      </div>

      <div className="space-y-3">
        {myTransfers.map((t) => {
          const outgoing = t.from === address;
          return (
            <div key={t.id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                  <ArrowLeftRight className="h-6 w-6 text-slate-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{t.plate}</span>
                    <span className={`badge ${outgoing ? 'badge-neutral' : 'badge-success'}`}>{outgoing ? 'Enviada' : 'Recibida'}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 font-mono text-xs text-slate-600">
                    {shortAddr(t.from)} <ArrowRight className="h-3 w-3 text-slate-400" /> {shortAddr(t.to)}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{t.date}</p>
                </div>
              </div>
              <TxLink hash={t.txHash} />
            </div>
          );
        })}
      </div>

      {myTransfers.length === 0 && (
        <div className="card p-12 text-center">
          <ArrowLeftRight className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-400">
            {vehicles.length === 0 ? 'Necesitas ser titular de al menos un vehículo para transferir su historial.' : 'Aún no hay transferencias'}
          </p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={close}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Transferir titularidad del historial</h2>
              <button onClick={close} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {tx.state.status === 'success' ? (
              <div className="space-y-4">
                <TxSuccess hash={tx.state.hash} title="Historial transferido">
                  <p>{vehicle?.plate ?? 'El vehículo'} ahora pertenece a <span className="font-mono">{shortAddr(newOwner.trim())}</span>.</p>
                  <p>Dejará de aparecer en tus vehículos.</p>
                </TxSuccess>
                <button onClick={close} className="btn-primary w-full justify-center">Listo</button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="label">Vehículo</label>
                  <select required value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className="select-field">
                    <option value="">Seleccionar vehículo...</option>
                    {vehicles.map((v) => (
                      <option key={v.vehicleIdHex} value={v.vehicleIdHex}>
                        {v.brand} {v.model} — {v.plate} ({v.chain?.service_count ?? 0} servicios)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Cuenta Stellar del nuevo titular</label>
                  <input
                    required
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    placeholder="G…"
                    className="input-field font-mono text-xs"
                  />
                  {newOwner && !addrOk && <p className="mt-1 text-xs text-red-600">No es una dirección Stellar válida (empieza por G y tiene 56 caracteres).</p>}
                  {sameOwner && <p className="mt-1 text-xs text-red-600">Es tu propia cuenta.</p>}
                </div>

                <label className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
                  <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5" />
                  Entiendo que pierdo la titularidad del historial de este vehículo en VehicleChain y que la operación no se puede deshacer
                  desde mi cuenta.
                </label>

                <TxProgress state={tx.state} />

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={close} disabled={tx.busy} className="btn-secondary">Cancelar</button>
                  <button type="submit" disabled={tx.busy || !vehicle || !addrOk || sameOwner || !confirmed} className="btn-primary">
                    {tx.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowLeftRight className="h-4 w-4" />}
                    Firmar transferencia
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
