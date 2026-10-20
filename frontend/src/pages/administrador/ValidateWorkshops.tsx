import { useState } from 'react';
import { ShieldCheck, Check, X, Loader2 } from 'lucide-react';
import { useWallet } from '@/lib/wallet';
import { chain, shortAddr } from '@/lib/stellar';
import { store, useStore } from '@/lib/store';
import { TxLink, TxProgress, useTx } from '@/components/TxStatus';

// Aporte de Lily — HU1JA: Validar la incorporación de un taller.
// Aprobar o rechazar firma `set_workshop(cuenta, true|false)` en el contrato
// con la cuenta administradora. Solo así el taller puede publicar servicios.
export default function ValidateWorkshops() {
  const { address } = useWallet();
  const { applications } = useStore();
  const tx = useTx();
  const [working, setWorking] = useState<string | null>(null);

  async function decide(id: string, wallet: string, decision: 'approved' | 'rejected') {
    if (!address || tx.busy) return;
    setWorking(id);
    const hash = await tx.run((onPhase) => chain.setWorkshop(address, wallet, decision === 'approved', onPhase));
    if (hash) store.updateApplication(id, { status: decision, txHash: hash });
    setWorking(null);
  }

  const pending = applications.filter((w) => w.status === 'pending');
  const decided = applications.filter((w) => w.status !== 'pending');

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="page-title">Validar talleres</h1>
        <p className="mt-1 text-sm text-slate-500">HU1JA · Aprueba o rechaza las solicitudes. Tu decisión queda firmada en Stellar.</p>
      </div>

      <TxProgress state={tx.state} />

      <div className="card p-5">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-slate-500" />
          <h2 className="section-title">Solicitudes pendientes</h2>
        </div>

        {pending.length === 0 && <p className="text-sm text-slate-500">No hay solicitudes pendientes.</p>}

        <div className="divide-y divide-slate-100">
          {pending.map((w) => (
            <div key={w.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{w.name}</p>
                <p className="text-xs text-slate-500">NIT: {w.nit} · {w.city} · {w.email}</p>
                <p className="mt-0.5 font-mono text-xs text-slate-400">Cuenta {shortAddr(w.wallet)}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => decide(w.id, w.wallet, 'approved')} disabled={tx.busy} className="btn-primary">
                  {working === w.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Aprobar
                </button>
                <button onClick={() => decide(w.id, w.wallet, 'rejected')} disabled={tx.busy} className="btn-secondary">
                  <X className="h-4 w-4" />
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {decided.length > 0 && (
        <div className="card p-5">
          <h2 className="section-title mb-3">Ya revisadas</h2>
          <div className="divide-y divide-slate-100">
            {decided.map((w) => (
              <div key={w.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <span className="text-slate-700">{w.name}</span>
                  <span className="ml-2 font-mono text-xs text-slate-400">{shortAddr(w.wallet)}</span>
                </div>
                <div className="flex items-center gap-3">
                  {w.txHash && <TxLink hash={w.txHash} />}
                  <span className={`badge ${w.status === 'approved' ? 'badge-success' : 'badge-danger'}`}>
                    {w.status === 'approved' ? 'Habilitado' : 'Rechazado'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
