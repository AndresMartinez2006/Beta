import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { INITIAL_WAYPOINTS, INITIAL_ALERTS } from '../services/store';

interface ConductorDashboardProps {
  onOpenPreoperacional: () => void;
}

export const ConductorDashboard: React.FC<ConductorDashboardProps> = ({ onOpenPreoperacional }) => {
  const {
    conductorTab,
    setConductorTab,
    driverName,
    driverId,
    vehicleUnit,
    vehiclePlate,
    setVehicleUnit,
    setVehiclePlate,
    vehicles,
    inspections,
    logoutConductor,
  } = useApp();
  const [controlPointsOpen, setControlPointsOpen] = useState(true);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Check if Andrés has an inspection recorded
  const myInspection = inspections.find((i) => i.driverName === driverName || i.plate === vehiclePlate);

  return (
    <div className="bg-background text-on-surface font-body-md antialiased min-h-screen pb-24 selection:bg-secondary selection:text-on-secondary">
      {/* TOP APP BAR */}
      <header className="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-margin h-14 bg-surface-container-lowest/95 backdrop-blur-md shadow-sm border-b border-outline-variant">
        <div className="flex items-center gap-space-sm">
          <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-primary text-body-lg">directions_car</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">
              Cootransvig Conductor
            </span>
          </div>
        </div>
        <div className="flex items-center gap-space-sm">
          <button
            onClick={() => setShowNotificationModal(true)}
            aria-label="Notificaciones"
            className="relative p-space-xs rounded-full hover:bg-surface-container-low transition-colors text-on-surface active:scale-95 transition-transform duration-150 cursor-pointer"
          >
            <span className="material-symbols-outlined text-on-surface">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest"></span>
          </button>
          <button
            onClick={logoutConductor}
            title="Cerrar sesión"
            className="text-on-surface-variant hover:text-error p-1 rounded-lg hover:bg-surface-container-low transition-colors text-xs flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </header>

      {/* MAIN VIEWPORT CONTAINER */}
      <main className="pt-16 max-w-4xl mx-auto px-3 sm:px-6">
        {conductorTab === 'turnos' && (
          <>
            {/* 1. COMPACT DRIVER STATUS CARD */}
            <section className="mt-space-sm bg-surface-container-lowest rounded-xl p-space-sm border border-outline-variant shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-headline-sm border border-outline-variant">
                    <span className="material-symbols-outlined text-primary text-headline-sm">account_circle</span>
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-secondary-fixed-dim border-2 border-surface-container-lowest animate-pulse-dot"></div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold leading-none">
                      {driverName}
                    </span>
                    <span className="bg-surface-container-high text-on-secondary-container font-label-badge text-label-badge px-1.5 py-0.5 rounded">
                      {driverId}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-xs text-secondary">directions_car</span>
                    {vehicleUnit} ({vehiclePlate}) • Base Villanueva
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-container font-label-badge text-label-badge font-bold shrink-0 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse-dot"></span>
                En turno
              </span>
            </section>

            {/* 2. HIGH PRIORITY PRE-OPERATIONAL BANNER */}
            <section className="mt-space-sm">
              <div className="relative overflow-hidden bg-primary-container text-on-primary rounded-xl p-space-md shadow-md border border-outline-variant">
                <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-secondary-container/20 pointer-events-none blur-xl"></div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-headline-sm text-secondary-fixed icon-fill">
                      assignment_late
                    </span>
                    <h2 className="font-headline-sm text-headline-sm text-on-primary font-bold tracking-tight">
                      Inspección Preoperacional
                    </h2>
                  </div>
                  <span className="bg-error text-on-error font-label-badge text-label-badge px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                    Urgente
                  </span>
                </div>

                <p className="font-body-sm text-body-sm text-surface-container-high leading-snug mb-space-sm">
                  Chequeo diario obligatorio antes de iniciar ruta hacia Valledupar.
                </p>

                {myInspection && (
                  <div className="mb-2 p-2 rounded-lg bg-surface-container-lowest/15 border border-white/10 text-xs flex items-center justify-between">
                    <span className="text-surface-bright flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-secondary-fixed">verified</span>
                      Estado Actual: <strong>{myInspection.status.toUpperCase()} ({myInspection.checklistCount})</strong>
                    </span>
                    <span className="font-label-time text-[11px] text-surface-bright opacity-80">
                      {myInspection.timeLabel}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-space-sm flex-wrap sm:flex-nowrap">
                  <div className="flex flex-wrap gap-1 font-label-badge text-label-badge text-on-primary-container">
                    <span className="inline-flex items-center gap-1 bg-surface-container-lowest/15 px-2 py-0.5 rounded border border-white/10 text-surface-bright">
                      <span className="material-symbols-outlined text-xs">tire_repair</span> Neumáticos
                    </span>
                    <span className="inline-flex items-center gap-1 bg-surface-container-lowest/15 px-2 py-0.5 rounded border border-white/10 text-surface-bright">
                      <span className="material-symbols-outlined text-xs">oil_barrel</span> Fluidos
                    </span>
                    <span className="inline-flex items-center gap-1 bg-surface-container-lowest/15 px-2 py-0.5 rounded border border-white/10 text-surface-bright">
                      <span className="material-symbols-outlined text-xs">adjust</span> Frenos
                    </span>
                    <span className="inline-flex items-center gap-1 bg-surface-container-lowest/15 px-2 py-0.5 rounded border border-white/10 text-surface-bright">
                      <span className="material-symbols-outlined text-xs">wb_incandescent</span> Luces
                    </span>
                  </div>

                  <button
                    onClick={onOpenPreoperacional}
                    className="w-full sm:w-auto bg-secondary-fixed hover:bg-secondary-fixed-dim text-on-secondary-fixed font-headline-sm text-sm py-2 px-space-md rounded-lg flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all group shrink-0 cursor-pointer"
                  >
                    <span className="font-bold">Iniciar registro</span>
                    <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </div>
            </section>

            {/* 3. COMPACT ACTIVE DISPATCH & ROUTE CARD */}
            <section className="mt-space-sm bg-surface-container-lowest rounded-xl p-space-md border border-outline-variant shadow-sm">
              <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant">
                <div className="flex items-center gap-1.5">
                  <span className="bg-primary text-on-primary font-label-badge text-label-badge px-2 py-0.5 rounded">
                    Ruta 80
                  </span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    Villanueva ➔ Valledupar
                  </span>
                </div>
                <div className="text-right flex items-center gap-1.5">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Salida</span>
                  <span className="font-label-time text-label-time text-secondary font-extrabold">
                    8:24 AM <span className="font-body-sm text-body-sm text-secondary font-normal">(en 6m)</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-space-xs mt-space-sm">
                <div className="bg-surface-container-low p-space-xs px-2 rounded-lg border border-outline-variant/60">
                  <div className="flex items-center gap-1 text-on-surface-variant font-body-sm text-xs">
                    <span className="material-symbols-outlined text-xs text-secondary">pin_drop</span> Origen
                  </div>
                  <div className="font-headline-sm text-sm font-bold text-on-surface truncate">Terminal V/nueva</div>
                </div>
                <div className="bg-surface-container-low p-space-xs px-2 rounded-lg border border-outline-variant/60">
                  <div className="flex items-center gap-1 text-on-surface-variant font-body-sm text-xs">
                    <span className="material-symbols-outlined text-xs text-secondary">traffic</span> Tráfico
                  </div>
                  <div className="font-headline-sm text-sm font-bold text-secondary flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Fluido
                  </div>
                </div>
                <div className="bg-surface-container-low p-space-xs px-2 rounded-lg border border-outline-variant/60">
                  <div className="flex items-center gap-1 text-on-surface-variant font-body-sm text-xs">
                    <span className="material-symbols-outlined text-xs text-secondary">group</span> Pasajeros
                  </div>
                  <div className="font-headline-sm text-sm font-bold text-on-surface">4/4 (100%)</div>
                </div>
              </div>

              <div className="mt-space-xs p-1.5 bg-surface-container-low rounded-lg flex items-center justify-between border border-outline-variant/60">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-sm">verified_user</span>
                  <span className="font-body-sm text-xs text-on-surface">
                    Planilla: <strong className="text-primary font-semibold">FUEC Activa & GPS Conectado</strong>
                  </span>
                </div>
                <span className="font-label-badge text-label-badge text-secondary font-bold flex items-center gap-1 bg-surface-container-high px-2 py-0.5 rounded-full text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse-dot"></span>
                  En Línea
                </span>
              </div>
            </section>

            {/* 4. INTERACTIVE ACCORDION: PUNTOS DE CONTROL */}
            <section className="mt-space-sm">
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setControlPointsOpen(!controlPointsOpen)}
                  className="w-full text-left cursor-pointer p-space-sm flex items-center justify-between hover:bg-surface-container-low transition-colors select-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-headline-sm">alt_route</span>
                    <div>
                      <h3 className="font-headline-sm text-sm font-bold text-on-surface leading-tight">
                        Puntos de Control del Recorrido
                      </h3>
                      <p className="font-body-sm text-xs text-on-surface-variant">
                        Próximo: <strong className="text-secondary font-semibold">Terminal Villanueva (08:24 AM)</strong>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-label-badge text-label-badge bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full font-bold">
                      4 paradas
                    </span>
                    <span
                      className={`material-symbols-outlined text-on-surface-variant transition-transform ${
                        controlPointsOpen ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </div>
                </button>

                {controlPointsOpen && (
                  <div className="p-space-sm pt-0 border-t border-outline-variant/60 grid grid-cols-1 sm:grid-cols-2 gap-space-xs mt-space-xs animate-fade-in">
                    {INITIAL_WAYPOINTS.map((wp) => (
                      <div
                        key={wp.id}
                        className={`bg-surface-container-low p-space-xs rounded-lg border ${
                          wp.isCurrent ? 'border-secondary/40' : 'border-outline-variant/60'
                        } flex items-center justify-between`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full ${
                              wp.isCurrent ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-primary'
                            } flex items-center justify-center font-label-data text-xs font-bold shrink-0`}
                          >
                            {wp.order}
                          </span>
                          <div>
                            <span className="font-body-md text-xs font-bold text-on-surface block leading-tight">
                              {wp.name}
                            </span>
                            <span className="font-body-sm text-xs text-on-surface-variant">{wp.role}</span>
                          </div>
                        </div>
                        <span
                          className={`${
                            wp.statusText === 'A tiempo'
                              ? 'bg-secondary-fixed text-on-secondary-container'
                              : 'bg-surface-container-high text-on-surface-variant'
                          } font-label-badge text-xs px-2 py-0.5 rounded-full font-bold shrink-0`}
                        >
                          {wp.statusText}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* 5. INTERACTIVE ACCORDION: AVISOS OPERATIVOS DE CARRETERA */}
            <section className="mt-space-sm mb-space-sm">
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setAlertsOpen(!alertsOpen)}
                  className="w-full text-left cursor-pointer p-space-sm flex items-center justify-between hover:bg-surface-container-low transition-colors select-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-headline-sm">cell_tower</span>
                    <div>
                      <h3 className="font-headline-sm text-sm font-bold text-on-surface leading-tight">
                        Avisos Operativos & Carretera
                      </h3>
                      <p className="font-body-sm text-xs text-on-surface-variant">2 novedades de tráfico y vía</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-label-badge text-label-badge bg-secondary-container/20 text-on-secondary-container px-2 py-0.5 rounded-full font-bold">
                      2 Nuevos
                    </span>
                    <span
                      className={`material-symbols-outlined text-on-surface-variant transition-transform ${
                        alertsOpen ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </div>
                </button>

                {alertsOpen && (
                  <div className="p-space-sm pt-0 border-t border-outline-variant/60 space-y-space-xs mt-space-xs animate-fade-in">
                    {INITIAL_ALERTS.map((alert) => (
                      <div
                        key={alert.id}
                        className={`bg-surface-container-low p-space-xs px-space-sm rounded-lg border-l-4 ${
                          alert.type === 'traffic' ? 'border-l-secondary' : 'border-l-primary-container'
                        } flex items-start gap-2`}
                      >
                        <span className="material-symbols-outlined text-secondary text-sm mt-0.5">
                          {alert.type === 'traffic' ? 'toll' : 'wb_sunny'}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-body-md text-xs font-bold text-on-surface">{alert.title}</span>
                            <span className="font-body-sm text-xs text-on-surface-variant">{alert.timeAgo}</span>
                          </div>
                          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">{alert.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* RUTAS TAB */}
        {conductorTab === 'rutas' && (
          <div className="space-y-4 pt-2 animate-fade-in">
            <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-headline-sm text-base font-bold text-primary">Ruta 80: Villanueva ⇄ Valledupar</h2>
                <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-badge text-xs font-bold">
                  Recorrido: 58 KM
                </span>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg mb-3 border border-outline-variant/60">
                <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1">
                  <span>Velocidad promedio: <strong>65 km/h</strong></span>
                  <span>Tiempo estimado: <strong>1h 10m</strong></span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                  <div className="bg-secondary h-2 rounded-full w-1/4"></div>
                </div>
              </div>

              {/* Passenger list */}
              <h3 className="font-headline-sm text-xs font-bold text-on-surface mb-2">Manifiesto de Pasajeros (FUEC 4/4)</h3>
              <div className="divide-y divide-outline-variant/40 text-xs">
                <div className="py-2 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-on-surface">Asiento 1: Carmen Elena Daza</p>
                    <p className="text-on-surface-variant text-[11px]">CC: 49.782.102 • Destino: Valledupar Centro</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-surface-container text-secondary font-bold">Abordado</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-on-surface">Asiento 2: Jairo Orozco</p>
                    <p className="text-on-surface-variant text-[11px]">CC: 12.441.902 • Destino: San Juan del Cesar</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-surface-container text-secondary font-bold">Abordado</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-on-surface">Asiento 3: Laura Marcela Sierra</p>
                    <p className="text-on-surface-variant text-[11px]">CC: 1.065.821.390 • Destino: La Paz</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-surface-container text-secondary font-bold">Abordado</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-on-surface">Asiento 4: Roberto Morales</p>
                    <p className="text-on-surface-variant text-[11px]">CC: 77.194.281 • Destino: Terminal Valledupar</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-surface-container text-secondary font-bold">Abordado</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PERFIL TAB */}
        {conductorTab === 'perfil' && (
          <div className="space-y-4 pt-2 animate-fade-in">
            <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant shadow-sm text-center">
              <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary text-xl font-bold flex items-center justify-center mx-auto mb-2 shadow-inner">
                AM
              </div>
              <h2 className="font-headline-sm text-lg font-bold text-on-surface">{driverName}</h2>
              <p className="text-xs text-on-surface-variant">Conductor Vinculado • Cootransvig S.A.S.</p>
              <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-container font-label-badge text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-secondary"></span> Licencia C1 Vigente • ID {driverId}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-left text-xs">
                <div className="p-3 bg-surface-container-low rounded-lg">
                  <span className="text-on-surface-variant block">Vehículo Asignado</span>
                  <strong className="text-primary font-bold">{vehicleUnit}</strong>
                  <span className="text-[11px] text-on-surface block">Placa: {vehiclePlate}</span>
                </div>
                <div className="p-3 bg-surface-container-low rounded-lg">
                  <span className="text-on-surface-variant block">Índice de Seguridad</span>
                  <strong className="text-secondary font-bold">99.2% Sobresaliente</strong>
                  <span className="text-[11px] text-on-surface block">0 infracciones</span>
                </div>
              </div>

              <div className="mt-4 border-t border-outline-variant/40 pt-3 text-left text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-outline-variant/30">
                  <span className="text-on-surface-variant">Base Principal:</span>
                  <span className="font-bold text-on-surface">Terminal Villanueva (La Guajira)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-outline-variant/30">
                  <span className="text-on-surface-variant">Cédula de Ciudadanía:</span>
                  <span className="font-bold text-on-surface">1.065.892.411</span>
                </div>
                <div className="flex justify-between py-1 border-b border-outline-variant/30">
                  <span className="text-on-surface-variant">Teléfono móvil:</span>
                  <span className="font-bold text-on-surface">+57 301 458 9210</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-on-surface-variant">Contacto de Emergencia:</span>
                  <span className="font-bold text-on-surface">Elena Martínez (Hermana) - 312 405 8899</span>
                </div>
              </div>

              <button
                onClick={logoutConductor}
                className="mt-4 w-full py-2.5 rounded-xl border border-error/30 text-error hover:bg-error-container hover:text-on-error-container font-bold text-xs transition-colors cursor-pointer"
              >
                Cerrar Sesión de Conductor
              </button>
            </div>
          </div>
        )}
      </main>

      {/* BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 w-full z-40 h-16 bg-surface-container-lowest/95 backdrop-blur-md shadow-md border-t border-outline-variant px-4">
        <div className="max-w-lg mx-auto h-full flex justify-around items-center">
          {/* Tab 1: Turnos */}
          <button
            onClick={() => setConductorTab('turnos')}
            className={`flex flex-col items-center justify-center ${
              conductorTab === 'turnos' ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-secondary'
            } active:scale-95 transition-transform duration-150 cursor-pointer`}
          >
            <span
              className="material-symbols-outlined text-headline-sm"
              style={{ fontVariationSettings: conductorTab === 'turnos' ? "'FILL' 1" : "'FILL' 0" }}
            >
              schedule
            </span>
            <span className="font-label-badge text-label-badge mt-0.5">Turnos</span>
          </button>

          {/* Tab 2: Vehículo (Carro de Servicio Especial / Preoperacional) */}
          <button
            onClick={onOpenPreoperacional}
            className={`flex flex-col items-center justify-center ${
              conductorTab === 'vehiculo' ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-secondary'
            } active:scale-95 transition-transform duration-150 cursor-pointer`}
          >
            <span
              className="material-symbols-outlined text-headline-sm"
              style={{ fontVariationSettings: conductorTab === 'vehiculo' ? "'FILL' 1" : "'FILL' 0" }}
            >
              directions_car
            </span>
            <span className="font-label-badge text-label-badge mt-0.5">Vehículo</span>
          </button>

          {/* Tab 3: Rutas */}
          <button
            onClick={() => setConductorTab('rutas')}
            className={`flex flex-col items-center justify-center ${
              conductorTab === 'rutas' ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-secondary'
            } active:scale-95 transition-transform duration-150 cursor-pointer`}
          >
            <span
              className="material-symbols-outlined text-headline-sm"
              style={{ fontVariationSettings: conductorTab === 'rutas' ? "'FILL' 1" : "'FILL' 0" }}
            >
              alt_route
            </span>
            <span className="font-label-badge text-label-badge mt-0.5">Rutas</span>
          </button>

          {/* Tab 4: Perfil */}
          <button
            onClick={() => setConductorTab('perfil')}
            className={`flex flex-col items-center justify-center ${
              conductorTab === 'perfil' ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-secondary'
            } active:scale-95 transition-transform duration-150 cursor-pointer`}
          >
            <span
              className="material-symbols-outlined text-headline-sm"
              style={{ fontVariationSettings: conductorTab === 'perfil' ? "'FILL' 1" : "'FILL' 0" }}
            >
              account_circle
            </span>
            <span className="font-label-badge text-label-badge mt-0.5">Perfil</span>
          </button>
        </div>
      </nav>

      {/* Driver Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-5 max-w-sm w-full border border-outline-variant shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-headline-sm text-sm font-bold text-on-surface">Avisos Operativos del Despacho</h3>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="p-1 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-surface-container-low border-l-4 border-secondary">
                <span className="font-bold text-on-surface block">Ruta Habilitada con FUEC</span>
                <span className="text-on-surface-variant">
                  Tu planilla del Renault Logan #204 está sincronizada con el satélite MinTransporte.
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container-low border-l-4 border-error">
                <span className="font-bold text-on-surface block">Recordatorio de Inspección</span>
                <span className="text-on-surface-variant">
                  Debes diligenciar la inspección preoperacional obligatoria antes de abordar pasajeros.
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowNotificationModal(false)}
              className="mt-4 w-full py-2 rounded-xl bg-primary text-on-primary font-bold text-xs"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
