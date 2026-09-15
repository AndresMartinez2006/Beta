import { InspectionRecord, RouteWaypoint, RoadAlert, Vehicle, Driver } from '../types';

// El usuario solicitó explícitamente iniciar de cero las inspecciones preoperacionales
// para ir agregando sus propios datos paso a paso.
export const INITIAL_INSPECTIONS: InspectionRecord[] = [];

// Vehículos registrados por el Administrador (Julio Pérez) en COOTRANSVIG
export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh-204',
    unitNumber: 'VAN #204',
    plate: 'TRL-842',
    model: 'Renault Logan',
    year: 2023,
    capacity: 4,
    assignedDriverId: 'OP-7420',
    assignedDriverName: 'Andrés Martínez',
    soatExpiry: '2026-11-20',
    techExpiry: '2026-10-15',
    status: 'activo',
    baseLocation: 'Villanueva',
  },
  {
    id: 'veh-108',
    unitNumber: 'BUS #108',
    plate: 'TRL-910',
    model: 'Renault Duster Especial',
    year: 2024,
    capacity: 4,
    assignedDriverId: 'OP-3302',
    assignedDriverName: 'Carlos Mestre',
    soatExpiry: '2026-08-14',
    techExpiry: '2026-09-01',
    status: 'activo',
    baseLocation: 'Villanueva',
  },
  {
    id: 'veh-150',
    unitNumber: 'MICRO #150',
    plate: 'TRL-512',
    model: 'Chevrolet Van N300',
    year: 2022,
    capacity: 7,
    assignedDriverId: 'OP-7721',
    assignedDriverName: 'Andrés Iguarán',
    soatExpiry: '2026-12-05',
    techExpiry: '2026-11-30',
    status: 'activo',
    baseLocation: 'Valledupar',
  },
  {
    id: 'veh-215',
    unitNumber: 'VAN #215',
    plate: 'WLL-330',
    model: 'Renault Logan Privilege',
    year: 2023,
    capacity: 4,
    assignedDriverId: 'OP-4519',
    assignedDriverName: 'Jorge Gómez',
    soatExpiry: '2026-06-18',
    techExpiry: '2026-07-22',
    status: 'activo',
    baseLocation: 'San Juan',
  },
];

// Conductores vinculados y registrados por el Administrador (Julio Pérez)
export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'OP-7420',
    fullName: 'Andrés Martínez',
    dni: '1.065.892.411',
    licenseCategory: 'C1',
    licenseExpiry: '2028-09-15',
    phone: '+57 301 458 9210',
    assignedVehicleUnit: 'VAN #204',
    assignedVehiclePlate: 'TRL-842',
    status: 'activo',
    photoInitials: 'AM',
  },
  {
    id: 'OP-3302',
    fullName: 'Carlos Mestre',
    dni: '77.189.204',
    licenseCategory: 'C2',
    licenseExpiry: '2027-04-10',
    phone: '+57 312 849 2031',
    assignedVehicleUnit: 'BUS #108',
    assignedVehiclePlate: 'TRL-910',
    status: 'activo',
    photoInitials: 'CM',
  },
  {
    id: 'OP-7721',
    fullName: 'Andrés Iguarán',
    dni: '84.102.930',
    licenseCategory: 'C2',
    licenseExpiry: '2029-01-20',
    phone: '+57 300 892 4110',
    assignedVehicleUnit: 'MICRO #150',
    assignedVehiclePlate: 'TRL-512',
    status: 'activo',
    photoInitials: 'AI',
  },
  {
    id: 'OP-4519',
    fullName: 'Jorge Gómez',
    dni: '12.441.902',
    licenseCategory: 'C1',
    licenseExpiry: '2027-11-05',
    phone: '+57 315 720 1199',
    assignedVehicleUnit: 'VAN #215',
    assignedVehiclePlate: 'WLL-330',
    status: 'activo',
    photoInitials: 'JG',
  },
];

export const INITIAL_WAYPOINTS: RouteWaypoint[] = [
  {
    id: 'wp-1',
    order: '01',
    name: 'Terminal Villanueva',
    role: 'Salida • Previsto: 08:24 AM',
    scheduledTime: '08:24 AM',
    statusText: 'A tiempo',
    isCurrent: true,
  },
  {
    id: 'wp-2',
    order: '02',
    name: 'San Juan del Cesar',
    role: 'Paso • Previsto: 08:45 AM',
    scheduledTime: '08:45 AM',
    statusText: 'A tiempo',
  },
  {
    id: 'wp-3',
    order: '03',
    name: 'La Paz / Robles',
    role: 'Control • Previsto: 09:10 AM',
    scheduledTime: '09:10 AM',
    statusText: 'Previsto',
  },
  {
    id: 'wp-4',
    order: '04',
    name: 'Terminal Valledupar',
    role: 'Destino • Previsto: 09:35 AM',
    scheduledTime: '09:35 AM',
    statusText: 'Previsto',
  },
];

export const INITIAL_ALERTS: RoadAlert[] = [
  {
    id: 'alert-1',
    title: 'Peaje San Juan del Cesar',
    timeAgo: 'Hace 5 min',
    description: 'Paso normal sin congestión. Flujo vehicular continuo en vía La Paz - Valledupar.',
    type: 'traffic',
  },
  {
    id: 'alert-2',
    title: 'Clima: Ruta Despejada',
    timeAgo: 'Hace 15 min',
    description: 'Pavimento seco y visibilidad óptima en serranía y planicie.',
    type: 'weather',
  },
];

// Audio Notification chime generator using Web Audio API
export function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
    osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.2); // D6
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.log('Audio chime not permitted or supported', e);
  }
}
