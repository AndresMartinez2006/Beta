import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { InspectionStatus, InspectionRecord } from '../types';
import {
  INSPECTION_QUESTIONS,
  MODULE_GROUPS,
  InspectionQuestionItem,
} from '../data/inspectionQuestions';
import { CootransvigLogo } from './CootransvigLogo';
import { InspectionReportPdfModal } from './InspectionReportPdfModal';

interface PreoperacionalFormProps {
  onBack: () => void;
}

export const PreoperacionalForm: React.FC<PreoperacionalFormProps> = ({ onBack }) => {
  const {
    driverName,
    driverId,
    vehiclePlate,
    vehicleUnit,
    submitInspection,
    setActivePortal,
    currentTime,
    currentDate,
    hasDriverInspectedToday,
    hasVehicleInspectedToday,
    vehicles,
    drivers,
  } = useApp();

  // Check if this driver or vehicle has already inspected today (1 per day limit)
  const existingTodayInspection = useMemo(() => {
    return hasDriverInspectedToday(driverId) || hasVehicleInspectedToday(vehiclePlate);
  }, [hasDriverInspectedToday, hasVehicleInspectedToday, driverId, vehiclePlate]);

  // Active module filter (0 = all modules, 1..6 = specific module)
  const [selectedModuleId, setSelectedModuleId] = useState<number>(1);

  const [odometerKm, setOdometerKm] = useState<number>(48215);
  const [odometerPhoto, setOdometerPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=400&q=80'
  );
  const [swornDeclaration, setSwornDeclaration] = useState<boolean>(true);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [submittedRecord, setSubmittedRecord] = useState<InspectionRecord | null>(null);
  const [failureNote, setFailureNote] = useState<string>('');
  const [viewingPdfRecord, setViewingPdfRecord] = useState<InspectionRecord | null>(null);

  // Initialize checklist values: starts in false (0% de cero) as requested
  const [checklistValues, setChecklistValues] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    INSPECTION_QUESTIONS.forEach((q) => {
      initial[q.id] = false;
    });
    return initial;
  });

  // Track which items have been actively touched/answered by the driver
  const [answeredItems, setAnsweredItems] = useState<Record<string, boolean>>({});

  // Calculate compliance stats across all 36 items
  const totalQuestions = INSPECTION_QUESTIONS.length; // 36
  const compliantCount = useMemo(() => {
    return Object.values(checklistValues).filter(Boolean).length;
  }, [checklistValues]);

  const answeredCount = useMemo(() => {
    return Object.keys(answeredItems).length;
  }, [answeredItems]);

  const progressPercent = Math.round((compliantCount / totalQuestions) * 100);

  // Group stats by module
  const moduleCompliance = useMemo(() => {
    const map: Record<number, { compliant: number; answered: number; total: number }> = {};
    MODULE_GROUPS.forEach((m) => {
      const moduleQuestions = INSPECTION_QUESTIONS.filter((q) => q.moduleId === m.id);
      const passed = moduleQuestions.filter((q) => checklistValues[q.id]).length;
      const touched = moduleQuestions.filter((q) => answeredItems[q.id]).length;
      map[m.id] = { compliant: passed, answered: touched, total: moduleQuestions.length };
    });
    return map;
  }, [checklistValues, answeredItems]);

  // Reset all to false (start from scratch)
  const handleResetChecklist = () => {
    const reset: Record<string, boolean> = {};
    INSPECTION_QUESTIONS.forEach((q) => {
      reset[q.id] = false;
    });
    setChecklistValues(reset);
    setAnsweredItems({});
    setFailureNote('');
  };

  // Toggle single item with interactive feedback
  const handleSetItemValue = (question: InspectionQuestionItem, isCompliant: boolean) => {
    setChecklistValues((prev) => ({
      ...prev,
      [question.id]: isCompliant,
    }));
    setAnsweredItems((prev) => ({
      ...prev,
      [question.id]: true,
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setOdometerPhoto(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Form Submission with Real Time
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!swornDeclaration) {
      alert('Debes aceptar la declaración juramentada para formalizar la planilla.');
      return;
    }

    // Determine status: all 36 items must be compliant
    const allPassed = compliantCount === totalQuestions;
    const status: InspectionStatus = allPassed ? 'apto' : 'bloqueado';

    // Collect non-compliant items for description
    const failedQuestions = INSPECTION_QUESTIONS.filter((q) => !checklistValues[q.id]);
    const autoFailureReason =
      failedQuestions.length > 0
        ? failureNote ||
          `Novedades detectadas en: ${failedQuestions
            .slice(0, 3)
            .map((q) => q.question)
            .join('; ')}${failedQuestions.length > 3 ? ` (+${failedQuestions.length - 3} más)` : ''}`
        : undefined;

    const newRecord = submitInspection({
      unitNumber: vehicleUnit,
      plate: vehiclePlate,
      vehicleModel: 'Renault Logan',
      driverName,
      driverId,
      driverPhone: '+57 301 458 9210',
      status,
      odometerKm,
      odometerPhoto,
      checklistCount: `${compliantCount}/${totalQuestions}`,
      checklistProgress: progressPercent,
      checklist: checklistValues,
      turnLabel: `Turno ${currentTime}`,
      failureReason: autoFailureReason,
      dispatchAuthorized: allPassed,
      dispatchTime: allPassed ? currentTime : undefined,
      fuecNumber: allPassed
        ? `FUEC-4409-COOTRANSVIG-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`
        : undefined,
    });

    setSubmittedRecord(newRecord);
    setShowSuccessModal(true);
  };

  // Modules to render based on active tab
  const modulesToRender = useMemo(() => {
    if (selectedModuleId === 0) {
      return MODULE_GROUPS;
    }
    return MODULE_GROUPS.filter((m) => m.id === selectedModuleId);
  }, [selectedModuleId]);

  // If driver or vehicle already inspected today, display clear limit screen
  if (existingTodayInspection) {
    return (
      <div className="min-h-screen bg-background text-on-surface font-body-md antialiased p-4 sm:p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-outline-variant/60 shadow-xl text-center space-y-5 animate-fade-in">
          <div className="flex justify-center">
            <CootransvigLogo className="h-16 w-auto" />
          </div>

          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
            <span className="material-symbols-outlined text-4xl icon-fill">verified</span>
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs uppercase tracking-wide mb-2">
              1 Inspección Diaria Reglamentaria
            </span>
            <h2 className="font-headline-sm text-lg sm:text-xl font-bold text-on-surface">
              Inspección de Hoy Completada
            </h2>
            <p className="font-body-sm text-xs text-on-surface-variant mt-1.5 leading-relaxed">
              Ya realizaste la verificación técnica obligatoria para la jornada de hoy{' '}
              <strong className="text-on-surface font-semibold">{currentDate}</strong> a las{' '}
              <strong className="text-on-surface font-semibold">{existingTodayInspection.timeLabel}</strong>.
            </p>
          </div>

          {/* Details Pill Box */}
          <div className="bg-surface-container-low rounded-2xl p-4 text-left text-xs space-y-2.5 border border-outline-variant/60">
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant font-medium">Folio Oficial:</span>
              <strong className="font-mono text-primary font-bold">{existingTodayInspection.id}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant font-medium">Vehículo:</span>
              <strong className="text-on-surface">
                {existingTodayInspection.unitNumber} ({existingTodayInspection.plate})
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant font-medium">Conductor:</span>
              <strong className="text-on-surface">{existingTodayInspection.driverName}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant font-medium">Dictamen Técnico:</span>
              <span
                className={`font-black px-2 py-0.5 rounded text-[11px] ${
                  existingTodayInspection.status === 'apto'
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'bg-red-100 text-red-900'
                }`}
              >
                {existingTodayInspection.status === 'apto' ? '✓ APTO PARA RUTA' : '✕ BLOQUEO PREVENTIVO'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant font-medium">Odómetro:</span>
              <strong className="font-mono text-on-surface">
                {existingTodayInspection.odometerKm.toLocaleString('es-CO')} KM
              </strong>
            </div>
            {existingTodayInspection.fuecNumber && (
              <div className="flex items-center justify-between pt-1 border-t border-outline-variant/40">
                <span className="text-on-surface-variant font-medium">FUEC Asignado:</span>
                <strong className="font-mono text-emerald-800 text-[11px]">
                  {existingTodayInspection.fuecNumber}
                </strong>
              </div>
            )}
          </div>

          <p className="text-[11px] text-on-surface-variant leading-normal">
            Por directriz del Plan Estratégico de Seguridad Vial (PESV) y del Ministerio de Transporte,
            el sistema habilita un solo registro al inicio de turno diario. Tu próxima inspección se habilitará en la siguiente jornada.
          </p>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs text-amber-950 flex items-start gap-2">
            <span className="material-symbols-outlined text-base text-amber-700 shrink-0 mt-0.5">science</span>
            <p className="leading-relaxed">
              <strong>¿Estás en fase de pruebas?</strong> El Administrador puede eliminar este registro desde su panel de control (icono de papelera). Al eliminarlo, esta restricción se liberará al instante y podrás realizar una nueva inspección preoperacional de prueba.
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            <button
              onClick={() => setViewingPdfRecord(existingTodayInspection)}
              id="btn-view-today-pdf"
              className="w-full py-3 rounded-xl bg-secondary hover:bg-secondary/90 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              <span className="material-symbols-outlined text-base">picture_as_pdf</span>
              <span>Descargar / Ver Reporte Oficial PDF</span>
            </button>

            <button
              onClick={onBack}
              className="w-full py-2.5 rounded-xl bg-surface-container text-on-surface-variant hover:bg-surface-container-high font-bold text-xs transition-colors cursor-pointer"
            >
              Volver al Panel Principal
            </button>
          </div>

          {viewingPdfRecord && (
            <InspectionReportPdfModal
              inspection={viewingPdfRecord}
              vehicle={vehicles.find((v) => v.plate === viewingPdfRecord.plate)}
              driver={drivers.find((d) => d.id === viewingPdfRecord.driverId)}
              onClose={() => setViewingPdfRecord(null)}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md antialiased pb-32">
      {/* Top sticky app header with real-time clock */}
      <header className="sticky top-0 z-40 w-full bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant/60 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onBack}
              aria-label="Volver atrás"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-primary transition-all hover:bg-surface-container active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <div className="flex flex-col min-w-0">
              <h1 className="font-headline-sm text-sm sm:text-base font-bold leading-tight text-primary truncate">
                Planilla Preoperacional Diaria
              </h1>
              <span className="font-label-badge text-xs text-secondary truncate flex items-center gap-1.5">
                <span>COOTRANSVIG • {vehicleUnit} ({vehiclePlate})</span>
              </span>
            </div>
          </div>

          {/* Real-time Clock pill */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-low border border-outline-variant/50 text-xs font-mono font-bold text-primary">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse-dot"></span>
              <span>{currentTime}</span>
            </div>

            <button
              onClick={() => setShowHelpModal(true)}
              title="Normativa MinTransporte"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">help</span>
            </button>
            <button
              onClick={handleResetChecklist}
              title="Reiniciar checklist a cero"
              className="px-2.5 py-1.5 rounded-lg border border-outline-variant text-[11px] font-bold text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-all cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-xs">restart_alt</span>
              <span className="hidden sm:inline">A Cero</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container - Responsive & Multiplatform */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 pt-4 space-y-4">
        {/* 1. Driver & Corridor Info Card with Live Date/Time */}
        <section className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 border border-outline-variant/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary font-headline-sm text-sm font-bold shadow-xs">
              AM
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface-container-lowest bg-secondary-fixed-dim"></span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-headline-sm text-sm font-bold text-on-surface">
                  {driverName}
                </p>
                <span className="font-label-badge text-[11px] px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-semibold">
                  Cód: {driverId}
                </span>
                <span className="font-label-badge text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">
                  1 Por Día
                </span>
              </div>
              <p className="font-body-sm text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-xs text-primary">near_me</span>
                Ruta: Villanueva ⇄ Valledupar (Ruta Nacional 80)
              </p>
            </div>
          </div>

          <div className="flex items-center sm:flex-col sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-outline-variant/40">
            <span className="font-label-badge text-xs px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold">
              HORA REAL: {currentTime}
            </span>
            <span className="font-label-time text-[11px] text-on-surface-variant mt-0.5">
              {currentDate} • Res. 20223040040695 PESV
            </span>
          </div>
        </section>

        {/* 2. Global Interactive Progress Banner (NO 'Mark All' shortcut) */}
        <section className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 border border-outline-variant/60 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-on-primary shrink-0">
                <span className="material-symbols-outlined text-lg icon-fill">checklist</span>
              </div>
              <div>
                <p className="font-headline-sm text-sm font-bold text-on-surface">
                  {compliantCount} de {totalQuestions} Ítems Verificados Conformes
                </p>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  {compliantCount === totalQuestions
                    ? '¡Checklist 100% conforme! Vehículo completamente apto para despacho'
                    : answeredCount < totalQuestions
                    ? `Has evaluado ${answeredCount} de ${totalQuestions} preguntas. Continúa con cada módulo guiado.`
                    : `Hay ${totalQuestions - compliantCount} ítems con novedad técnica.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="font-headline-md text-2xl font-black text-primary">
                {progressPercent}%
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-surface-container rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                progressPercent === 100
                  ? 'bg-secondary'
                  : progressPercent > 50
                  ? 'bg-primary'
                  : 'bg-amber-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          {/* Stepper info tag */}
          <div className="text-[11px] text-on-surface-variant flex items-center justify-between pt-1">
            <span className="flex items-center gap-1 font-semibold text-secondary">
              <span className="material-symbols-outlined text-sm">touch_app</span>
              Evaluación interactiva paso a paso obligatoria
            </span>
            <span className="font-mono text-primary font-bold">
              {answeredCount}/{totalQuestions} Contestadas
            </span>
          </div>
        </section>

        {/* 3. Interactive Guided Stepper Tabs */}
        <nav
          aria-label="Módulos de Inspección"
          className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-0.5 sticky top-16 z-30 bg-background/95 backdrop-blur-xs"
        >
          <button
            type="button"
            onClick={() => setSelectedModuleId(0)}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs ${
              selectedModuleId === 0
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container border border-outline-variant/60'
            }`}
          >
            <span className="material-symbols-outlined text-base">apps</span>
            <span>Ver Todo ({totalQuestions})</span>
          </button>

          {MODULE_GROUPS.map((m) => {
            const comp = moduleCompliance[m.id];
            const isFull = comp && comp.compliant === comp.total;
            const isSelected = selectedModuleId === m.id;

            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedModuleId(m.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs ${
                  isSelected
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container border border-outline-variant/60'
                }`}
              >
                <span className="material-symbols-outlined text-base">{m.icon}</span>
                <span>{m.shortTitle}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isFull
                      ? 'bg-secondary text-white'
                      : isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {comp ? `${comp.compliant}/${comp.total}` : m.itemCount}
                </span>
              </button>
            );
          })}
        </nav>

        {/* 4. Form Checklist Sections (Interactive Cards) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {modulesToRender.map((module) => {
            const comp = moduleCompliance[module.id];
            const isModuleComplete = comp && comp.compliant === comp.total;

            return (
              <section
                key={module.id}
                className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 border border-outline-variant/60 shadow-xs space-y-4"
              >
                {/* Module Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-outline-variant/40">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-container text-on-primary font-bold text-sm shrink-0">
                      <span className="material-symbols-outlined text-xl">{module.icon}</span>
                    </div>
                    <div>
                      <h2 className="font-headline-sm text-sm sm:text-base font-bold text-on-surface">
                        {module.title}
                      </h2>
                      <p className="font-body-sm text-xs text-on-surface-variant">
                        {module.itemCount} ítems reglamentarios de verificación
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`font-label-badge text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
                        isModuleComplete
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {isModuleComplete ? 'check_circle' : 'pending'}
                      </span>
                      <span>
                        {comp?.compliant} de {comp?.total} Conformes
                      </span>
                    </span>
                  </div>
                </div>

                {/* Subgroups & Interactive Question Items */}
                <div className="space-y-4">
                  {module.subgroups.map((subgroup, sIdx) => (
                    <div key={sIdx} className="space-y-2">
                      {subgroup.name && (
                        <h3 className="text-xs font-bold uppercase tracking-wider text-primary px-1 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                          <span>{subgroup.name}</span>
                        </h3>
                      )}

                      <div className="grid grid-cols-1 gap-2.5">
                        {subgroup.items.map((q) => {
                          const isTouched = answeredItems[q.id] === true;
                          const isCompliant = checklistValues[q.id] === true;

                          return (
                            <div
                              key={q.id}
                              className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                !isTouched
                                  ? 'bg-surface-container-lowest border-outline-variant/60 hover:border-primary/40'
                                  : isCompliant
                                  ? 'bg-emerald-50/40 border-emerald-300 shadow-2xs'
                                  : 'bg-rose-50/50 border-rose-300 shadow-2xs'
                              }`}
                            >
                              <div className="flex items-start gap-3 min-w-0">
                                <div
                                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-[11px] font-bold ${
                                    !isTouched
                                      ? 'bg-surface-container text-on-surface-variant'
                                      : isCompliant
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-rose-600 text-white'
                                  }`}
                                >
                                  {q.id}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-headline-sm text-xs sm:text-sm font-semibold text-on-surface leading-snug">
                                    {q.question}
                                  </p>
                                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                    {q.regulation && (
                                      <span className="text-[10px] font-mono text-on-surface-variant/80">
                                        [{q.regulation}]
                                      </span>
                                    )}
                                    {q.critical && (
                                      <span className="inline-block text-[10px] font-bold text-error">
                                        • Requisito Crítico PESV
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Interactive Tactical Buttons */}
                              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                                {q.invertCompliance ? (
                                  /* Inverted Question: "No" is compliant, "Sí" is risk */
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleSetItemValue(q, true)}
                                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                                        isTouched && isCompliant
                                          ? 'bg-emerald-700 text-white shadow-md'
                                          : 'bg-surface-container hover:bg-emerald-100 hover:text-emerald-900 text-on-surface-variant'
                                      }`}
                                    >
                                      <span className="material-symbols-outlined text-base">check</span>
                                      <span>{q.noLabel || 'No (Sin consumo)'}</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleSetItemValue(q, false)}
                                      className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                                        isTouched && !isCompliant
                                          ? 'bg-rose-700 text-white font-bold shadow-md'
                                          : 'bg-surface-container hover:bg-rose-100 hover:text-rose-900 text-on-surface-variant'
                                      }`}
                                    >
                                      <span className="material-symbols-outlined text-base">warning</span>
                                      <span>{q.yesLabel || 'Sí (Consumo)'}</span>
                                    </button>
                                  </>
                                ) : (
                                  /* Standard Checklist Question: "Sí" is compliant, "No" is non-compliant */
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleSetItemValue(q, true)}
                                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                                        isTouched && isCompliant
                                          ? 'bg-emerald-700 text-white shadow-md'
                                          : 'bg-surface-container hover:bg-emerald-100 hover:text-emerald-900 text-on-surface-variant'
                                      }`}
                                    >
                                      <span className="material-symbols-outlined text-base">check</span>
                                      <span>{q.yesLabel || 'Sí / Conforme'}</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleSetItemValue(q, false)}
                                      className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                                        isTouched && !isCompliant
                                          ? 'bg-rose-700 text-white font-bold shadow-md'
                                          : 'bg-surface-container hover:bg-rose-100 hover:text-rose-900 text-on-surface-variant'
                                      }`}
                                    >
                                      <span className="material-symbols-outlined text-base">close</span>
                                      <span>{q.noLabel || 'No / Falla'}</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stepper Navigation Buttons (Next/Previous module) */}
                {selectedModuleId > 0 && (
                  <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      disabled={selectedModuleId <= 1}
                      onClick={() => setSelectedModuleId((prev) => Math.max(1, prev - 1))}
                      className="px-3.5 py-2 rounded-xl border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span>
                      <span>Módulo Anterior</span>
                    </button>

                    <span className="text-[11px] font-bold text-on-surface-variant">
                      Módulo {selectedModuleId} de 6
                    </span>

                    {selectedModuleId < 6 ? (
                      <button
                        type="button"
                        onClick={() => setSelectedModuleId((prev) => Math.min(6, prev + 1))}
                        className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5 hover:bg-primary-container active:scale-95 shadow-xs cursor-pointer"
                      >
                        <span>Siguiente Módulo</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedModuleId(0)}
                        className="px-4 py-2 rounded-xl bg-secondary text-white text-xs font-bold flex items-center gap-1.5 hover:bg-secondary/90 active:scale-95 shadow-xs cursor-pointer"
                      >
                        <span>Revisar Todo</span>
                        <span className="material-symbols-outlined text-sm">visibility</span>
                      </button>
                    )}
                  </div>
                )}
              </section>
            );
          })}

          {/* Observations / Failure note if any item is not compliant */}
          {compliantCount < totalQuestions && (
            <section className="bg-error-container/30 rounded-2xl p-4 sm:p-5 border border-error/30 space-y-2.5">
              <div className="flex items-center gap-2 text-error font-bold text-xs sm:text-sm">
                <span className="material-symbols-outlined text-lg">report_problem</span>
                <span>
                  Atención: Hay {totalQuestions - compliantCount} ítems pendientes o no conformes
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Si envías la inspección con novedades técnicas o documentales, el sistema bloqueará
                preventivamente el vehículo hasta que el Centro de Control de Cootransvig examine el
                caso.
              </p>
              <textarea
                value={failureNote}
                onChange={(e) => setFailureNote(e.target.value)}
                placeholder="Describe brevemente la novedad técnica detectada (ej: bombillo direccional izquierdo fundido)..."
                rows={2}
                className="w-full p-2.5 rounded-xl bg-surface text-on-surface border border-outline-variant font-body-sm text-xs focus:ring-1 focus:ring-error focus:outline-none"
              />
            </section>
          )}

          {/* 5. Odómetro y Registro Fotográfico con Hora Real */}
          <section className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 border border-outline-variant/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
              <h2 className="font-headline-sm text-sm sm:text-base font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">speed</span>
                <span>Odómetro y Evidencia Fotográfica</span>
              </h2>
              <span className="font-mono text-xs font-bold text-secondary bg-secondary-container px-2 py-0.5 rounded">
                Hora: {currentTime}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="font-body-sm text-xs text-on-surface-variant block mb-1">
                  Kilometraje Actual (KM)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={odometerKm}
                    onChange={(e) => setOdometerKm(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface text-on-surface border border-outline-variant font-mono text-base font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                    placeholder="48215"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-label-data text-xs text-on-surface-variant font-bold">
                    KILÓMETROS
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-1">
                  Verifica el odómetro en el tablero antes de encender el motor.
                </p>
              </div>

              {/* Photo Display & Change Trigger */}
              <div className="flex items-center gap-3 p-2 bg-surface-container-low rounded-xl border border-outline-variant/50">
                <img
                  src={odometerPhoto}
                  alt="Foto Tacógrafo / Odómetro"
                  className="w-16 h-16 object-cover rounded-lg border border-outline-variant/60 shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-headline-sm text-xs font-bold text-primary">
                    Foto Odómetro Registrada ✓
                  </p>
                  <p className="font-body-sm text-[11px] text-on-surface-variant truncate">
                    Bahía Villanueva • {currentTime}
                  </p>
                  <label className="mt-1 text-xs font-headline-sm text-secondary hover:underline inline-flex items-center gap-1 font-bold cursor-pointer">
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    <span>Cambiar foto odómetro</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* 6. Declaración Juramentada y Firma */}
          <section className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 border border-outline-variant/60 shadow-xs space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                checked={swornDeclaration}
                onChange={(e) => setSwornDeclaration(e.target.checked)}
                className="mt-0.5 h-5 w-5 rounded text-primary focus:ring-secondary border-outline cursor-pointer shrink-0"
                type="checkbox"
              />
              <span className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                Declaro bajo la gravedad de juramento que la información diligenciada corresponde con
                la realidad técnica, mecánica y física del vehículo{' '}
                <strong className="text-on-surface">
                  {vehicleUnit} (Placa {vehiclePlate})
                </strong>{' '}
                y con mi estado psicofísico conforme a las directrices de seguridad vial de
                COOTRANSVIG para la fecha <strong className="text-on-surface">{currentDate}</strong>.
              </span>
            </label>

            {/* Submission Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="submit"
                id="btn-submit-preoperacional"
                className="flex-1 flex items-center justify-between py-3.5 px-5 rounded-xl bg-primary text-on-primary font-headline-sm text-sm font-bold shadow-md hover:bg-primary-container active:scale-[0.99] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-xl text-secondary-fixed">
                    verified
                  </span>
                  <span>Finalizar y Transmitir Planilla Diaria</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold bg-white/10 px-3 py-1 rounded-lg">
                  <span>{compliantCount}/{totalQuestions}</span>
                  <span className="material-symbols-outlined text-sm">send</span>
                </div>
              </button>

              <button
                type="button"
                onClick={onBack}
                className="px-5 py-3.5 rounded-xl bg-surface-container text-on-surface-variant font-headline-sm text-xs font-semibold hover:bg-surface-container-high transition-colors text-center border border-outline-variant/40 cursor-pointer"
              >
                Cancelar y Volver
              </button>
            </div>
          </section>
        </form>
      </main>

      {/* Success Modal confirming immediate transmission to Admin with option to download PDF */}
      {showSuccessModal && submittedRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-7 max-w-md w-full border border-secondary/30 shadow-2xl text-center animate-fade-in space-y-4">
            <div className="w-16 h-16 rounded-full bg-secondary-container text-secondary flex items-center justify-center mx-auto shadow-md">
              <span className="material-symbols-outlined text-4xl icon-fill">verified</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-container font-label-badge text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse-dot"></span>
              Transmitido en Tiempo Real a Centro de Control
            </div>

            <div>
              <h3 className="font-headline-sm text-lg sm:text-xl font-bold text-primary">
                ¡Planilla Diaria Registrada!
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant mt-1.5">
                Folio oficial:{' '}
                <strong className="font-label-data text-on-surface">{submittedRecord.id}</strong>
                <br />
                Registrada a las <strong>{submittedRecord.timeLabel}</strong> • Recibida por el Director de Operaciones (Julio Pérez).
              </p>
            </div>

            <div className="p-3.5 bg-surface-container-low rounded-xl text-left text-xs space-y-2 border border-outline-variant/60">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Conductor:</span>
                <span className="font-bold text-on-surface">{driverName} ({driverId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Vehículo:</span>
                <span className="font-bold text-on-surface">{vehicleUnit} ({vehiclePlate})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Ítems Validados:</span>
                <span className="font-bold text-secondary">{compliantCount} de {totalQuestions} Conformes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Estado Resultante:</span>
                <span
                  className={`font-bold ${
                    compliantCount === totalQuestions ? 'text-secondary' : 'text-error'
                  }`}
                >
                  {compliantCount === totalQuestions ? 'Apto para Despacho ✓' : 'Bloqueo Preventivo PESV'}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {/* PDF report download CTA */}
              <button
                onClick={() => setViewingPdfRecord(submittedRecord)}
                className="w-full py-3 rounded-xl bg-secondary hover:bg-secondary/90 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                <span>Descargar / Imprimir Reporte PDF Oficial</span>
              </button>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onBack();
                }}
                className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-xs cursor-pointer hover:bg-primary-container"
              >
                Volver al Panel Conductor
              </button>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setActivePortal('admin');
                }}
                className="w-full py-2 rounded-xl bg-surface-container text-on-surface-variant font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                <span>Ver en Portal de Administración (Julio Pérez)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official PDF Report Viewer Modal */}
      {viewingPdfRecord && (
        <InspectionReportPdfModal
          inspection={viewingPdfRecord}
          vehicle={vehicles.find((v) => v.plate === viewingPdfRecord.plate)}
          driver={drivers.find((d) => d.id === viewingPdfRecord.driverId)}
          onClose={() => setViewingPdfRecord(null)}
        />
      )}

      {/* Regulations help modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 max-w-md w-full border border-outline-variant shadow-xl">
            <h3 className="font-headline-sm text-sm font-bold text-primary">
              Normativa Preoperacional MinTransporte
            </h3>
            <p className="font-body-sm text-xs text-on-surface-variant mt-2 leading-relaxed">
              Conforme a la Resolución 20223040040695 (PESV), todo conductor de servicio público
              intermunicipal en COOTRANSVIG debe registrar y firmar digitalmente su verificación
              técnica de 36 puntos de control una vez al día antes de iniciar el recorrido.
            </p>
            <div className="mt-3 p-3 bg-surface-container-low rounded-xl text-xs space-y-1.5 text-on-surface">
              <p>• <strong>Módulo 1:</strong> Documentos y seguros de tránsito vigentes.</p>
              <p>• <strong>Módulo 2:</strong> Salud y descanso óptimo del conductor.</p>
              <p>• <strong>Módulo 3:</strong> Kit de carretera y sistemas de emergencia.</p>
              <p>• <strong>Módulo 4:</strong> Visibilidad, vidrios, retrovisores y luces.</p>
              <p>• <strong>Módulo 5:</strong> Mecánica, fluidos, frenos y neumáticos.</p>
              <p>• <strong>Módulo 6:</strong> Higiene y limpieza interna/externa.</p>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs cursor-pointer hover:bg-primary-container"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
