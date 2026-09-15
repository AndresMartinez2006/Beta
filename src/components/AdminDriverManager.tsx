import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Driver } from '../types';

export const AdminDriverManager: React.FC = () => {
  const { drivers, addDriver, updateDriver, deleteDriver, vehicles } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [dni, setDni] = useState('');
  const [licenseCategory, setLicenseCategory] = useState<'C1' | 'C2' | 'C3'>('C1');
  const [licenseExpiry, setLicenseExpiry] = useState('2028-09-15');
  const [phone, setPhone] = useState('+57 301 458 9210');
  const [assignedVehicleId, setAssignedVehicleId] = useState('');
  const [status, setStatus] = useState<'activo' | 'suspendido' | 'vacaciones'>('activo');
  const [searchFilter, setSearchFilter] = useState('');

  const openNewDriverModal = () => {
    setEditingId(null);
    setFullName('');
    setDni('');
    setLicenseCategory('C1');
    setLicenseExpiry('2028-12-31');
    setPhone('+57 300 ');
    setAssignedVehicleId(vehicles[0]?.id || '');
    setStatus('activo');
    setShowModal(true);
  };

  const openEditModal = (driver: Driver) => {
    setEditingId(driver.id);
    setFullName(driver.fullName);
    setDni(driver.dni);
    setLicenseCategory(driver.licenseCategory);
    setLicenseExpiry(driver.licenseExpiry);
    setPhone(driver.phone);
    const matchedVeh = vehicles.find((v) => v.plate === driver.assignedVehiclePlate);
    setAssignedVehicleId(matchedVeh?.id || '');
    setStatus(driver.status);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selVeh = vehicles.find((v) => v.id === assignedVehicleId);
    const initials = fullName
      .split(' ')
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'OP';

    if (editingId) {
      updateDriver(editingId, {
        fullName,
        dni,
        licenseCategory,
        licenseExpiry,
        phone,
        assignedVehicleUnit: selVeh?.unitNumber,
        assignedVehiclePlate: selVeh?.plate,
        status,
        photoInitials: initials,
      });
    } else {
      const newId = `OP-${Math.floor(1000 + Math.random() * 9000)}`;
      addDriver({
        id: newId,
        fullName,
        dni,
        licenseCategory,
        licenseExpiry,
        phone,
        assignedVehicleUnit: selVeh?.unitNumber,
        assignedVehiclePlate: selVeh?.plate,
        status,
        photoInitials: initials,
      });
    }
    setShowModal(false);
  };

  const filteredDrivers = drivers.filter((d) => {
    const q = searchFilter.toLowerCase();
    return (
      d.fullName.toLowerCase().includes(q) ||
      d.dni.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q) ||
      (d.assignedVehiclePlate && d.assignedVehiclePlate.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-6 border border-outline-variant/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">badge</span>
            <h2 className="font-headline-sm text-lg font-bold text-on-surface">
              Registro de Conductores Cootransvig
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-badge text-xs font-bold">
              {drivers.length} Operadores
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Gestión de cédulas, categorías de pase, vigencias y asignación a vehículos.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar conductor o cédula..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant text-xs focus:ring-2 focus:ring-secondary/20 outline-none"
            />
          </div>
          <button
            onClick={openNewDriverModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-headline-sm text-xs font-bold hover:bg-primary-container active:scale-95 transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Vincular Conductor</span>
          </button>
        </div>
      </div>

      {/* Drivers List / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrivers.map((driver) => (
          <div
            key={driver.id}
            className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/50 shadow-sm hover:border-secondary/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-xl bg-primary-container text-on-primary font-bold text-sm flex items-center justify-center shadow-xs">
                    {driver.photoInitials}
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-sm font-bold text-on-surface">{driver.fullName}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary font-bold text-[11px]">
                        ID {driver.id}
                      </span>
                      <span className="text-[11px] text-on-surface-variant font-mono">CC {driver.dni}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    driver.status === 'activo'
                      ? 'bg-secondary-fixed text-on-secondary-container'
                      : driver.status === 'vacaciones'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {driver.status}
                </span>
              </div>

              {/* Details */}
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low/60">
                  <span className="text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-secondary">directions_car</span>
                    Móvil Asignado:
                  </span>
                  <strong className="text-on-surface font-semibold">
                    {driver.assignedVehicleUnit ? `${driver.assignedVehicleUnit} (${driver.assignedVehiclePlate})` : 'Sin asignar'}
                  </strong>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="p-2 rounded-lg bg-surface-container-low/40">
                    <span className="text-on-surface-variant block">Categoría Licencia</span>
                    <span className="font-bold text-primary">Pase {driver.licenseCategory}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-container-low/40">
                    <span className="text-on-surface-variant block">Vigencia Pase</span>
                    <span className="font-semibold text-secondary">{driver.licenseExpiry}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-container-low/40 col-span-2">
                    <span className="text-on-surface-variant block">Contacto Celular</span>
                    <span className="font-semibold text-on-surface">{driver.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
              <span className="text-[11px] text-secondary font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">verified_user</span>
                RUNT Verificado
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(driver)}
                  title="Editar conductor"
                  className="p-1.5 text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`¿Desvincular a ${driver.fullName} (${driver.id})?`)) {
                      deleteDriver(driver.id);
                    }
                  }}
                  title="Desvincular conductor"
                  className="p-1.5 text-on-surface-variant hover:text-error rounded-lg hover:bg-error-container/40 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDrivers.length === 0 && (
        <div className="text-center py-12 bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-6">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">person_off</span>
          <p className="font-headline-sm text-sm font-bold text-on-surface">No se encontraron conductores</p>
          <p className="text-xs text-on-surface-variant mt-1">
            Usa el botón "Vincular Conductor" para registrar el primero en la empresa.
          </p>
        </div>
      )}

      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-lg w-full border border-outline-variant shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                </div>
                <h3 className="font-headline-sm text-base font-bold text-on-surface">
                  {editingId ? 'Editar Conductor' : 'Vincular Nuevo Conductor'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Nombre Completo del Conductor</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Andrés Martínez"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant text-xs outline-none focus:ring-2 focus:ring-secondary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Cédula de Ciudadanía</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 1.065.892.411"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant text-xs outline-none focus:ring-2 focus:ring-secondary/20 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Teléfono Móvil</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. +57 301 458 9210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant text-xs outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Categoría Licencia</label>
                  <select
                    value={licenseCategory}
                    onChange={(e) => setLicenseCategory(e.target.value as 'C1' | 'C2' | 'C3')}
                    className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant text-xs outline-none focus:ring-2 focus:ring-secondary/20 font-medium"
                  >
                    <option value="C1">C1 (Automóviles, camperos, camionetas públicas)</option>
                    <option value="C2">C2 (Camiones rígidos, busetas y buses públicos)</option>
                    <option value="C3">C3 (Vehículos articulados)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Vigencia Pase</label>
                  <input
                    type="date"
                    required
                    value={licenseExpiry}
                    onChange={(e) => setLicenseExpiry(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant text-xs outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Asignar a Vehículo de Flota</label>
                <select
                  value={assignedVehicleId}
                  onChange={(e) => setAssignedVehicleId(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant text-xs outline-none focus:ring-2 focus:ring-secondary/20 font-medium"
                >
                  <option value="">-- Sin vehículo asignado actualmente --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.unitNumber} ({v.plate}) - {v.model} [Base {v.baseLocation}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Estado Operativo</label>
                <div className="flex gap-2">
                  {(['activo', 'suspendido', 'vacaciones'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatus(st)}
                      className={`flex-1 py-2 text-xs rounded-xl border font-bold capitalize transition-all ${
                        status === st
                          ? 'bg-primary text-on-primary border-primary shadow-xs'
                          : 'bg-surface-container-low text-on-surface-variant border-outline-variant hover:bg-surface-container'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-outline-variant/40 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-on-surface-variant hover:bg-surface-container font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs bg-primary text-on-primary hover:bg-primary-container font-bold shadow-sm"
                >
                  {editingId ? 'Guardar Cambios' : 'Vincular a Cootransvig'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
