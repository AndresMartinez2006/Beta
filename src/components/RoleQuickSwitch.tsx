import React from 'react';
import { useApp } from '../context/AppContext';

export const RoleQuickSwitch: React.FC = () => {
  const { activePortal, setActivePortal, liveAdminAlert, inspections, driverName, adminName } = useApp();

  return (
    <div className="bg-primary text-on-primary py-1.5 px-3 border-b border-secondary/30 text-xs shadow-inner sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-badge font-bold text-[10px] tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse-dot"></span>
            COOTRANSVIG
          </span>
          <span className="hidden sm:inline text-surface-container-highest font-medium text-[11px]">
            Plataforma Unificada Conductor & Administrador
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-[11px] text-surface-container-highest hidden lg:inline">
            Vista activa:
          </span>

          <button
            onClick={() => setActivePortal('conductor')}
            className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0 ${
              activePortal === 'conductor'
                ? 'bg-secondary-fixed text-on-secondary-fixed shadow-xs'
                : 'bg-primary-container text-surface-container-high hover:bg-surface-container-low hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">directions_car</span>
            <span className="hidden sm:inline">Conductor ({driverName})</span>
            <span className="sm:hidden">Conductor</span>
          </button>

          <button
            onClick={() => setActivePortal('admin')}
            className={`relative px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0 ${
              activePortal === 'admin'
                ? 'bg-secondary-fixed text-on-secondary-fixed shadow-xs'
                : 'bg-primary-container text-surface-container-high hover:bg-surface-container-low hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">admin_panel_settings</span>
            <span className="hidden sm:inline">Admin ({adminName})</span>
            <span className="sm:hidden">Admin</span>
            {liveAdminAlert && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-error rounded-full ring-2 ring-white animate-ping"></span>
            )}
            {inspections.some((i) => i.isNew) && (
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed-dim"></span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
