import { type ReactNode } from 'react';
import { Link, Search, ArrowLeftRight, ExternalLink } from 'lucide-react';
import { explorer } from '@/lib/stellar';

// PageKey reúne las pantallas de los 3 roles en un solo tipo.
// Propietario ya existía; workshop- y admin- son las pantallas nuevas de esta semana.
export type PageKey =
  | 'dashboard'
  | 'register-vehicle'
  | 'vehicle-history'
  | 'transfer-history'
  | 'permissions'
  | 'workshop-dashboard'
  | 'workshop-register'
  | 'workshop-service'
  | 'admin-dashboard'
  | 'admin-workshops'
  | 'admin-duplicates';

export type AppRole = 'propietario' | 'taller' | 'administrador';

interface NavItem {
  key: PageKey;
  label: string;
  icon: ReactNode;
  badge?: number;
}

interface AppLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
  roleLabel: string;
  userName: string;
  userInitials: string;
  onSwitchRole: () => void;
}

export default function AppLayout({
  children,
  navItems,
  activePage,
  onNavigate,
  roleLabel,
  userName,
  userInitials,
  onSwitchRole,
}: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-slate-900 lg:static lg:translate-x-0">
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-800 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500 text-white">
            <Link className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">VehicleChain</p>
            <p className="text-[11px] text-slate-500">{roleLabel}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-600">Menú</p>
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`nav-item ${activePage === item.key ? 'nav-item-active' : ''}`}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-[11px] font-semibold text-teal-300">
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          <div className="pt-3">
            <button onClick={onSwitchRole} className="nav-item">
              <ArrowLeftRight className="h-5 w-5" />
              <span className="flex-1">Cambiar de rol</span>
            </button>
          </div>
        </nav>

        <div className="border-t border-slate-800 p-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/20 text-xs font-bold text-teal-300">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{userName}</p>
              <p className="truncate text-xs text-slate-500">{roleLabel}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col lg:pl-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/80 px-6 backdrop-blur-sm">
          <div className="relative hidden flex-1 max-w-md sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Buscar vehículo, placa, transferencia..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/10"
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <a
              href={explorer.contract()}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 sm:flex"
              title="Contrato VehicleChain en Stellar Expert"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Stellar Testnet
              <ExternalLink className="h-3 w-3" />
            </a>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                {userInitials}
              </div>
              <span className="hidden text-sm font-medium text-slate-700 sm:block">{userName}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
