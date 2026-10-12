import { Link, Car, Wrench, ShieldCheck } from 'lucide-react';
import type { AppRole } from '@/layouts/AppLayout';

interface RoleGateProps {
  onSelectRole: (role: AppRole) => void;
}

// Pantalla de acceso / selección de rol.
// No hay autenticación real esta semana: el "login" es elegir un rol.
export default function RoleGate({ onSelectRole }: RoleGateProps) {
  const options: { role: AppRole; label: string; icon: typeof Car; desc: string }[] = [
    { role: 'propietario', label: 'Propietario', icon: Car, desc: 'Registra y consulta tus vehículos' },
    { role: 'taller', label: 'Taller', icon: Wrench, desc: 'Registra servicios de mantenimiento' },
    { role: 'administrador', label: 'Administrador', icon: ShieldCheck, desc: 'Valida talleres y revisa duplicados' },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-slate-100 px-4 text-center">
      <div>
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-teal-500 text-white">
          <Link className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">VEHICLECHAIN</h1>
        <p className="mt-1 text-sm text-slate-500">Historial vehicular verificable</p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        {options.map(({ role, label, icon: Icon, desc }) => (
          <button
            key={role}
            onClick={() => onSelectRole(role)}
            className="card-hover flex items-center gap-4 px-5 py-4 text-left"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{label}</p>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
