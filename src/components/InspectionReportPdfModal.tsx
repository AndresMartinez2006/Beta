import React, { useRef } from 'react';
import { InspectionRecord, Vehicle, Driver } from '../types';
import { INSPECTION_QUESTIONS, MODULE_GROUPS } from '../data/inspectionQuestions';
import { CootransvigLogo } from './CootransvigLogo';

interface InspectionReportPdfModalProps {
  inspection: InspectionRecord;
  vehicle?: Vehicle;
  driver?: Driver;
  onClose: () => void;
}

export const InspectionReportPdfModal: React.FC<InspectionReportPdfModalProps> = ({
  inspection,
  vehicle,
  driver,
  onClose,
}) => {
  const printContainerRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const isApto = inspection.status === 'apto';
  const realDate = inspection.dateLabel || new Date(inspection.timestamp).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div
      id="pdf-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static"
      role="dialog"
      aria-modal="true"
    >
      {/* Top Floating Action Bar (Hidden on Print) */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-60 bg-surface-container-highest/95 backdrop-blur-md border border-outline-variant/80 text-on-surface px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 print:hidden max-w-[95vw]">
        <div className="flex items-center gap-2 pr-2 border-r border-outline-variant">
          <span className="material-symbols-outlined text-secondary text-xl">picture_as_pdf</span>
          <span className="text-xs font-bold text-on-surface hidden sm:inline">
            Reporte Oficial PESV COOTRANSVIG
          </span>
        </div>

        <button
          onClick={handlePrint}
          id="btn-print-download-pdf"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-secondary hover:bg-secondary/90 text-white text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-base">print</span>
          <span>Descargar / Imprimir PDF</span>
        </button>

        <button
          onClick={onClose}
          id="btn-close-pdf-modal"
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-xs font-bold cursor-pointer transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-base">close</span>
          <span>Cerrar</span>
        </button>
      </div>

      {/* Main Document Page Container */}
      <div
        ref={printContainerRef}
        className="w-full max-w-4xl bg-white text-gray-900 rounded-xl shadow-2xl my-16 sm:my-14 p-6 sm:p-10 border border-gray-300 font-sans print:my-0 print:p-0 print:shadow-none print:border-none print:w-full print:max-w-none text-xs leading-relaxed"
      >
        {/* DOCUMENT HEADER */}
        <header className="border-2 border-emerald-900 rounded-lg p-3 sm:p-4 mb-4 bg-emerald-50/40">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <CootransvigLogo className="h-16 sm:h-20 w-auto" />
            </div>

            {/* Institution Title */}
            <div className="text-center flex-1 px-2">
              <h1 className="text-sm sm:text-base font-black text-emerald-950 uppercase tracking-tight">
                Cooperativa de Transportadores de Villanueva La Guajira
              </h1>
              <p className="text-[11px] font-bold text-emerald-800 tracking-wider">
                COOTRANSVIG • NIT: 892.115.420-1
              </p>
              <p className="text-[9px] text-gray-600 uppercase mt-0.5">
                Vigilado Superintendencia de Transporte • Habilitación MinTransporte Res. 0342
              </p>
              <div className="mt-1 inline-block bg-emerald-800 text-white font-black px-2 py-0.5 rounded text-[10px] tracking-wide">
                PLAN ESTRATÉGICO DE SEGURIDAD VIAL (PESV) — RES. 20223040040695 / DEC. 1079
              </div>
            </div>

            {/* Document Control Box */}
            <div className="border border-emerald-900/40 rounded bg-white p-2 text-[9px] w-full sm:w-44 text-gray-700 shrink-0">
              <div className="grid grid-cols-2 gap-1 border-b border-gray-200 pb-1 mb-1 font-semibold">
                <span>FORMATO:</span>
                <span className="text-right font-mono text-emerald-900">FO-PESV-01</span>
              </div>
              <div className="grid grid-cols-2 gap-1 border-b border-gray-200 pb-1 mb-1">
                <span>VERSIÓN:</span>
                <span className="text-right font-mono font-bold">04</span>
              </div>
              <div className="grid grid-cols-2 gap-1 border-b border-gray-200 pb-1 mb-1">
                <span>FOLIO No:</span>
                <span className="text-right font-mono font-black text-emerald-800">
                  {inspection.id}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1 font-semibold">
                <span>FECHA EMIS:</span>
                <span className="text-right font-mono">{realDate}</span>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-emerald-800/30 text-center font-black text-xs sm:text-sm text-emerald-900 tracking-wide">
            CONSTANCIA OFICIAL DE INSPECCIÓN TÉCNICO-MECÁNICA Y OPERACIONAL PREOPERACIONAL DIARIA
          </div>
        </header>

        {/* 1. GENERAL AUDIT METADATA */}
        <section className="mb-4">
          <div className="bg-emerald-900 text-white px-3 py-1 font-bold text-[11px] rounded-t flex items-center justify-between">
            <span>1. INFORMACIÓN GENERAL DE LA JORNADA Y DESPACHO</span>
            <span className="font-mono text-[10px]">
              HORA REAL: {inspection.timeLabel} • {realDate}
            </span>
          </div>
          <div className="border border-t-0 border-gray-300 rounded-b p-3 bg-gray-50/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px]">
            <div>
              <span className="text-gray-500 font-medium block">Fecha de Registro:</span>
              <strong className="text-gray-900 text-[11px]">{realDate}</strong>
            </div>
            <div>
              <span className="text-gray-500 font-medium block">Hora de Inspección:</span>
              <strong className="text-gray-900 text-[11px]">{inspection.timeLabel}</strong>
            </div>
            <div>
              <span className="text-gray-500 font-medium block">Ruta Reglamentaria:</span>
              <strong className="text-gray-900 text-[11px]">Villanueva ➔ Valledupar (Ruta 80)</strong>
            </div>
            <div>
              <span className="text-gray-500 font-medium block">Dictamen de Despacho:</span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-black text-[10px] ${
                  isApto
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-red-100 text-red-900 border border-red-300'
                }`}
              >
                {isApto ? '✓ APTO PARA RUTA' : '✕ VEHÍCULO BLOQUEADO'}
              </span>
            </div>

            <div>
              <span className="text-gray-500 font-medium block">Base de Origen:</span>
              <strong className="text-gray-900">Villanueva (La Guajira)</strong>
            </div>
            <div>
              <span className="text-gray-500 font-medium block">No. de FUEC Autorizado:</span>
              <strong className="text-emerald-900 font-mono font-bold">
                {inspection.fuecNumber || (isApto ? `FUEC-4409-COOTRANSVIG-${new Date().getFullYear()}-${inspection.id.replace('INS-', '')}` : 'NO AUTORIZADO')}
              </strong>
            </div>
            <div>
              <span className="text-gray-500 font-medium block">Hora Despacho Efectiva:</span>
              <strong className="text-gray-900 font-mono">
                {inspection.dispatchTime || (inspection.dispatchAuthorized ? inspection.timeLabel : 'Pendiente')}
              </strong>
            </div>
            <div>
              <span className="text-gray-500 font-medium block">Calificación de Conformidad:</span>
              <strong className="text-gray-900 font-mono text-[11px]">
                {inspection.checklistCount} ({inspection.checklistProgress}%)
              </strong>
            </div>
          </div>
        </section>

        {/* 2. DRIVER & VEHICLE DETAILS */}
        <section className="mb-4">
          <div className="bg-emerald-900 text-white px-3 py-1 font-bold text-[11px] rounded-t flex items-center justify-between">
            <span>2. IDENTIFICACIÓN DEL CONDUCTOR Y PARQUE AUTOMOTOR</span>
            <span className="text-[10px] opacity-90">Pesv Art. 12 Ley 769</span>
          </div>
          <div className="border border-t-0 border-gray-300 rounded-b p-3 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px]">
            {/* Conductor Box */}
            <div className="border border-gray-200 rounded p-2.5 bg-gray-50/50 space-y-1">
              <h3 className="font-bold text-emerald-900 uppercase text-[10px] pb-1 border-b border-gray-200 flex items-center justify-between">
                <span>CONDUCTOR ASIGNADO</span>
                <span className="font-mono text-gray-500">{inspection.driverId}</span>
              </h3>
              <p>
                <span className="text-gray-500">Nombre Completo:</span>{' '}
                <strong className="text-gray-900 text-[11px]">{inspection.driverName}</strong>
              </p>
              <p>
                <span className="text-gray-500">Documento C.C.:</span>{' '}
                <strong className="font-mono">{driver?.dni || '77.189.432 de Villanueva'}</strong>
              </p>
              <p>
                <span className="text-gray-500">Categoría Licencia:</span>{' '}
                <strong className="font-mono text-emerald-900">
                  {driver?.licenseCategory || 'C2 - Servicio Público'}
                </strong>{' '}
                (Vence: {driver?.licenseExpiry || '28/05/2028'})
              </p>
              <p>
                <span className="text-gray-500">Teléfono Contacto:</span>{' '}
                <strong className="font-mono">{inspection.driverPhone || '312-456-7890'}</strong>
              </p>
            </div>

            {/* Vehicle Box */}
            <div className="border border-gray-200 rounded p-2.5 bg-gray-50/50 space-y-1">
              <h3 className="font-bold text-emerald-900 uppercase text-[10px] pb-1 border-b border-gray-200 flex items-center justify-between">
                <span>VEHÍCULO VINCULADO</span>
                <span className="font-mono text-gray-500">{inspection.unitNumber}</span>
              </h3>
              <p>
                <span className="text-gray-500">Placa Oficial:</span>{' '}
                <strong className="font-mono text-emerald-900 text-[11px] bg-yellow-100 px-1.5 py-0.5 rounded border border-yellow-300">
                  {inspection.plate}
                </strong>
              </p>
              <p>
                <span className="text-gray-500">Línea / Modelo:</span>{' '}
                <strong>{inspection.vehicleModel} ({vehicle?.year || '2022'})</strong>
              </p>
              <p>
                <span className="text-gray-500">Capacidad Pasajeros:</span>{' '}
                <strong>{vehicle?.capacity || 4} Pasajeros sentados</strong>
              </p>
              <p>
                <span className="text-gray-500">Odómetro Inicial:</span>{' '}
                <strong className="font-mono text-[11px] text-emerald-950">
                  {inspection.odometerKm.toLocaleString('es-CO')} Kilómetros
                </strong>
              </p>
              <p>
                <span className="text-gray-500">Vigencia SOAT / RTM:</span>{' '}
                <span className="text-emerald-800 font-semibold">
                  SOAT: {vehicle?.soatExpiry || '14/11/2026'} | RTM: {vehicle?.techExpiry || '20/10/2026'}
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* 3. TECHNICAL CHECKLIST TABLE (36 QUESTIONS ACROSS 6 MODULES) */}
        <section className="mb-4">
          <div className="bg-emerald-900 text-white px-3 py-1 font-bold text-[11px] rounded-t flex items-center justify-between">
            <span>3. RESULTADOS DE LA EVALUACIÓN PREOPERACIONAL (RESOLUCIÓN 20223040040695)</span>
            <span className="text-[10px] font-mono">36 ÍTEMS REGLAMENTARIOS</span>
          </div>

          <div className="border border-t-0 border-gray-300 rounded-b overflow-hidden">
            <table className="w-full text-left border-collapse text-[9px] sm:text-[10px]">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300 text-gray-700">
                  <th className="py-1.5 px-2 w-8 text-center font-bold">#</th>
                  <th className="py-1.5 px-2 font-bold">ÍTEM REGLAMENTARIO DE INSPECCIÓN</th>
                  <th className="py-1.5 px-2 w-28 text-center font-bold">ESTADO</th>
                  <th className="py-1.5 px-2 w-44 font-bold">OBSERVACIÓN TÉCNICA</th>
                </tr>
              </thead>
              <tbody>
                {MODULE_GROUPS.map((module) => (
                  <React.Fragment key={module.id}>
                    {/* Module Title Bar in Table */}
                    <tr className="bg-emerald-100/60 border-y border-emerald-300 text-emerald-950 font-bold">
                      <td colSpan={4} className="py-1 px-2 text-[10px] tracking-wide">
                        {module.title.toUpperCase()} ({module.itemCount} ítems)
                      </td>
                    </tr>

                    {/* Subgroups & Items */}
                    {module.subgroups.map((subgroup) =>
                      subgroup.items.map((q) => {
                        const isCompliant = inspection.checklist[q.id] === true;
                        // Note: For question 8 (alcohol/drugs), "No" means compliant
                        const isAnswered = inspection.checklist[q.id] !== undefined;

                        return (
                          <tr
                            key={q.id}
                            className={`border-b border-gray-200 ${
                              !isCompliant && isAnswered ? 'bg-red-50/80 font-semibold' : 'hover:bg-gray-50'
                            }`}
                          >
                            <td className="py-1 px-2 text-center text-gray-500 font-mono text-[9px]">
                              {q.id}
                            </td>
                            <td className="py-1 px-2 text-gray-800">
                              <span>{q.question}</span>
                              {q.regulation && (
                                <span className="text-[8px] text-gray-500 ml-1.5 font-mono">
                                  [{q.regulation}]
                                </span>
                              )}
                            </td>
                            <td className="py-1 px-2 text-center">
                              {isCompliant ? (
                                <span className="inline-block bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-1.5 py-0.2 rounded text-[8px]">
                                  CONFORME (C)
                                </span>
                              ) : (
                                <span className="inline-block bg-red-100 text-red-900 border border-red-300 font-black px-1.5 py-0.2 rounded text-[8px]">
                                  NO CONFORME (NC)
                                </span>
                              )}
                            </td>
                            <td className="py-1 px-2 text-gray-600 font-mono text-[9px]">
                              {isCompliant
                                ? 'En regla / Verificado'
                                : inspection.failureReason || 'Falla o novedad detectada'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. OBSERVACIONES Y HALLAZGOS TÉCNICOS */}
        <section className="mb-4">
          <div className="bg-gray-800 text-white px-3 py-1 font-bold text-[10px] rounded-t">
            4. OBSERVACIONES, NOVEDADES O HALLAZGOS REGISTRADOS
          </div>
          <div className="border border-t-0 border-gray-300 rounded-b p-2.5 bg-gray-50 text-[10px] min-h-[45px]">
            {inspection.failureReason ? (
              <p className="text-red-800 font-semibold">
                <strong>NOVEDAD REPORTADA:</strong> {inspection.failureReason}
              </p>
            ) : (
              <p className="text-gray-600">
                ✓ Sin novedades mecánicas, eléctricas ni documentales registradas en el turno.
                El vehículo cumple cabalmente con los estándares del Plan Estratégico de Seguridad Vial
                (PESV) de la Cooperativa COOTRANSVIG para la prestación del servicio intermunicipal.
              </p>
            )}
          </div>
        </section>

        {/* 5. LEGAL SIGNATURES & BIOMETRIC CONFIRMATION */}
        <section className="border-t-2 border-emerald-900 pt-3 mt-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            {/* Driver Signature */}
            <div className="border border-gray-300 rounded p-2 bg-white flex flex-col justify-between">
              <div className="h-12 flex items-center justify-center">
                <span className="font-serif italic text-sm text-emerald-900 font-bold border-b border-gray-400 px-4 pb-0.5">
                  {inspection.driverName}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-1 text-[9px] text-gray-700">
                <strong>FIRMA DEL CONDUCTOR</strong>
                <p className="text-gray-500 font-mono">C.C. {driver?.dni || '77.189.432'}</p>
                <p className="text-[8px] text-emerald-800 font-bold">Firma Digital Verificada • {inspection.timeLabel}</p>
              </div>
            </div>

            {/* Inspector / Director Signature */}
            <div className="border border-gray-300 rounded p-2 bg-white flex flex-col justify-between">
              <div className="h-12 flex items-center justify-center">
                <div className="text-center">
                  <span className="font-serif italic text-sm text-emerald-900 font-bold border-b border-gray-400 px-4 pb-0.5">
                    Julio Pérez M.
                  </span>
                  <p className="text-[8px] text-emerald-800 font-bold uppercase mt-0.5">Dirección de Operaciones</p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-1 text-[9px] text-gray-700">
                <strong>RESPONSABLE TÉCNICO / DESPACHADOR</strong>
                <p className="text-gray-500 font-mono">COOTRANSVIG Base Villanueva</p>
                <p className="text-[8px] text-emerald-800 font-bold">Despacho Autorizado</p>
              </div>
            </div>

            {/* Official Stamp & QR Code */}
            <div className="border border-emerald-300 rounded p-2 bg-emerald-50/50 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 border-2 border-emerald-800 rounded bg-white flex items-center justify-center mb-1">
                <span className="material-symbols-outlined text-emerald-900 text-2xl">qr_code_2</span>
              </div>
              <span className="text-[8px] font-black text-emerald-950 uppercase tracking-tight">
                SELLO OFICIAL PESV
              </span>
              <span className="text-[7px] font-mono text-emerald-800">
                VAL-{inspection.id}-{new Date().getFullYear()}
              </span>
              <span className="text-[7px] text-gray-500 mt-0.5">
                Verificación en Línea SuperTransporte
              </span>
            </div>
          </div>

          <p className="text-[8px] text-gray-500 text-center mt-3 leading-normal border-t border-gray-200 pt-1.5">
            Documento de carácter legal y probatorio generado por el Sistema de Control Operativo y Preoperacional de
            <strong> COOTRANSVIG</strong> conforme al Artículo 12 de la Ley 769 de 2002 y la Resolución 20223040040695 de 2022.
            Villanueva, La Guajira - Colombia.
          </p>
        </section>
      </div>
    </div>
  );
};
