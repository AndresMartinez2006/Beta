import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { RoleQuickSwitch } from './components/RoleQuickSwitch';
import { ConductorLogin } from './components/ConductorLogin';
import { ConductorDashboard } from './components/ConductorDashboard';
import { PreoperacionalForm } from './components/PreoperacionalForm';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';

const MainAppContent: React.FC = () => {
  const {
    activePortal,
    isConductorLoggedIn,
    isAdminLoggedIn,
    conductorTab,
    setConductorTab,
  } = useApp();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Role Switcher allowing seamless testing of Conductor & Admin in the same app */}
      <RoleQuickSwitch />

      <div className="flex-1">
        {activePortal === 'conductor' ? (
          !isConductorLoggedIn ? (
            <ConductorLogin />
          ) : conductorTab === 'vehiculo' ? (
            <PreoperacionalForm onBack={() => setConductorTab('turnos')} />
          ) : (
            <ConductorDashboard onOpenPreoperacional={() => setConductorTab('vehiculo')} />
          )
        ) : (
          !isAdminLoggedIn ? (
            <AdminLogin />
          ) : (
            <AdminDashboard />
          )
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
