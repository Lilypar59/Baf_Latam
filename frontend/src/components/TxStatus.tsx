import { useCallback, useState } from 'react';
import { AlertCircle, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
import { explorer, friendlyError, shortHex, type TxPhase } from '@/lib/stellar';

export type TxState =
  | { status: 'idle' }
  | { status: 'pending'; phase: TxPhase }
  | { status: 'success'; hash: string }
  | { status: 'error'; message: string };

/** Ejecuta una transacción del contrato y expone su progreso a la UI. */
export function useTx() {
  const [state, setState] = useState<TxState>({ status: 'idle' });

  const run = useCallback(async (fn: (onPhase: (p: TxPhase) => void) => Promise<string>) => {
    setState({ status: 'pending', phase: 'simulating' });
    try {
      const hash = await fn((phase) => setState({ status: 'pending', phase }));
      setState({ status: 'success', hash });
      return hash;
    } catch (e) {
      setState({ status: 'error', message: friendlyError(e) });
      return null;
    }
  }, []);

  const reset = useCallback(() => setState({ status: 'idle' }), []);
  return { state, run, reset, busy: state.status === 'pending' };
}

const phaseLabel: Record<TxPhase, string> = {
  simulating: 'Validando con el contrato…',
  signing: 'Confirma la transacción en Freighter…',
  sending: 'Enviando a Stellar Testnet…',
};

export function TxProgress({ state }: { state: TxState }) {
  if (state.status === 'pending') {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-teal-50 p-3 text-sm text-teal-800">
        <Loader2 className="h-4 w-4 animate-spin" />
        {phaseLabel[state.phase]}
      </div>
    );
  }
  if (state.status === 'error') {
    return (
      <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{state.message}</span>
      </div>
    );
  }
  return null;
}

export function TxLink({ hash, label = 'Ver transacción' }: { hash: string; label?: string }) {
  return (
    <a
      href={explorer.tx(hash)}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 font-mono text-xs text-teal-700 hover:underline"
      title={hash}
    >
      {label === 'hash' ? shortHex(hash) : label}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

export function TxSuccess({ hash, title, children }: { hash: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm">
      <div className="flex items-center gap-2 font-semibold text-emerald-800">
        <CheckCircle2 className="h-4 w-4" />
        {title}
      </div>
      {children && <div className="mt-2 space-y-1 text-xs text-emerald-900">{children}</div>}
      <div className="mt-3 flex items-center justify-between rounded-md bg-white px-3 py-2 text-xs">
        <span className="text-slate-500">Stellar Testnet</span>
        <TxLink hash={hash} label="Ver en Stellar Expert" />
      </div>
    </div>
  );
}
