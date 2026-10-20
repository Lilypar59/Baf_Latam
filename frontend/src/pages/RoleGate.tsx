import { Link, Car, Wrench, ShieldCheck, Wallet, Loader2, AlertTriangle, ExternalLink, Coins, LogOut } from 'lucide-react';
import type { AppRole } from '@/layouts/AppLayout';
import { useWallet } from '@/lib/wallet';
import { explorer, shortAddr } from '@/lib/stellar';

interface RoleGateProps {
  onSelectRole: (role: AppRole) => void;
}

// Acceso: 1) conectar la wallet Freighter, 2) elegir rol. Cada rol muestra lo que
// el contrato dice de la cuenta conectada (admin, taller habilitado o no).
export default function RoleGate({ onSelectRole }: RoleGateProps) {
  const w = useWallet();

  const options: {
    role: AppRole;
    label: string;
    icon: typeof Car;
    desc: string;
    status?: { text: string; tone: 'success' | 'warning' | 'neutral' };
    disabled?: boolean;
  }[] = [
    {
      role: 'propietario',
      label: 'Propietario',
      icon: Car,
      desc: 'Registra tus vehículos, consulta su historial y transfiere su titularidad',
    },
    {
      role: 'taller',
      label: 'Taller',
      icon: Wrench,
      desc: w.workshopEnabled ? 'Publica la evidencia de los servicios que realizas' : 'Solicita la incorporación de tu taller',
      status: w.workshopEnabled
        ? { text: 'Habilitado', tone: 'success' }
        : { text: 'Sin habilitar', tone: 'warning' },
    },
    {
      role: 'administrador',
      label: 'Administrador',
      icon: ShieldCheck,
      desc: w.isAdmin ? 'Valida talleres y revisa duplicados' : 'Solo disponible para la cuenta administradora del contrato',
      status: w.isAdmin ? { text: 'Cuenta admin', tone: 'success' } : { text: 'Sin permiso', tone: 'neutral' },
      disabled: !w.isAdmin,
    },
  ];

  const toneClass = { success: 'badge-success', warning: 'badge-warning', neutral: 'badge-neutral' };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-100 px-4 py-10 text-center">
      <div>
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-teal-500 text-white">
          <Link className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">VEHICLECHAIN</h1>
        <p className="mt-1 text-sm text-slate-500">Historial vehicular verificable en Stellar</p>
      </div>

      {/* Paso 1: wallet */}
      <div className="card w-full max-w-sm p-5 text-left">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Paso 1 · Wallet</p>
        {!w.address ? (
          <>
            <p className="mt-2 text-sm text-slate-600">
              Conecta tu wallet <span className="font-semibold">Freighter</span> en <span className="font-semibold">Testnet</span>.
              Tu cuenta firma cada operación en el contrato.
            </p>
            {w.installed === false ? (
              <a href="https://www.freighter.app/" target="_blank" rel="noreferrer" className="btn-primary mt-4 w-full justify-center">
                Instalar Freighter <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <button onClick={w.connect} className="btn-primary mt-4 w-full justify-center">
                <Wallet className="h-4 w-4" /> Conectar Freighter
              </button>
            )}
          </>
        ) : (
          <div className="mt-2 space-y-3">
            <div className="flex items-center justify-between">
              <a href={explorer.account(w.address)} target="_blank" rel="noreferrer" className="font-mono text-sm text-slate-800 hover:underline">
                {shortAddr(w.address)}
              </a>
              <div className="flex items-center gap-2">
                {w.loading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                <button onClick={w.disconnect} className="text-slate-400 hover:text-slate-600" title="Desconectar">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
            {w.wrongNetwork && (
              <p className="flex items-start gap-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Freighter no está en Testnet. Cámbialo en la extensión.
              </p>
            )}
            {w.funded === false && (
              <button onClick={w.fund} disabled={w.loading} className="btn-secondary w-full justify-center text-xs">
                <Coins className="h-4 w-4" /> La cuenta no existe en Testnet · Fondear con Friendbot
              </button>
            )}
            <p className="text-[11px] text-slate-400">Para cambiar de cuenta, cámbiala en Freighter; la app la detecta sola.</p>
          </div>
        )}
        {w.error && <p className="mt-3 text-xs text-red-600">{w.error}</p>}
      </div>

      {/* Paso 2: rol */}
      <div className={`flex w-full max-w-sm flex-col gap-3 ${!w.address || w.wrongNetwork ? 'pointer-events-none opacity-40' : ''}`}>
        <p className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Paso 2 · ¿Cómo quieres entrar?</p>
        {options.map(({ role, label, icon: Icon, desc, status, disabled }) => (
          <button
            key={role}
            disabled={disabled}
            onClick={() => onSelectRole(role)}
            className={`card-hover flex items-center gap-4 px-5 py-4 text-left ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">{label}</p>
                {w.address && status && <span className={`badge ${toneClass[status.tone]}`}>{status.text}</span>}
              </div>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
