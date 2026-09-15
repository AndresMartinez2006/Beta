import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { InspectionRecord } from '../types';
import { AdminVehicleManager } from './AdminVehicleManager';
import { AdminDriverManager } from './AdminDriverManager';
import { INSPECTION_QUESTIONS, MODULE_GROUPS } from '../data/inspectionQuestions';

export const AdminDashboard: React.FC = () => {
  const {
    adminTab,
    setAdminTab,
    adminBase,
    setAdminBase,
    adminName,
    vehicles,
    drivers,
    inspections,
    stats,
    authorizeDispatch,
    resolveInspectionFailure,
    addManualInspection,
    clearAllInspections,
    liveAdminAlert,
    clearLiveAlert,
    unreadAdminAlerts,
    resetUnreadAlerts,
    logoutAdmin,
    setActivePortal,
    setConductorTab,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'todos' | 'criticas' | 'aptos' | 'en_proceso'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInspection, setSelectedInspection] = useState<InspectionRecord | null>(null);

  // Active Modals
  const [callingDriver, setCallingDriver] = useState<InspectionRecord | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [viewingFalla, setViewingFalla] = useState<InspectionRecord | null>(null);
  const [viewingPoliza, setViewingPoliza] = useState<InspectionRecord | null>(null);
  const [viewingFuec, setViewingFuec] = useState<InspectionRecord | null>(null);
  const [showNewInspectionModal, setShowNewInspectionModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [adminDetailModule, setAdminDetailModule] = useState<number>(0);

  // New Inspection Form state (Default to test driver Andrés Martínez)
  const [newUnit, setNewUnit] = useState(vehicles[0]?.unitNumber || 'VAN #204');
  const [newPlate, setNewPlate] = useState(vehicles[0]?.plate || 'TRL-842');
  const [newDriver, setNewDriver] = useState(drivers[0]?.fullName || 'Andrés Martínez');
  const [newModel, setNewModel] = useState(vehicles[0]?.model || 'Renault Logan');
  const [newStatus, setNewStatus] = useState<'apto' | 'bloqueado' | 'en_progreso'>('apto');
  const [newFailureReason, setNewFailureReason] = useState('');

  // Live timer for call simulation
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callingDriver) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callingDriver]);

  // Current system clock
  const currentTime = useMemo(() => {
    return new Date().toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }, []);

  // Filtered inspections
  const filteredInspections = useMemo(() => {
    return inspections.filter((item) => {
      // Tab filter
      if (activeFilter === 'criticas' && item.status !== 'bloqueado') return false;
      if (activeFilter === 'aptos' && item.status !== 'apto') return false;
      if (activeFilter === 'en_proceso' && item.status !== 'en_progreso') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesPlate = item.plate.toLowerCase().includes(q);
        const matchesUnit = item.unitNumber.toLowerCase().includes(q);
        const matchesDriver = item.driverName.toLowerCase().includes(q);
        const matchesModel = item.vehicleModel.toLowerCase().includes(q);
        return matchesPlate || matchesUnit || matchesDriver || matchesModel;
      }

      return true;
    });
  }, [inspections, activeFilter, searchQuery]);

  const handleCreateManualInspection = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const timeLabel = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newRecord: InspectionRecord = {
      id: `INS-${Date.now().toString().slice(-4)}`,
      unitNumber: newUnit,
      plate: newPlate,
      vehicleModel: newModel,
      driverName: newDriver,
      driverId: `#${Math.floor(1000 + Math.random() * 9000)}`,
      driverPhone: '+57 310 987 6543',
      timestamp: now.toISOString(),
      timeLabel,
      status: newStatus,
      odometerKm: 55000,
      odometerPhoto: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=400&q=80',
      checklistCount: newStatus === 'apto' ? '36/36' : '32/36',
      checklistProgress: newStatus === 'apto' ? 100 : 88,
      checklist: (() => {
        const cl: Record<string, boolean> = {};
        INSPECTION_QUESTIONS.forEach((q) => {
          cl[q.id] = newStatus === 'apto' ? true : !q.critical;
        });
        return cl;
      })(),
      turnLabel: `Turno ${timeLabel}`,
      failureReason: newStatus === 'bloqueado' ? newFailureReason || 'Inspección técnica rechazada por supervisor' : undefined,
      dispatchAuthorized: newStatus === 'apto',
      dispatchTime: newStatus === 'apto' ? timeLabel : undefined,
      fuecNumber: newStatus === 'apto' ? `FUEC-4409-COOTRANSVIG-2025-${Date.now().toString().slice(-5)}` : undefined,
      isNew: true,
    };

    addManualInspection(newRecord);
    setShowNewInspectionModal(false);
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-body-md antialiased pb-20 md:pb-8 selection:bg-secondary selection:text-on-secondary">
      {/* TOP APP BAR */}
      <header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant shadow-sm w-full">
        <div className="flex justify-between items-center w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto h-16">
          {/* Brand & Section Anchor */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm">
              <span className="material-symbols-outlined text-2xl">directions_bus</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm text-primary font-bold tracking-tight">
                  Cootransvig Control
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-label-badge font-bold tracking-wider uppercase bg-error-container text-on-error-container animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                  En Vivo
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                <span>
                  {adminBase === 'villanueva'
                    ? 'Villanueva (Guajira)'
                    : adminBase === 'valledupar'
                    ? 'Valledupar (Cesar)'
                    : 'San Juan (Guajira)'}
                </span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
                <span>Valledupar (Cesar)</span>
              </p>
            </div>
          </div>

          {/* Desktop Navigation Cluster */}
          <nav className="hidden lg:flex items-center gap-6">
            <button
              onClick={() => {
                setAdminTab('control');
                setActiveFilter('todos');
              }}
              className={`pb-1 font-label-data text-label-data flex items-center gap-1.5 cursor-pointer ${
                adminTab === 'control' || adminTab === 'inspecciones'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-primary transition-colors'
              }`}
            >
              <span className="material-symbols-outlined text-lg">fact_check</span>
              <span>Inspecciones & Control</span>
            </button>
            <button
              onClick={() => setAdminTab('vehiculos')}
              className={`pb-1 font-label-data text-label-data flex items-center gap-1.5 cursor-pointer ${
                adminTab === 'vehiculos'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-primary transition-colors'
              }`}
            >
              <span className="material-symbols-outlined text-lg">directions_car</span>
              <span>Flota y Vehículos</span>
              <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-xs font-bold">
                {vehicles.length}
              </span>
            </button>
            <button
              onClick={() => setAdminTab('conductores')}
              className={`pb-1 font-label-data text-label-data flex items-center gap-1.5 cursor-pointer ${
                adminTab === 'conductores'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-primary transition-colors'
              }`}
            >
              <span className="material-symbols-outlined text-lg">badge</span>
              <span>Conductores</span>
              <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-xs font-bold">
                {drivers.length}
              </span>
            </button>
          </nav>

          {/* Trailing Action: Terminal Base Selector & Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Terminal Base Selector */}
            <div className="relative hidden sm:block">
              <select
                value={adminBase}
                onChange={(e) => setAdminBase(e.target.value as 'villanueva' | 'valledupar' | 'sanjuan')}
                className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant text-primary font-label-data text-xs outline-none cursor-pointer"
              >
                <option value="villanueva">Base Villanueva</option>
                <option value="valledupar">Base Valledupar</option>
                <option value="sanjuan">Base San Juan</option>
              </select>
            </div>

            {/* Notification Bell with Counter */}
            <button
              onClick={() => {
                setShowNotificationsModal(true);
                resetUnreadAlerts();
              }}
              aria-label="Notificaciones"
              className="relative p-2 text-primary hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadAdminAlerts > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-error text-white font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-surface-container-lowest animate-pulse">
                  {unreadAdminAlerts}
                </span>
              )}
            </button>

            {/* Admin Avatar Pill (Julio Pérez) */}
            <div className="flex items-center gap-2 pl-2 border-l border-outline-variant">
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center font-label-badge text-xs shadow-xs">
                JP
              </div>
              <div className="hidden xl:block text-left">
                <div className="font-label-badge text-label-badge text-on-surface leading-tight font-bold">
                  {adminName || 'Julio Pérez'}
                </div>
                <div className="text-[10px] text-on-surface-variant font-body-sm">Director de Operaciones</div>
              </div>
              <button
                onClick={logoutAdmin}
                title="Cerrar sesión Admin"
                className="text-on-surface-variant hover:text-error p-1 rounded transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CANVAS */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* LIVE ALERT FLOATING BANNER (When conductor submits preoperacional) */}
        {liveAdminAlert && (
          <div className="bg-primary text-on-primary p-4 rounded-xl shadow-xl border-2 border-secondary flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl animate-bounce">assignment_turned_in</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-headline-sm text-sm font-bold text-secondary-fixed">
                    {liveAdminAlert.title}
                  </span>
                  <span className="font-label-time text-xs bg-black/20 px-2 py-0.5 rounded">
                    {liveAdminAlert.timestamp}
                  </span>
                </div>
                <p className="font-body-sm text-xs text-surface-container-high mt-0.5">
                  {liveAdminAlert.message}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={() => {
                  const rec = inspections.find((i) => i.id === liveAdminAlert.recordId);
                  if (rec) setSelectedInspection(rec);
                  clearLiveAlert();
                }}
                className="px-3 py-1.5 rounded-lg bg-secondary-fixed text-on-secondary-fixed font-bold text-xs shadow-sm hover:bg-secondary-fixed-dim transition-all cursor-pointer"
              >
                Examinar Planilla
              </button>
              <button
                onClick={clearLiveAlert}
                className="p-1 text-surface-container-high hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>
        )}

        {/* SUBHEADER / STATUS SUMMARY BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest p-4 sm:p-5 rounded-xl border border-outline-variant shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary-container text-secondary-container rounded-lg">
              <span className="material-symbols-outlined text-2xl">
                {adminTab === 'vehiculos'
                  ? 'directions_car'
                  : adminTab === 'conductores'
                  ? 'badge'
                  : 'verified_user'}
              </span>
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md text-primary font-bold">
                {adminTab === 'vehiculos'
                  ? 'Gestión y Registro de Flota Vehicular'
                  : adminTab === 'conductores'
                  ? 'Gestión y Registro de Conductores'
                  : 'Control Preoperacional y Despacho'}
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {adminTab === 'vehiculos'
                  ? 'Registra nuevos móviles, vigencias SOAT, tecnomecánica y asignación de ruta.'
                  : adminTab === 'conductores'
                  ? 'Vincula conductores, valida categorías de licencia RUNT y asignación a vehículos.'
                  : 'Supervisión en tiempo real de inspecciones vehiculares y aptitud técnica de la flota intermunicipal.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap self-start md:self-auto">
            <span className="font-label-time text-label-time text-primary bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-base">schedule</span>
              <span>{currentTime}</span>
            </span>

            {/* Wipe / Reiniciar a Cero Button */}
            {(adminTab === 'control' || adminTab === 'inspecciones') && (
              <button
                onClick={() => {
                  if (confirm('¿Deseas reiniciar la información de inspecciones a cero? Podrás volver a agregar datos desde cero.')) {
                    clearAllInspections();
                  }
                }}
                title="Limpiar todas las inspecciones para empezar de cero"
                className="bg-surface-container hover:bg-error-container/40 text-on-surface hover:text-error border border-outline-variant px-3 py-2 rounded-lg font-label-data text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                <span className="hidden sm:inline">Iniciar de Cero</span>
              </button>
            )}

            {(adminTab === 'control' || adminTab === 'inspecciones') && (
              <button
                onClick={() => setShowNewInspectionModal(true)}
                className="bg-primary hover:bg-secondary active:scale-[0.98] text-on-primary px-4 py-2 rounded-lg font-label-data text-label-data flex items-center gap-2 shadow-sm transition-all duration-150 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">add_circle</span>
                <span className="hidden sm:inline">Nueva Inspección</span>
              </button>
            )}
          </div>
        </div>

        {/* CONDITIONAL CONTENT BASED ON ACTIVE ADMIN TAB */}
        {adminTab === 'vehiculos' && <AdminVehicleManager />}
        {adminTab === 'conductores' && <AdminDriverManager />}

        {(adminTab === 'control' || adminTab === 'inspecciones') && (
          <>
            {/* 2. TARJETAS KPIS RÁPIDAS (Bento Grid) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Flota */}
          <div
            onClick={() => setActiveFilter('todos')}
            className={`bg-surface-container-lowest p-4 rounded-xl border shadow-sm flex flex-col justify-between hover:border-primary transition-all cursor-pointer ${
              activeFilter === 'todos' ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider">
                Total Flota
              </span>
              <span className="p-2 rounded-lg bg-surface-container text-primary">
                <span className="material-symbols-outlined text-xl">commute</span>
              </span>
            </div>
            <div className="mt-3">
              <div className="font-display-hero-mobile text-display-hero-mobile font-bold text-primary tracking-tight">
                {stats.totalFleet}
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Vehículos registrados</p>
            </div>
            <div className="mt-3 pt-2 border-t border-outline-variant/40 flex items-center justify-between text-xs">
              <span className="text-on-surface-variant font-label-badge">Operación Villanueva</span>
              <span className="text-secondary font-semibold">100% activa</span>
            </div>
          </div>

          {/* Aptos / Autorizados (VERDE DESTACADO) */}
          <div
            onClick={() => setActiveFilter('aptos')}
            className={`bg-surface-container-lowest p-4 rounded-xl border-2 shadow-sm flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-surface-container-low/40 to-surface-container-lowest cursor-pointer transition-all ${
              activeFilter === 'aptos' ? 'border-secondary ring-2 ring-secondary/20' : 'border-secondary/40'
            }`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary-container/20 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-center justify-between relative z-10">
              <span className="font-label-badge text-label-badge text-secondary uppercase tracking-wider font-bold">
                Aptos / Autorizados
              </span>
              <span className="p-2 rounded-lg bg-secondary-container text-on-secondary-container">
                <span className="material-symbols-outlined text-xl">check_circle</span>
              </span>
            </div>
            <div className="mt-3 relative z-10">
              <div className="flex items-baseline gap-2">
                <span className="font-display-hero-mobile text-display-hero-mobile font-bold text-secondary tracking-tight">
                  {stats.authorizedApt}
                </span>
                <span className="font-label-badge text-label-badge text-secondary font-bold bg-secondary-container/60 px-2 py-0.5 rounded-full">
                  82% Flota
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Despacho autorizado</p>
            </div>
            <div className="mt-3 pt-2 border-t border-outline-variant/40 flex items-center justify-between text-xs relative z-10">
              <span className="text-on-surface-variant font-label-badge">Listos para terminal</span>
              <span className="text-secondary font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">done_all</span> En rampa
              </span>
            </div>
          </div>

          {/* Rechazados / Falla (ROJO FUERTE IMPACTO VISUAL) */}
          <div
            onClick={() => setActiveFilter('criticas')}
            className={`bg-red-50 p-4 rounded-xl border-2 shadow-md flex flex-col justify-between relative overflow-hidden ring-1 ring-red-400/50 cursor-pointer transition-all ${
              activeFilter === 'criticas' ? 'border-red-700 ring-2 ring-red-500' : 'border-red-500'
            }`}
          >
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                <span className="font-label-badge text-label-badge text-red-800 uppercase tracking-wider font-extrabold">
                  Rechazados / Falla
                </span>
              </div>
              <span className="p-2 rounded-lg bg-red-100 text-red-700 border border-red-200">
                <span className="material-symbols-outlined text-xl">fmd_bad</span>
              </span>
            </div>
            <div className="mt-3 relative z-10">
              <div className="flex items-baseline gap-2">
                <span className="font-display-hero-mobile text-display-hero-mobile font-bold text-red-700 tracking-tight">
                  {stats.rejectedBlocked}
                </span>
                <span className="font-label-badge text-label-badge text-white font-bold bg-red-600 px-2 py-0.5 rounded-full tracking-wide uppercase">
                  Bloqueados
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-red-900 font-medium mt-0.5">Requieren subsanación inmediata</p>
            </div>
            <div className="mt-3 pt-2 border-t border-red-200 flex items-center justify-between text-xs relative z-10">
              <span className="text-red-800 font-label-badge font-bold">
                {stats.technicalFailures} Técnico / {stats.docFailures} Docs
              </span>
              <span className="text-red-700 font-extrabold uppercase flex items-center gap-0.5">
                <span className="material-symbols-outlined text-sm">block</span> No despachar
              </span>
            </div>
          </div>

          {/* Pendientes de Chequeo */}
          <div
            onClick={() => setActiveFilter('en_proceso')}
            className={`bg-surface-container-lowest p-4 rounded-xl border shadow-sm flex flex-col justify-between cursor-pointer transition-all ${
              activeFilter === 'en_proceso' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-outline-variant'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider">
                En Inspección
              </span>
              <span className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                <span className="material-symbols-outlined text-xl">pending_actions</span>
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="font-display-hero-mobile text-display-hero-mobile font-bold text-on-surface tracking-tight">
                  {stats.inProgress}
                </span>
                <span className="font-label-badge text-label-badge text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                  En espera
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Diligenciando app conductor</p>
            </div>
            <div className="mt-3 pt-2 border-t border-outline-variant/40 flex items-center justify-between text-xs">
              <span className="text-on-surface-variant font-label-badge">Bahía de alistamiento</span>
              <span className="text-amber-700 font-semibold">T. Prom: {stats.avgTimeMin} min</span>
            </div>
          </div>
        </div>

        {/* 3. BARRA DE BÚSQUEDA Y FILTROS RÁPIDOS */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          {/* Header with search & segmented tabs */}
          <div className="p-3 sm:p-4 border-b border-outline-variant bg-surface-container-low/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setActiveFilter('todos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-label-data flex items-center gap-1.5 whitespace-nowrap active:scale-95 transition-transform cursor-pointer ${
                  activeFilter === 'todos'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span>Todos</span>
                <span className="bg-primary-container text-on-primary-container px-1.5 py-0.2 rounded text-[11px]">
                  {stats.totalFleet}
                </span>
              </button>

              <button
                onClick={() => setActiveFilter('criticas')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-label-data border flex items-center gap-1.5 whitespace-nowrap active:scale-95 transition-transform cursor-pointer ${
                  activeFilter === 'criticas'
                    ? 'bg-red-600 text-white border-red-700 shadow-sm'
                    : 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                <span>Críticas</span>
                <span className="bg-red-700 text-white px-1.5 py-0.2 rounded text-[11px]">
                  {stats.rejectedBlocked}
                </span>
              </button>

              <button
                onClick={() => setActiveFilter('aptos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-label-data border flex items-center gap-1.5 whitespace-nowrap active:scale-95 transition-transform cursor-pointer ${
                  activeFilter === 'aptos'
                    ? 'bg-secondary text-white border-secondary shadow-sm'
                    : 'bg-surface-container text-secondary border-secondary/30 hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>Aptos</span>
                <span className="bg-secondary-container text-on-secondary-container px-1.5 py-0.2 rounded text-[11px]">
                  {stats.authorizedApt}
                </span>
              </button>

              <button
                onClick={() => setActiveFilter('en_proceso')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-label-data border flex items-center gap-1.5 whitespace-nowrap active:scale-95 transition-transform cursor-pointer ${
                  activeFilter === 'en_proceso'
                    ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                    : 'bg-surface text-amber-800 border-amber-300 hover:bg-amber-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                <span>En Proceso</span>
                <span className="bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded text-[11px]">
                  {stats.inProgress}
                </span>
              </button>
            </div>

            <div className="relative w-full md:w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
                search
              </span>
              <input
                className="w-full pl-9 pr-3 py-1.5 bg-surface text-on-surface rounded-lg border border-outline-variant font-body-sm text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                placeholder="Buscar placa, unidad, conductor..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Compact Uniform Cards List matching Image 7 */}
          <div className="divide-y divide-outline-variant/40">
            {filteredInspections.length === 0 ? (
              inspections.length === 0 ? (
                <div className="p-8 sm:p-12 text-center bg-surface-container-lowest flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-secondary-container text-secondary flex items-center justify-center mb-4 shadow-inner">
                    <span className="material-symbols-outlined text-3xl">fact_check</span>
                  </div>
                  <h3 className="font-headline-sm text-base sm:text-lg font-bold text-on-surface">
                    0 Inspecciones Registradas (Listo para agregar datos)
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mt-1.5 leading-relaxed">
                    La base de datos se encuentra en cero como solicitaste. Diligencia la planilla preoperacional en el portal del conductor para verificar cómo llega inmediatamente a este portal de administración.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setActivePortal('conductor');
                        setConductorTab('vehiculo');
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-headline-sm text-xs font-bold hover:bg-primary-container shadow-sm active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">person</span>
                      <span>Diligenciar como Andrés Martínez (Portal Conductor)</span>
                    </button>

                    <button
                      onClick={() => setShowNewInspectionModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-white font-headline-sm text-xs font-bold hover:bg-secondary/90 shadow-sm active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">add_circle</span>
                      <span>Registrar Inspección Manual</span>
                    </button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-outline-variant/40 flex items-center gap-4 text-xs text-on-surface-variant">
                    <button
                      onClick={() => setAdminTab('vehiculos')}
                      className="hover:text-primary font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">directions_car</span>
                      <span>Ver Flota ({vehicles.length})</span>
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => setAdminTab('conductores')}
                      className="hover:text-primary font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">badge</span>
                      <span>Ver Conductores ({drivers.length})</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-on-surface-variant text-xs">
                  <p>No se encontraron inspecciones con los filtros seleccionados.</p>
                  <button
                    onClick={() => {
                      setActiveFilter('todos');
                      setSearchQuery('');
                    }}
                    className="mt-2 text-primary font-bold hover:underline"
                  >
                    Restablecer filtros de búsqueda
                  </button>
                </div>
              )
            ) : (
              filteredInspections.map((item) => {
                const isBlocked = item.status === 'bloqueado';
                const isApto = item.status === 'apto';
                const isInProgress = item.status === 'en_progreso';

                return (
                  <div
                    key={item.id}
                    className={`p-3 sm:p-3.5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4 ${
                      isBlocked
                        ? 'bg-red-50/50 hover:bg-red-50 border-red-600'
                        : isApto
                        ? 'bg-surface-container-lowest hover:bg-surface-bright border-secondary'
                        : 'bg-amber-50/40 hover:bg-amber-50/70 border-amber-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-1 rounded font-label-data text-xs font-bold whitespace-nowrap shadow-sm ${
                            isBlocked
                              ? 'bg-red-600 text-white'
                              : isApto
                              ? 'bg-primary-container text-on-primary'
                              : 'bg-surface-container-high text-primary'
                          }`}
                        >
                          {item.unitNumber}
                        </span>
                        <span
                          className={`px-2 py-1 rounded font-label-data text-xs font-bold tracking-wide border ${
                            isBlocked
                              ? 'bg-white text-on-surface border-red-300'
                              : isApto
                              ? 'bg-surface-container-high text-primary border-outline-variant'
                              : 'bg-surface text-on-surface border-outline-variant'
                          }`}
                        >
                          {item.plate}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-headline-sm text-xs font-bold ${
                              isBlocked ? 'text-red-950' : isApto ? 'text-primary' : 'text-on-surface'
                            }`}
                          >
                            {item.vehicleModel}
                          </span>
                          <span className="text-[11px] text-on-surface-variant">
                            • Conductor: <strong className="text-on-surface">{item.driverName}</strong>
                          </span>

                          {isBlocked && (
                            <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-label-badge text-[10px] font-bold uppercase tracking-wider">
                              Bloqueado
                            </span>
                          )}
                          {isApto && (
                            <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-badge text-[10px] font-bold uppercase tracking-wider flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-xs">check_circle</span> Apto Rampa
                            </span>
                          )}
                          {isInProgress && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-label-badge text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping"></span>
                              En Bahía ({item.checklistProgress}%)
                            </span>
                          )}

                          {item.isNew && (
                            <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-badge text-[10px] font-extrabold uppercase animate-pulse">
                              En Vivo
                            </span>
                          )}
                        </div>

                        {/* Details line */}
                        {isBlocked ? (
                          <div className="flex items-center gap-1.5 text-xs text-red-800 mt-0.5 font-medium">
                            <span className="material-symbols-outlined text-sm text-red-600">
                              {item.documentIssues ? 'assignment_late' : 'fmd_bad'}
                            </span>
                            <span className="truncate">
                              {item.failureReason || 'Falla reportada en chequeo'} ({item.timeLabel})
                            </span>
                          </div>
                        ) : isApto ? (
                          <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-0.5">
                            <span>Checklist {item.checklistCount}</span>
                            <span>•</span>
                            <span>Odóm: {item.odometerKm.toLocaleString()} km</span>
                            <span>•</span>
                            <span className="text-secondary font-semibold">{item.turnLabel}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-amber-900 mt-0.5">
                            <span>Checklist en curso: {item.checklistCount}</span>
                            <span>•</span>
                            <span>{item.turnLabel}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {isBlocked && (
                        <>
                          <button
                            onClick={() => setCallingDriver(item)}
                            className="p-2 bg-white hover:bg-red-100 text-red-700 border border-red-300 rounded-lg active:scale-95 transition-all cursor-pointer"
                            title="Llamar Conductor"
                          >
                            <span className="material-symbols-outlined text-base">call</span>
                          </button>
                          {item.documentIssues ? (
                            <button
                              onClick={() => setViewingPoliza(item)}
                              className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-label-data text-xs font-bold rounded-lg shadow-sm flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-sm">description</span>
                              <span>Ver Póliza</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setViewingFalla(item)}
                              className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-label-data text-xs font-bold rounded-lg shadow-sm flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-sm">visibility</span>
                              <span>Ver Falla</span>
                            </button>
                          )}
                        </>
                      )}

                      {isApto && (
                        <>
                          <button
                            onClick={() => setSelectedInspection(item)}
                            className="p-2 bg-surface-container-low hover:bg-surface-container text-secondary border border-outline-variant rounded-lg active:scale-95 transition-all cursor-pointer"
                            title="Descargar Certificado"
                          >
                            <span className="material-symbols-outlined text-base">download</span>
                          </button>
                          <button
                            onClick={() => {
                              authorizeDispatch(item.id);
                              setViewingFuec(item);
                            }}
                            className="px-3 py-1.5 bg-primary hover:bg-secondary text-on-primary font-label-data text-xs font-bold rounded-lg shadow-sm flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">print</span>
                            <span>Despachar</span>
                          </button>
                        </>
                      )}

                      {isInProgress && (
                        <>
                          <button
                            onClick={() => setCallingDriver(item)}
                            className="p-2 bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg active:scale-95 transition-all cursor-pointer"
                            title="Llamar Conductor"
                          >
                            <span className="material-symbols-outlined text-base">call</span>
                          </button>
                          <button
                            onClick={() => setSelectedInspection(item)}
                            className="px-3 py-1.5 bg-surface-container text-primary hover:bg-surface-container-high border border-outline-variant font-label-data text-xs font-bold rounded-lg flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">monitor_heart</span>
                            <span>Monitorear</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Compact Footer with Counter & Pagination */}
          <div className="p-3 bg-surface-container-lowest border-t border-outline-variant flex items-center justify-between text-xs text-on-surface-variant">
            <span className="font-label-badge">
              Mostrando {filteredInspections.length} de {stats.totalFleet} vehículos monitoreados
            </span>
            <div className="flex items-center gap-1 font-label-data font-bold">
              <button className="px-2 py-1 rounded bg-surface-container text-primary hover:bg-surface-container-high">
                Anterior
              </button>
              <button className="px-2 py-1 rounded bg-primary text-on-primary">1</button>
              <button className="px-2 py-1 rounded hover:bg-surface-container text-on-surface">2</button>
              <button className="px-2 py-1 rounded bg-surface-container text-primary hover:bg-surface-container-high">
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </>
    )}
  </main>

      {/* MODAL: LLAMAR CONDUCTOR (Intercom / Satelital Radio) */}
      {callingDriver && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-sm w-full border border-outline-variant shadow-2xl text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-secondary-container text-secondary flex items-center justify-center mx-auto mb-3 shadow-inner">
              <span className="material-symbols-outlined text-3xl animate-pulse">cell_tower</span>
            </div>

            <span className="font-label-badge text-xs px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold uppercase">
              Enlace Satelital Activo
            </span>

            <h3 className="font-headline-sm text-base font-bold text-on-surface mt-2">
              {callingDriver.driverName}
            </h3>
            <p className="font-body-sm text-xs text-on-surface-variant">
              {callingDriver.vehicleModel} • {callingDriver.unitNumber} ({callingDriver.plate})
            </p>
            <p className="font-label-data text-xs text-secondary font-bold mt-1">
              Tel: {callingDriver.driverPhone}
            </p>

            <div className="my-4 py-2 px-4 rounded-xl bg-surface-container-low flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
              <span className="font-label-time text-sm font-bold text-primary">
                {Math.floor(callDuration / 60)
                  .toString()
                  .padStart(2, '0')}
                :{(callDuration % 60).toString().padStart(2, '0')}
              </span>
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-full border cursor-pointer ${
                  isMuted ? 'bg-error text-white border-error' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
                title="Silenciar micrófono"
              >
                <span className="material-symbols-outlined text-xl">
                  {isMuted ? 'mic_off' : 'mic'}
                </span>
              </button>

              <button
                onClick={() => setCallingDriver(null)}
                className="p-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg active:scale-95 transition-all cursor-pointer"
                title="Colgar llamada"
              >
                <span className="material-symbols-outlined text-2xl">call_end</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VER FALLA MECÁNICA */}
      {viewingFalla && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-md w-full border border-red-300 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
              <div className="flex items-center gap-2 text-red-700">
                <span className="material-symbols-outlined text-2xl">fmd_bad</span>
                <h3 className="font-headline-sm text-sm font-bold">Reporte de Falla Mecánica Crítica</h3>
              </div>
              <button
                onClick={() => setViewingFalla(null)}
                className="p-1 text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                <span className="text-red-800 font-bold block mb-1">Diagnóstico del Conductor:</span>
                <p className="text-red-950 font-medium">{viewingFalla.failureReason}</p>
                <span className="text-[11px] text-red-700 mt-1 block">
                  Registrado a las {viewingFalla.timeLabel} • Bloqueo automático PESV
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-surface-container-low rounded-lg">
                  <span className="text-on-surface-variant block">Vehículo Afectado</span>
                  <strong className="text-on-surface">
                    {viewingFalla.unitNumber} ({viewingFalla.plate})
                  </strong>
                </div>
                <div className="p-2.5 bg-surface-container-low rounded-lg">
                  <span className="text-on-surface-variant block">Conductor Responsable</span>
                  <strong className="text-on-surface">{viewingFalla.driverName}</strong>
                </div>
              </div>

              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/60">
                <span className="font-bold text-on-surface block mb-1">Acción del Despachador:</span>
                <p className="text-on-surface-variant">
                  El vehículo no puede recibir pasajeros ni salir de la terminal hasta que el taller aliado de
                  Cootransvig en Villanueva certifique la reparación.
                </p>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  resolveInspectionFailure(viewingFalla.id);
                  setViewingFalla(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-secondary text-white font-bold text-xs hover:bg-secondary/90 transition-all cursor-pointer"
              >
                Levantar Bloqueo (Subsanado)
              </button>
              <button
                onClick={() => setViewingFalla(null)}
                className="px-4 py-2.5 rounded-xl border border-outline-variant text-on-surface font-bold text-xs hover:bg-surface-container transition-all cursor-pointer"
              >
                Mantener Bloqueo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VER PÓLIZA / DOCS */}
      {viewingPoliza && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-md w-full border border-red-300 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
              <div className="flex items-center gap-2 text-red-700">
                <span className="material-symbols-outlined text-2xl">assignment_late</span>
                <h3 className="font-headline-sm text-sm font-bold">Inconsistencia Documental en RUNT</h3>
              </div>
              <button
                onClick={() => setViewingPoliza(null)}
                className="p-1 text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                <span className="text-red-800 font-bold block mb-1">Detalle del Requerimiento:</span>
                <p className="text-red-950 font-medium">{viewingPoliza.failureReason}</p>
                <p className="text-[11px] text-red-800 mt-1">{viewingPoliza.documentIssues}</p>
              </div>

              <div className="p-3 bg-surface-container-low rounded-lg space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Aseguradora:</span>
                  <span className="font-bold text-on-surface">Seguros del Estado S.A.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Póliza Extracontractual:</span>
                  <span className="font-bold text-secondary">Vigente (RCC/RCE)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">SOAT Obligatorio:</span>
                  <span className="font-bold text-error">Vencido hoy 00:00</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  resolveInspectionFailure(viewingPoliza.id);
                  setViewingPoliza(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container transition-all cursor-pointer"
              >
                Validar Nueva Póliza en RUNT
              </button>
              <button
                onClick={() => setViewingPoliza(null)}
                className="px-4 py-2.5 rounded-xl border border-outline-variant text-on-surface font-bold text-xs hover:bg-surface-container transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FUEC & CERTIFICADO DE DESPACHO (Imprimible) */}
      {viewingFuec && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-lg w-full border border-secondary/30 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-2xl text-secondary">verified</span>
                <div>
                  <h3 className="font-headline-sm text-sm font-bold leading-tight">
                    Planilla Única de Despacho (FUEC)
                  </h3>
                  <span className="text-[11px] text-on-surface-variant">
                    COOTRANSVIG S.A.S. • Ministerio de Transporte
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingFuec(null)}
                className="p-1 text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="mt-4 p-4 rounded-xl border border-outline-variant bg-surface-container-low/50 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-on-surface-variant block text-[10px] uppercase">Número FUEC:</span>
                  <strong className="font-label-data text-xs text-primary font-bold">
                    {viewingFuec.fuecNumber || `FUEC-4409-COOTRANSVIG-2025-${viewingFuec.id}`}
                  </strong>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-badge text-[10px] font-bold">
                  AUTORIZADO RAMPA
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-b border-outline-variant/30 py-2">
                <div>
                  <span className="text-on-surface-variant block text-[11px]">Conductor Asignado:</span>
                  <strong className="text-on-surface">{viewingFuec.driverName}</strong>
                  <p className="text-[10px] text-on-surface-variant">{viewingFuec.driverId}</p>
                </div>
                <div>
                  <span className="text-on-surface-variant block text-[11px]">Vehículo / Placa:</span>
                  <strong className="text-on-surface">{viewingFuec.unitNumber} - {viewingFuec.plate}</strong>
                  <p className="text-[10px] text-on-surface-variant">{viewingFuec.vehicleModel}</p>
                </div>
              </div>

              <div className="flex justify-between py-1">
                <span>Ruta: <strong>Villanueva (Guajira) ➔ Valledupar (Cesar)</strong></span>
                <span>Hora Despacho: <strong>{viewingFuec.dispatchTime || currentTime}</strong></span>
              </div>

              <div className="p-2.5 bg-surface-container-lowest rounded-lg border border-outline-variant/40 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-bold text-[11px] text-primary block">Sello Digital PESV:</span>
                  <span className="text-[10px] text-on-surface-variant">Checklist preoperacional 100% verificado</span>
                </div>
                <div className="w-12 h-12 bg-white p-1 rounded border border-outline-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-primary">qr_code_2</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  alert('Enviando documento FUEC a la impresora térmica de rampa y descargando PDF...');
                }}
                className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-primary-container transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">print</span>
                <span>Imprimir / Descargar Planilla</span>
              </button>
              <button
                onClick={() => setViewingFuec(null)}
                className="px-4 py-2.5 rounded-xl border border-outline-variant text-on-surface font-bold text-xs hover:bg-surface-container transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INSPECCIÓN INDIVIDUAL DETALLE CON LOS 6 MÓDULOS */}
      {selectedInspection && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-6 max-w-2xl w-full border border-outline-variant shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">fact_check</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-sm sm:text-base font-bold text-on-surface">
                    Auditoría de Inspección Preoperacional
                  </h3>
                  <span className="font-label-badge text-xs text-on-surface-variant">
                    Folio: {selectedInspection.id} • {selectedInspection.timeLabel}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedInspection(null)}
                className="p-1 text-on-surface-variant hover:text-on-surface cursor-pointer rounded-lg hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
              {/* Vehicle & Driver Banner */}
              <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-primary">
                      {selectedInspection.unitNumber} ({selectedInspection.plate})
                    </h4>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-label-badge text-[11px] font-bold uppercase ${
                        selectedInspection.status === 'apto'
                          ? 'bg-secondary-container text-on-secondary-container'
                          : selectedInspection.status === 'bloqueado'
                          ? 'bg-red-600 text-white'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {selectedInspection.status === 'apto' ? 'Apto para Despacho' : 'Bloqueo Preventivo'}
                    </span>
                  </div>
                  <p className="text-on-surface-variant text-xs">
                    Conductor: <strong>{selectedInspection.driverName}</strong> ({selectedInspection.driverId})
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-on-surface-variant block text-[10px]">Odómetro:</span>
                    <strong className="text-on-surface font-label-data">{selectedInspection.odometerKm.toLocaleString()} KM</strong>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block text-[10px]">Conformidad:</span>
                    <strong className="text-secondary font-label-data">{selectedInspection.checklistCount}</strong>
                  </div>
                </div>
              </div>

              {/* Reported Failure or Novelty if any */}
              {selectedInspection.failureReason && (
                <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 text-red-950 space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-red-700">
                    <span className="material-symbols-outlined text-base">warning</span>
                    <span>Novedad Crítica / Causa de Bloqueo:</span>
                  </span>
                  <p className="text-xs font-medium pl-6">{selectedInspection.failureReason}</p>
                </div>
              )}

              {/* 6 Modules Tabs / Selector */}
              <div>
                <span className="font-bold text-on-surface block mb-2">
                  Desglose por Módulos Reglamentarios (36 Preguntas):
                </span>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  <button
                    type="button"
                    onClick={() => setAdminDetailModule(0)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      adminDetailModule === 0
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    Resumen 6 Módulos
                  </button>
                  {MODULE_GROUPS.map((m) => {
                    const moduleQs = INSPECTION_QUESTIONS.filter((q) => q.moduleId === m.id);
                    const passed = moduleQs.filter(
                      (q) => selectedInspection.checklist && selectedInspection.checklist[q.id]
                    ).length;

                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setAdminDetailModule(m.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                          adminDetailModule === m.id
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                        }`}
                      >
                        <span>{m.shortTitle}</span>
                        <span className="text-[10px] opacity-80">({passed}/{moduleQs.length})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Module Details Content */}
              {adminDetailModule === 0 ? (
                /* Grid of all 6 modules */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {MODULE_GROUPS.map((m) => {
                    const moduleQs = INSPECTION_QUESTIONS.filter((q) => q.moduleId === m.id);
                    const passed = moduleQs.filter(
                      (q) => selectedInspection.checklist && selectedInspection.checklist[q.id]
                    ).length;
                    const isAllOk = passed === moduleQs.length;

                    return (
                      <div
                        key={m.id}
                        onClick={() => setAdminDetailModule(m.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isAllOk
                            ? 'bg-surface-container-lowest border-secondary/30 hover:border-secondary'
                            : 'bg-red-50/50 border-red-200 hover:border-red-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-base text-primary">
                              {m.icon}
                            </span>
                            <span className="font-bold text-on-surface">{m.title}</span>
                          </div>
                          <span
                            className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                              isAllOk ? 'bg-secondary-container text-secondary' : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {passed}/{moduleQs.length}
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant line-clamp-1">
                          {isAllOk
                            ? 'Todos los puntos conformes'
                            : `${moduleQs.length - passed} observación(es) en este módulo`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Specific module question audit list */
                <div className="space-y-2 border border-outline-variant/50 rounded-xl p-3 bg-surface-container-lowest">
                  {INSPECTION_QUESTIONS.filter((q) => q.moduleId === adminDetailModule).map((q) => {
                    const isOk = selectedInspection.checklist
                      ? selectedInspection.checklist[q.id] === true
                      : selectedInspection.status === 'apto';

                    return (
                      <div
                        key={q.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low/50 gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`material-symbols-outlined text-base shrink-0 ${
                              isOk ? 'text-secondary' : 'text-error'
                            }`}
                          >
                            {isOk ? 'check_circle' : 'cancel'}
                          </span>
                          <span className="text-xs text-on-surface font-medium truncate">
                            {q.question}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                            isOk
                              ? 'bg-secondary-container text-on-secondary-container'
                              : 'bg-error-container text-on-error-container'
                          }`}
                        >
                          {isOk ? 'Conforme' : 'No Conforme'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="mt-4 pt-3 border-t border-outline-variant/40 flex flex-col sm:flex-row gap-2 shrink-0">
              {selectedInspection.status === 'bloqueado' && (
                <button
                  onClick={() => {
                    resolveInspectionFailure(selectedInspection.id);
                    setSelectedInspection((prev) => (prev ? { ...prev, status: 'apto', failureReason: undefined } : null));
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-secondary text-white font-bold text-xs hover:bg-secondary/90 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span>Levantar Bloqueo (Subsanado / Apto)</span>
                </button>
              )}

              {selectedInspection.status === 'apto' && (
                <button
                  onClick={() => {
                    authorizeDispatch(selectedInspection.id);
                    setViewingFuec(selectedInspection);
                    setSelectedInspection(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">verified</span>
                  <span>Emitir FUEC y Autorizar Salida</span>
                </button>
              )}

              <button
                onClick={() => setSelectedInspection(null)}
                className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface font-bold text-xs hover:bg-surface-container transition-all cursor-pointer text-center"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR NUEVA INSPECCIÓN MANUAL */}
      {showNewInspectionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-md w-full border border-outline-variant shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
              <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                Registrar Inspección de Flota
              </h3>
              <button
                onClick={() => setShowNewInspectionModal(false)}
                className="p-1 text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateManualInspection} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-on-surface-variant mb-1 font-semibold">Número Móvil</label>
                  <input
                    className="w-full p-2 rounded-lg bg-surface-container-low border border-outline-variant outline-none"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-on-surface-variant mb-1 font-semibold">Placa Vehicular</label>
                  <input
                    className="w-full p-2 rounded-lg bg-surface-container-low border border-outline-variant outline-none uppercase"
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-on-surface-variant mb-1 font-semibold">Nombre Conductor</label>
                <input
                  className="w-full p-2 rounded-lg bg-surface-container-low border border-outline-variant outline-none"
                  value={newDriver}
                  onChange={(e) => setNewDriver(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-on-surface-variant mb-1 font-semibold">Modelo</label>
                  <input
                    className="w-full p-2 rounded-lg bg-surface-container-low border border-outline-variant outline-none"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-on-surface-variant mb-1 font-semibold">Resultado de Chequeo</label>
                  <select
                    className="w-full p-2 rounded-lg bg-surface-container-low border border-outline-variant outline-none"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as 'apto' | 'bloqueado' | 'en_progreso')}
                  >
                    <option value="apto">Apto para Rampa</option>
                    <option value="bloqueado">Rechazado / Bloqueado</option>
                    <option value="en_progreso">En Proceso (Bahía)</option>
                  </select>
                </div>
              </div>

              {newStatus === 'bloqueado' && (
                <div>
                  <label className="block text-error mb-1 font-semibold">Motivo del Bloqueo</label>
                  <input
                    className="w-full p-2 rounded-lg bg-red-50 border border-red-300 outline-none"
                    placeholder="Ej. Falla en amortiguador o llanta lisa"
                    value={newFailureReason}
                    onChange={(e) => setNewFailureReason(e.target.value)}
                  />
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary-container transition-all cursor-pointer"
                >
                  Registrar en el Sistema
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewInspectionModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant text-on-surface font-bold hover:bg-surface-container transition-all cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: HISTORIAL DE NOTIFICACIONES */}
      {showNotificationsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-5 max-w-sm w-full border border-outline-variant shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
              <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                Notificaciones en Tiempo Real
              </h3>
              <button
                onClick={() => setShowNotificationsModal(false)}
                className="p-1 text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="mt-3 space-y-2 text-xs max-h-72 overflow-y-auto">
              <div className="p-2.5 rounded-lg bg-secondary-container/30 border-l-4 border-secondary">
                <span className="font-bold text-on-surface block">Recepción Inmediata Habilitada</span>
                <span className="text-on-surface-variant">
                  Cualquier registro completado en el Portal Conductor aparece al instante en este panel.
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-red-50 border-l-4 border-red-600">
                <span className="font-bold text-red-950 block">Alerta: BUS #108 Bloqueado</span>
                <span className="text-red-900">
                  Carlos Mestre reportó fuga de líquido de frenos a las 06:22 AM.
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-red-50 border-l-4 border-red-600">
                <span className="font-bold text-red-950 block">Alerta: VAN #215 SOAT Vencido</span>
                <span className="text-red-900">Jorge Gómez presenta vencimiento en RUNT.</span>
              </div>
            </div>

            <button
              onClick={() => setShowNotificationsModal(false)}
              className="mt-4 w-full py-2 rounded-xl bg-primary text-on-primary font-bold text-xs cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION BAR (Mobile) */}
      <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-2 py-2 md:hidden bg-surface-container-lowest border-t border-outline-variant shadow-lg">
        {/* Tab 1: Control */}
        <button
          onClick={() => {
            setAdminTab('control');
            setActiveFilter('todos');
          }}
          className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl active:scale-95 transition-all cursor-pointer ${
            (adminTab === 'control' || adminTab === 'inspecciones') && activeFilter === 'todos'
              ? 'bg-secondary-container text-on-secondary-container'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <span
            className="material-symbols-outlined text-xl"
            style={{ fontVariationSettings: adminTab === 'control' ? "'FILL' 1" : "'FILL' 0" }}
          >
            dashboard
          </span>
          <span className="font-label-badge text-label-badge text-[10px] mt-0.5 font-bold">Control</span>
        </button>

        {/* Tab 2: Flota / Vehículos */}
        <button
          onClick={() => setAdminTab('vehiculos')}
          className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl active:scale-95 transition-all cursor-pointer ${
            adminTab === 'vehiculos'
              ? 'bg-secondary-container text-on-secondary-container'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-xl">directions_car</span>
          <span className="font-label-badge text-label-badge text-[10px] mt-0.5 font-bold">Flota</span>
        </button>

        {/* Tab 3: Conductores */}
        <button
          onClick={() => setAdminTab('conductores')}
          className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl active:scale-95 transition-all cursor-pointer ${
            adminTab === 'conductores'
              ? 'bg-secondary-container text-on-secondary-container'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-xl">badge</span>
          <span className="font-label-badge text-label-badge text-[10px] mt-0.5 font-bold">Conductores</span>
        </button>

        {/* Tab 4: Alertas Críticas */}
        <button
          onClick={() => {
            setAdminTab('control');
            setActiveFilter('criticas');
          }}
          className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl relative active:scale-95 transition-all cursor-pointer ${
            adminTab === 'control' && activeFilter === 'criticas'
              ? 'bg-red-100 text-red-800'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-xl">warning</span>
          {stats.rejectedBlocked > 0 && (
            <span className="absolute top-1 right-2.5 w-2 h-2 bg-error rounded-full animate-ping"></span>
          )}
          <span className="font-label-badge text-label-badge text-[10px] mt-0.5">Alertas</span>
        </button>
      </nav>
    </div>
  );
};
