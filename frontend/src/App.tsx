import { useState } from 'react';
import {
  LayoutDashboard,
  Car,
  PlusCircle,
  ArrowLeftRight,
  ShieldCheck,
  Wrench,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react';
import AppLayout, { type PageKey, type AppRole } from '@/layouts/AppLayout';
import RoleGate from '@/pages/RoleGate';

// Propietario (aporte de Juan Carlos)
import OwnerDashboard from '@/pages/propietario/OwnerDashboard';
import RegisterVehicle from '@/pages/propietario/RegisterVehicle';
import VehicleHistory from '@/pages/propietario/VehicleHistory';
import TransferHistory from '@/pages/propietario/TransferHistory';
import Permissions from '@/pages/propietario/Permissions';

// Taller (aporte de Alexis)
import WorkshopDashboard from '@/pages/taller/WorkshopDashboard';
import RegisterWorkshop from '@/pages/taller/RegisterWorkshop';
import RegisterService from '@/pages/taller/RegisterService';

// Administrador (aporte de Lily)
import AdminDashboard from '@/pages/administrador/AdminDashboard';
import ValidateWorkshops from '@/pages/administrador/ValidateWorkshops';
import DetectDuplicates from '@/pages/administrador/DetectDuplicates';

import { useWallet } from '@/lib/wallet';
import { findDuplicateServices, useStore } from '@/lib/store';
import { shortAddr } from '@/lib/stellar';

interface NavEntry {
  key: PageKey;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export default function App() {
  const [role, setRole] = useState<AppRole | null>(null);
  const [activePage, setActivePage] = useState<PageKey>('dashboard');
  const wallet = useWallet();
  const db = useStore();

  // Sin wallet (o si se desconecta) se vuelve al acceso; el admin pierde el panel si cambia de cuenta.
  if (!role || !wallet.address || (role === 'administrador' && !wallet.isAdmin && !wallet.loading)) {
    return (
      <RoleGate
        onSelectRole={(r) => {
          setRole(r);
          setActivePage(
            r === 'propietario' ? 'dashboard' : r === 'taller' ? 'workshop-dashboard' : 'admin-dashboard',
          );
        }}
      />
    );
  }

  function switchRole() {
    setRole(null);
  }

  const me = wallet.address;
  const userInitials = me.slice(1, 3);
  const myApplication = db.applications.find((a) => a.wallet === me);

  // --- Propietario ---
  if (role === 'propietario') {
    const navItems: NavEntry[] = [
      { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { key: 'register-vehicle', label: 'Registrar Vehículo', icon: PlusCircle },
      { key: 'vehicle-history', label: 'Mis Vehículos', icon: Car },
      { key: 'transfer-history', label: 'Transferir historial', icon: ArrowLeftRight },
      { key: 'permissions', label: 'Permisos a Talleres', icon: ShieldCheck },
    ];

    const renderPage = () => {
      switch (activePage) {
        case 'register-vehicle':
          return <RegisterVehicle onNavigate={setActivePage} />;
        case 'vehicle-history':
          return <VehicleHistory onNavigate={setActivePage} />;
        case 'transfer-history':
          return <TransferHistory />;
        case 'permissions':
          return <Permissions />;
        default:
          return <OwnerDashboard onNavigate={setActivePage} />;
      }
    };

    return (
      <AppLayout
        navItems={navItems.map((e) => ({ key: e.key, label: e.label, icon: <e.icon className="h-5 w-5" />, badge: e.badge }))}
        activePage={activePage}
        onNavigate={setActivePage}
        roleLabel="Panel del Propietario"
        userName={shortAddr(me)}
        userInitials={userInitials}
        onSwitchRole={switchRole}
      >
        {renderPage()}
      </AppLayout>
    );
  }

  // --- Taller ---
  if (role === 'taller') {
    const navItems: NavEntry[] = [
      { key: 'workshop-dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { key: 'workshop-register', label: wallet.workshopEnabled ? 'Mi taller' : 'Solicitar incorporación', icon: ShieldCheck },
      { key: 'workshop-service', label: 'Registrar servicio', icon: Wrench },
    ];

    const renderPage = () => {
      switch (activePage) {
        case 'workshop-register':
          return <RegisterWorkshop />;
        case 'workshop-service':
          return <RegisterService onNavigate={setActivePage} />;
        default:
          return <WorkshopDashboard onNavigate={setActivePage} />;
      }
    };

    return (
      <AppLayout
        navItems={navItems.map((e) => ({ key: e.key, label: e.label, icon: <e.icon className="h-5 w-5" />, badge: e.badge }))}
        activePage={activePage}
        onNavigate={setActivePage}
        roleLabel="Panel del Taller"
        userName={myApplication?.name ?? shortAddr(me)}
        userInitials={userInitials}
        onSwitchRole={switchRole}
      >
        {renderPage()}
      </AppLayout>
    );
  }

  // --- Administrador ---
  const pendingCount = db.applications.filter((w) => w.status === 'pending').length;
  const duplicateCount = findDuplicateServices(db.services).length;

  const navItems: NavEntry[] = [
    { key: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'admin-workshops', label: 'Validar Talleres', icon: ShieldCheck, badge: pendingCount },
    { key: 'admin-duplicates', label: 'Detectar Duplicados', icon: AlertTriangle, badge: duplicateCount },
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'admin-workshops':
        return <ValidateWorkshops />;
      case 'admin-duplicates':
        return <DetectDuplicates />;
      default:
        return <AdminDashboard onNavigate={setActivePage} />;
    }
  };

  return (
    <AppLayout
      navItems={navItems.map((e) => ({ key: e.key, label: e.label, icon: <e.icon className="h-5 w-5" />, badge: e.badge }))}
      activePage={activePage}
      onNavigate={setActivePage}
      roleLabel="Panel del Administrador"
      userName={shortAddr(me)}
      userInitials={userInitials}
      onSwitchRole={switchRole}
    >
      {renderPage()}
    </AppLayout>
  );
}
