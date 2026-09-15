import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { InspectionStatus } from '../types';
import {
  INSPECTION_QUESTIONS,
  MODULE_GROUPS,
  InspectionQuestionItem,
} from '../data/inspectionQuestions';

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
  } = useApp();

  // Active module filter (0 = all modules)
  const [selectedModuleId, setSelectedModuleId] = useState<number>(0);

  const [odometerKm, setOdometerKm] = useState<number>(48215);
  const [odometerPhoto, setOdometerPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=400&q=80'
  );
  const [swornDeclaration, setSwornDeclaration] = useState<boolean>(true);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [submittedRecordId, setSubmittedRecordId] = useState<string>('');
  const [failureNote, setFailureNote] = useState<string>('');

  // Initialize checklist values: starts in false (0% de cero) as requested
  const [checklistValues, setChecklistValues] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    INSPECTION_QUESTIONS.forEach((q) => {
      initial[q.id] = false;
    });
    return initial;
  });

  // Calculate compliance stats across all 36 items
  const totalQuestions = INSPECTION_QUESTIONS.length; // 36
  const compliantCount = useMemo(() => {
    return Object.values(checklistValues).filter(Boolean).length;
  }, [checklistValues]);

  const progressPercent = Math.round((compliantCount / totalQuestions) * 100);

  // Group stats by module
  const moduleCompliance = useMemo(() => {
    const map: Record<number, { compliant: number; total: number }> = {};
    MODULE_GROUPS.forEach((m) => {
      const moduleQuestions = INSPECTION_QUESTIONS.filter((q) => q.moduleId === m.id);
      const passed = moduleQuestions.filter((q) => checklistValues[q.id]).length;
      map[m.id] = { compliant: passed, total: moduleQuestions.length };
    });
    return map;
  }, [checklistValues]);

  // Express check: Mark all 36 items compliant in one tap
  const handleExpressCheckAll = () => {
    const allCompliant: Record<string, boolean> = {};
    INSPECTION_QUESTIONS.forEach((q) => {
      allCompliant[q.id] = true;
    });
    setChecklistValues(allCompliant);
  };

  // Reset all to false (start from scratch)
  const handleResetChecklist = () => {
    const reset: Record<string, boolean> = {};
    INSPECTION_QUESTIONS.forEach((q) => {
      reset[q.id] = false;
    });
    setChecklistValues(reset);
    setFailureNote('');
  };

  // Mark all items in a specific module as compliant
  const handleApproveModule = (modId: number) => {
    setChecklistValues((prev) => {
      const next = { ...prev };
      INSPECTION_QUESTIONS.filter((q) => q.moduleId === modId).forEach((q) => {
        next[q.id] = true;
      });
      return next;
    });
  };

  // Toggle single item
  const handleSetItemValue = (question: InspectionQuestionItem, isCompliant: boolean) => {
    setChecklistValues((prev) => ({
      ...prev,
      [question.id]: isCompliant,
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

  // Handle Form Submission
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
      turnLabel: 'Turno 08:24 AM',
      failureReason: autoFailureReason,
      dispatchAuthorized: allPassed,
      dispatchTime: allPassed ? '08:25 AM' : undefined,
      fuecNumber: allPassed
        ? `FUEC-4409-COOTRANSVIG-2025-${Date.now().toString().slice(-5)}`
        : undefined,
    });

    setSubmittedRecordId(newRecord.id);
    setShowSuccessModal(true);
  };

  // Modules to render based on active tab
  const modulesToRender = useMemo(() => {
    if (selectedModuleId === 0) {
      return MODULE_GROUPS;
    }
    return MODULE_GROUPS.filter((m) => m.id === selectedModuleId);
  }, [selectedModuleId]);

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md antialiased pb-28">
      {/* Top sticky app header */}
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
              <span className="font-label-badge text-xs text-secondary truncate">
                COOTRANSVIG • {vehicleUnit} (Placa {vehiclePlate})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
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
        {/* 1. Driver & Corridor Info Card */}
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
              </div>
              <p className="font-body-sm text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-xs text-primary">near_me</span>
                Ruta: Villanueva ⇄ San Juan del Cesar ⇄ Valledupar
              </p>
            </div>
          </div>

          <div className="flex items-center sm:flex-col sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-outline-variant/40">
            <span className="font-label-badge text-xs px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold">
              DESPACHO MATUTINO
            </span>
            <span className="font-label-time text-xs text-on-surface-variant mt-0.5">
              Protocolo PESV - Res. 20223040045115
            </span>
          </div>
        </section>

        {/* 2. Global Progress & Quick Action Banner */}
        <section className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 border border-outline-variant/60 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-on-primary shrink-0">
                <span className="material-symbols-outlined text-lg icon-fill">checklist</span>
              </div>
              <div>
                <p className="font-headline-sm text-sm font-bold text-on-surface">
                  {compliantCount} de {totalQuestions} Preguntas Verificadas
                </p>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  {compliantCount === totalQuestions
                    ? '¡Checklist 100% conforme! Vehículo apto para despacho'
                    : `Faltan ${totalQuestions - compliantCount} preguntas por verificar o conformar`}
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

          {/* Quick Actions Row */}
          <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <button
              onClick={handleExpressCheckAll}
              type="button"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-secondary-container hover:bg-secondary-fixed text-on-secondary-container font-headline-sm text-xs font-bold transition-all border border-secondary/30 active:scale-[0.99] cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-secondary text-lg icon-fill">bolt</span>
              <span>Marcar Todo Conforme (Chequeo Express 36/36)</span>
              <span className="material-symbols-outlined text-secondary text-base">done_all</span>
            </button>
          </div>
        </section>

        {/* 3. Module Selector Tabs (Horizontal Scroll on Mobile, Full Row on Desktop) */}
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
            <span>Todos los Módulos ({totalQuestions})</span>
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
                    ? 'bg-primary text-on-primary'
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

        {/* 4. Form Checklist Sections */}
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

                    <button
                      type="button"
                      onClick={() => handleApproveModule(module.id)}
                      title="Aprobar todos los ítems de este módulo"
                      className="text-[11px] font-bold text-secondary hover:text-secondary-fixed hover:bg-secondary-container/40 px-2 py-1 rounded-lg border border-secondary/20 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">done_all</span>
                      <span className="hidden sm:inline">Aprobar Módulo</span>
                    </button>
                  </div>
                </div>

                {/* Subgroups & Question Items */}
                <div className="space-y-4">
                  {module.subgroups.map((subgroup, sIdx) => (
                    <div key={sIdx} className="space-y-2">
                      {subgroup.name && (
                        <h3 className="text-xs font-bold uppercase tracking-wider text-primary px-1 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                          <span>{subgroup.name}</span>
                        </h3>
                      )}

                      <div className="grid grid-cols-1 gap-2">
                        {subgroup.items.map((q) => {
                          const isCompliant = checklistValues[q.id] === true;

                          // For inverted compliance (Alcohol/Drugs question):
                          // Answering "No" means Safe/Apto (compliant = true)
                          // Answering "Sí" means Risk/Alert (compliant = false)
                          return (
                            <div
                              key={q.id}
                              className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                isCompliant
                                  ? 'bg-surface-container-low/60 border-secondary/30'
                                  : 'bg-surface-container-lowest border-outline-variant/50 hover:border-outline'
                              }`}
                            >
                              <div className="flex items-start gap-3 min-w-0">
                                <div
                                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                                    isCompliant
                                      ? 'bg-secondary-container text-secondary'
                                      : 'bg-surface-container text-on-surface-variant'
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    {q.icon}
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <p className="font-headline-sm text-xs sm:text-sm font-semibold text-on-surface leading-snug">
                                    {q.question}
                                  </p>
                                  {q.critical && (
                                    <span className="inline-block mt-0.5 text-[10px] font-bold text-error">
                                      * Requisito Crítico PESV
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Interactive Sí / No Toggle Buttons */}
                              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                                {q.invertCompliance ? (
                                  /* Inverted Question: "No" is compliant, "Sí" is risk */
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleSetItemValue(q, true)}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                                        isCompliant
                                          ? 'bg-secondary text-white shadow-xs'
                                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                                      }`}
                                    >
                                      <span className="material-symbols-outlined text-[16px]">check</span>
                                      <span>{q.noLabel || 'No (Sin consumo)'}</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleSetItemValue(q, false)}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                                        !isCompliant
                                          ? 'bg-error text-white font-bold shadow-xs'
                                          : 'bg-surface-container text-on-surface-variant hover:bg-error-container hover:text-error'
                                      }`}
                                    >
                                      <span className="material-symbols-outlined text-[16px]">warning</span>
                                      <span>{q.yesLabel || 'Sí (Consumo)'}</span>
                                    </button>
                                  </>
                                ) : (
                                  /* Standard Checklist Question: "Sí" is compliant, "No" is non-compliant */
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleSetItemValue(q, true)}
                                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                                        isCompliant
                                          ? 'bg-secondary text-white shadow-xs'
                                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                                      }`}
                                    >
                                      <span className="material-symbols-outlined text-[16px]">check</span>
                                      <span>{q.yesLabel || 'Sí'}</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleSetItemValue(q, false)}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                                        !isCompliant
                                          ? 'bg-error-container text-on-error-container font-bold border border-error/30'
                                          : 'bg-surface-container text-on-surface-variant hover:bg-error-container hover:text-error'
                                      }`}
                                    >
                                      <span className="material-symbols-outlined text-[16px]">close</span>
                                      <span>{q.noLabel || 'No'}</span>
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
                className="w-full p-3 bg-surface-container-lowest rounded-xl border border-error/40 text-on-surface text-xs outline-none focus:ring-2 focus:ring-error"
                rows={2}
                placeholder="Observaciones adicionales sobre fallas o novedades observadas..."
                value={failureNote}
                onChange={(e) => setFailureNote(e.target.value)}
              />
            </section>
          )}

          {/* 5. Odómetro y Registro Fotográfico */}
          <section className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 border border-outline-variant/60 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-on-primary">
                  <span className="material-symbols-outlined text-lg">add_a_photo</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                    Evidencia Odómetro y Tablero
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant">
                    Registro de kilometraje al inicio del turno
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-primary px-3 py-1.5 rounded-xl bg-surface-container border border-outline-variant/50">
                <input
                  type="number"
                  value={odometerKm}
                  onChange={(e) => setOdometerKm(Number(e.target.value))}
                  className="w-20 bg-transparent text-right outline-none font-bold"
                />
                <span>KM</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/40">
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-container">
                <img
                  className="h-full w-full object-cover"
                  alt="Odómetro vehículo"
                  src={odometerPhoto}
                />
                <span className="absolute bottom-1 right-1 rounded-full bg-secondary p-0.5 text-white shadow-2xs">
                  <span className="material-symbols-outlined text-[12px] block">check</span>
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-headline-sm text-xs font-bold text-primary">
                  Foto Odómetro Registrada ✓
                </p>
                <p className="font-body-sm text-[11px] text-on-surface-variant truncate">
                  Kilometraje verificado en Bahía Villanueva
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
                COOTRANSVIG.
              </span>
            </label>

            {/* Submission Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 flex items-center justify-between py-3.5 px-5 rounded-xl bg-primary text-on-primary font-headline-sm text-sm font-bold shadow-md hover:bg-primary-container active:scale-[0.99] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-xl text-secondary-fixed">
                    verified
                  </span>
                  <span>Finalizar y Transmitir Planilla</span>
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

      {/* Success Modal confirming immediate transmission to Admin */}
      {showSuccessModal && (
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
                ¡Planilla Preoperacional Registrada!
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant mt-1.5">
                Folio oficial:{' '}
                <strong className="font-label-data text-on-surface">{submittedRecordId}</strong>
                <br />
                La información fue <strong>recibida inmediatamente por el Director de Operaciones (Julio Pérez)</strong>.
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
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onBack();
                }}
                className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md cursor-pointer hover:bg-primary-container"
              >
                Volver al Turno Operativo
              </button>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setActivePortal('admin');
                }}
                className="w-full py-2.5 rounded-xl bg-secondary-container text-on-secondary-container font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-secondary-fixed"
              >
                <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                <span>Ver en Portal de Administración (Julio Pérez)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regulations help modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 max-w-md w-full border border-outline-variant shadow-xl">
            <h3 className="font-headline-sm text-sm font-bold text-primary">
              Normativa Preoperacional MinTransporte
            </h3>
            <p className="font-body-sm text-xs text-on-surface-variant mt-2 leading-relaxed">
              Conforme a la Resolución 20223040045115 (PESV), todo conductor de servicio público
              intermunicipal en COOTRANSVIG debe registrar y firmar digitalmente su verificación
              técnica de 36 puntos de control antes de iniciar el recorrido.
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
