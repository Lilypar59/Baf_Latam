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

import { transfers, workshopApplications, findPotentialDuplicates, maintenanceRecords } from '@/data/mockData';

interface NavEntry {
  key: PageKey;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export default function App() {
  const [role, setRole] = useState<AppRole | null>(null);
  const [activePage, setActivePage] = useState<PageKey>('dashboard');

  if (!role) {
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

  // --- Propietario ---
  if (role === 'propietario') {
    const navItems: NavEntry[] = [
      { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { key: 'register-vehicle', label: 'Registrar Vehículo', icon: PlusCircle },
      { key: 'vehicle-history', label: 'Mis Vehículos', icon: Car },
      {
        key: 'transfer-history',
        label: 'Transferencias',
        icon: ArrowLeftRight,
        badge: transfers.filter((t) => t.status === 'pending').length,
      },
      { key: 'permissions', label: 'Permisos a Talleres', icon: ShieldCheck },
    ];

    const renderPage = () => {
      switch (activePage) {
        case 'register-vehicle':
          return <RegisterVehicle />;
        case 'vehicle-history':
          return <VehicleHistory />;
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
        userName="Juan Carlos"
        userInitials="JC"
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
      { key: 'workshop-register', label: 'Registrar Taller', icon: ShieldCheck },
      { key: 'workshop-service', label: 'Registrar Servicio', icon: Wrench },
    ];

    const renderPage = () => {
      switch (activePage) {
        case 'workshop-register':
          return <RegisterWorkshop />;
        case 'workshop-service':
          return <RegisterService />;
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
        userName="Alexis"
        userInitials="AL"
        onSwitchRole={switchRole}
      >
        {renderPage()}
      </AppLayout>
    );
  }

  // --- Administrador ---
  const pendingCount = workshopApplications.filter((w) => w.status === 'pending').length;
  const duplicateCount = findPotentialDuplicates(maintenanceRecords).length;

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
      userName="Lily"
      userInitials="LY"
      onSwitchRole={switchRole}
    >
      {renderPage()}
    </AppLayout>
  );
}
