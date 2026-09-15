export type UserRole = 'conductor' | 'admin';

export type InspectionStatus = 'apto' | 'bloqueado' | 'en_progreso';

export interface InspectionChecklist {
  [key: string]: boolean;
}

export interface InspectionRecord {
  id: string;
  unitNumber: string;
  plate: string;
  vehicleModel: string;
  driverName: string;
  driverId: string;
  driverPhone: string;
  timestamp: string;
  timeLabel: string;
  status: InspectionStatus;
  odometerKm: number;
  odometerPhoto: string;
  checklistCount: string; // e.g. "10/10" or "8 de 20"
  checklistProgress: number; // percentage
  checklist: InspectionChecklist;
  turnLabel: string;
  failureReason?: string;
  documentIssues?: string;
  dispatchAuthorized: boolean;
  dispatchTime?: string;
  fuecNumber?: string;
  isNew?: boolean;
}

export interface RouteWaypoint {
  id: string;
  order: string;
  name: string;
  role: string;
  scheduledTime: string;
  statusText: string;
  isCurrent?: boolean;
}

export interface RoadAlert {
  id: string;
  title: string;
  timeAgo: string;
  description: string;
  type: 'traffic' | 'weather' | 'warning';
}

export interface OperationalStats {
  totalFleet: number;
  authorizedApt: number;
  rejectedBlocked: number;
  inProgress: number;
  technicalFailures: number;
  docFailures: number;
  avgTimeMin: number;
}

export interface Vehicle {
  id: string;
  unitNumber: string; // e.g. "VAN #204"
  plate: string; // e.g. "TRL-842"
  model: string; // e.g. "Renault Logan"
  year: number;
  capacity: number; // passengers
  assignedDriverId?: string;
  assignedDriverName?: string;
  soatExpiry: string;
  techExpiry: string;
  status: 'activo' | 'mantenimiento' | 'inactivo';
  baseLocation: 'Villanueva' | 'Valledupar' | 'San Juan';
}

export interface Driver {
  id: string; // e.g. "OP-7420"
  fullName: string; // e.g. "Andrés Martínez"
  dni: string;
  licenseCategory: 'C1' | 'C2' | 'C3';
  licenseExpiry: string;
  phone: string;
  assignedVehiclePlate?: string;
  assignedVehicleUnit?: string;
  status: 'activo' | 'suspendido' | 'vacaciones';
  photoInitials: string;
}
