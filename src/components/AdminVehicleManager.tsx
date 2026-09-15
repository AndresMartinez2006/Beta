import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Vehicle } from '../types';

export const AdminVehicleManager: React.FC = () => {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle, drivers } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [unitNumber, setUnitNumber] = useState('');
  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(2024);
  const [capacity, setCapacity] = useState<number>(4);
  const [baseLocation, setBaseLocation] = useState<'Villanueva' | 'Valledupar' | 'San Juan'>('Villanueva');
  const [assignedDriverId, setAssignedDriverId] = useState('');
  const [soatExpiry, setSoatExpiry] = useState('2026-12-31');
  const [techExpiry, setTechExpiry] = useState('2026-11-30');
  const [status, setStatus] = useState<'activo' | 'mantenimiento' | 'inactivo'>('activo');
  const [searchFilter, setSearchFilter] = useState('');

  const openNewVehicleModal = () => {
    setEditingId(null);
    setUnitNumber(`VAN #${Math.floor(200 + Math.random() * 800)}`);
    setPlate('');
    setModel('Renault Logan');
    setYear(2024);
    setCapacity(4);
    setBaseLocation('Villanueva');
    setAssignedDriverId(drivers[0]?.id || '');
    setSoatExpiry('2026-12-31');
    setTechExpiry('2026-11-30');
    setStatus('activo');
    setShowModal(true);
  };

  const openEditModal = (veh: Vehicle) => {
    setEditingId(veh.id);
    setUnitNumber(veh.unitNumber);
    setPlate(veh.plate);
    setModel(veh.model);
    setYear(veh.year);
    setCapacity(veh.capacity);
    setBaseLocation(veh.baseLocation);
    setAssignedDriverId(veh.assignedDriverId || '');
    setSoatExpiry(veh.soatExpiry);
    setTechExpiry(veh.techExpiry);
    setStatus(veh.status);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedDriver = drivers.find((d) => d.id === assignedDriverId);

    if (editingId) {
      updateVehicle(editingId, {
        unitNumber,
        plate: plate.toUpperCase().trim(),
        model,
        year,
        capacity,
        baseLocation,
        assignedDriverId: assignedDriver?.id,
        assignedDriverName: assignedDriver?.fullName,
        soatExpiry,
        techExpiry,
        status,
      });
    } else {
      addVehicle({
        unitNumber,
        plate: plate.toUpperCase().trim(),
        model,
        year,
        capacity,
        baseLocation,
        assignedDriverId: assignedDriver?.id,
        assignedDriverName: assignedDriver?.fullName,
        soatExpiry,
        techExpiry,
        status,
      });
    }
    setShowModal(false);
  };

  const filteredVehicles = vehicles.filter((v) => {
    const q = searchFilter.toLowerCase();
    return (
      v.plate.toLowerCase().includes(q) ||
      v.unitNumber.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      (v.assignedDriverName && v.assignedDriverName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* Header with Stats & Actions */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-6 border border-outline-variant/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">directions_car</span>
            <h2 className="font-headline-sm text-lg font-bold text-on-surface">
              Registro de Vehículos Cootransvig
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-badge text-xs font-bold">
              {vehicles.length} en Flota
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Administra los móviles autorizados para servicio intermunicipal Guajira - Cesar.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar por placa o móvil..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant text-xs focus:ring-2 focus:ring-secondary/20 outline-none"
            />
          </div>
          <button
            onClick={openNewVehicleModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-headline-sm text-xs font-bold hover:bg-primary-container active:scale-95 transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Registrar Vehículo</span>
          </button>
        </div>
      </div>

      {/* Vehicles Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.map((veh) => (
          <div
            key={veh.id}
            className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/50 shadow-sm hover:border-secondary/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[22px]">airport_shuttle</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-sm font-bold text-on-surface">{veh.unitNumber}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary font-bold text-xs">
                        {veh.plate}
                      </span>
                      <span className="text-[11px] text-on-surface-variant">{veh.model} ({veh.year})</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    veh.status === 'activo'
                      ? 'bg-secondary-fixed text-on-secondary-container'
                      : veh.status === 'mantenimiento'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {veh.status}
                </span>
              </div>

              {/* Details */}
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low/60">
                  <span className="text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-secondary">person</span>
                    Conductor Asignado:
                  </span>
                  <strong className="text-on-surface font-semibold truncate max-w-[140px]">
                    {veh.assignedDriverName || 'Sin asignar'}
                  </strong>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="p-2 rounded-lg bg-surface-container-low/40">
                    <span className="text-on-surface-variant block">Base Terminal</span>
                    <span className="font-bold text-primary">{veh.baseLocation}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-container-low/40">
                    <span className="text-on-surface-variant block">Capacidad</span>
                    <span className="font-bold text-on-surface">{veh.capacity} pasajeros</span>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-container-low/40">
                    <span className="text-on-surface-variant block">Vigencia SOAT</span>
                    <span className="font-semibold text-secondary">{veh.soatExpiry}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-container-low/40">
                    <span className="text-on-surface-variant block">Tecnomecánica</span>
                    <span className="font-semibold text-on-surface">{veh.techExpiry}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
              <span className="text-[11px] text-secondary font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                Habilitado Ministerio
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(veh)}
                  title="Editar vehículo"
                  className="p-1.5 text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar el móvil ${veh.unitNumber} (${veh.plate}) de la flota?`)) {
                      deleteVehicle(veh.id);
                    }
                  }}
                  title="Eliminar de la flota"
                  className="p-1.5 text-on-surface-variant hover:text-error rounded-lg hover:bg-error-container/40 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="text-center py-12 bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-6">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">no_crash</span>
          <p className="font-headline-sm text-sm font-bold text-on-surface">No se encontraron vehículos</p>
          <p className="text-xs text-on-surface-variant mt-1">
            Usa el botón "Registrar Vehículo" para agregar el primero a la flota.
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
                  <span className="material-symbols-outlined text-[18px]">directions_car</span>
                </div>
                <h3 className="font-headline-sm text-base font-bold text-on-surface">
                  {editingId ? 'Modificar Vehículo de Flota' : 'Registrar Nuevo Vehículo'}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Número Móvil</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. VAN #204"
                    value={unitNumber}
                    onChange={(e) => setUnitNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant text-xs outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Placa Oficial</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. TRL-842"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant text-xs uppercase font-bold outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-on-surface mb-1">Marca y Línea</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Renault Logan, Chevrolet Van"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant text-xs outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Año / Modelo</label>
                  <input
                    type="number"
                    required
                    min={2010}
                    max={2030}
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant text-xs outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Capacidad Pasajeros</label>
                  <input
                    type="number"
                    min={2}
                    max={30}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant text-xs outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Base Operativa</label>
                  <select
                    value={baseLocation}
                    onChange={(e) => setBaseLocation(e.target.value as 'Villanueva' | 'Valledupar' | 'San Juan')}
                    className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant text-xs outline-none focus:ring-2 focus:ring-secondary/20 font-medium"
                  >
                    <option value="Villanueva">Villanueva (Guajira)</option>
                    <option value="Valledupar">Valledupar (Cesar)</option>
                    <option value="San Juan">San Juan del Cesar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Conductor Asignado</label>
                <select
                  value={assignedDriverId}
                  onChange={(e) => setAssignedDriverId(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant text-xs outline-none focus:ring-2 focus:ring-secondary/20 font-medium"
                >
                  <option value="">-- Sin conductor asignado --</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName} ({d.dni}) - Lic. {d.licenseCategory}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Vigencia SOAT</label>
                  <input
                    type="date"
                    required
                    value={soatExpiry}
                    onChange={(e) => setSoatExpiry(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant text-xs outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Tecnomecánica</label>
                  <input
                    type="date"
                    required
                    value={techExpiry}
                    onChange={(e) => setTechExpiry(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant text-xs outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Estado en Operación</label>
                <div className="flex gap-2">
                  {(['activo', 'mantenimiento', 'inactivo'] as const).map((st) => (
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
                  {editingId ? 'Guardar Cambios' : 'Registrar en Flota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
