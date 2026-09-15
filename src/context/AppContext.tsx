import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { InspectionRecord, UserRole, OperationalStats, Vehicle, Driver, AppNotification } from '../types';
import { INITIAL_INSPECTIONS, INITIAL_VEHICLES, INITIAL_DRIVERS, playNotificationChime } from '../services/store';

// Helper to check if a date/timestamp is the same calendar day as today
export function isSameCalendarDay(d1Str?: string, d2: Date = new Date()): boolean {
  if (!d1Str) return false;
  try {
    const d1 = new Date(d1Str);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  } catch {
    return false;
  }
}

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;

  // Real-time live clock
  currentTime: string;
  currentDate: string;

  // Conductor session
  isConductorLoggedIn: boolean;
  conductorTab: 'turnos' | 'vehiculo' | 'rutas' | 'perfil';
  setConductorTab: (tab: 'turnos' | 'vehiculo' | 'rutas' | 'perfil') => void;
  driverId: string;
  setDriverId: (id: string) => void;
  driverName: string;
  setDriverName: (name: string) => void;
  vehiclePlate: string;
  setVehiclePlate: (plate: string) => void;
  vehicleUnit: string;
  setVehicleUnit: (unit: string) => void;
  loginConductor: (id: string, pin: string) => void;
  logoutConductor: () => void;

  // Daily inspection validation (1 per day per driver/vehicle)
  hasDriverInspectedToday: (driverIdOrName: string) => InspectionRecord | undefined;
  hasVehicleInspectedToday: (plateOrUnit: string) => InspectionRecord | undefined;

  // Admin session
  adminName: string;
  setAdminName: (name: string) => void;
  isAdminLoggedIn: boolean;
  adminTab: 'control' | 'inspecciones' | 'vehiculos' | 'conductores';
  setAdminTab: (tab: 'control' | 'inspecciones' | 'vehiculos' | 'conductores') => void;
  adminBase: 'villanueva' | 'valledupar' | 'sanjuan';
  setAdminBase: (base: 'villanueva' | 'valledupar' | 'sanjuan') => void;
  loginAdmin: (base: 'villanueva' | 'valledupar' | 'sanjuan', user: string, pin: string) => void;
  logoutAdmin: () => void;

  // Fleet & Drivers registered by the Admin
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Vehicle;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;

  drivers: Driver[];
  addDriver: (driver: Driver) => void;
  updateDriver: (id: string, updates: Partial<Driver>) => void;
  deleteDriver: (id: string) => void;

  // Inspections & Live Sync
  inspections: InspectionRecord[];
  stats: OperationalStats;
  submitInspection: (record: Omit<InspectionRecord, 'id' | 'timestamp' | 'timeLabel' | 'dateLabel'>) => InspectionRecord;
  authorizeDispatch: (id: string) => void;
  resolveInspectionFailure: (id: string) => void;
  addManualInspection: (record: InspectionRecord) => void;
  deleteInspection: (id: string) => void;
  clearAllInspections: () => void;

  // Real Notifications system (starts empty, only real future events)
  notifications: AppNotification[];
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'date'>) => void;
  clearNotifications: () => void;
  dismissNotification: (id: string) => void;
  unreadNotificationsCount: number;
  resetUnreadNotifications: () => void;

  // Live banner alert
  liveAdminAlert: { title: string; message: string; recordId: string; timestamp: string } | null;
  clearLiveAlert: () => void;
  unreadAdminAlerts: number;
  resetUnreadAlerts: () => void;

  // Quick switch between screens
  activePortal: 'conductor' | 'admin';
  setActivePortal: (portal: 'conductor' | 'admin') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_INSPECTIONS = 'cootransvig_inspections_v3';
const STORAGE_KEY_VEHICLES = 'cootransvig_vehicles_v3';
const STORAGE_KEY_DRIVERS = 'cootransvig_drivers_v3';
const STORAGE_KEY_NOTIFICATIONS = 'cootransvig_notifications_v3';
const BROADCAST_CHANNEL = 'cootransvig_sync_channel_v3';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load inspections - starts empty (de cero!) as explicitly requested
  const [inspections, setInspections] = useState<InspectionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INSPECTIONS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved inspections', e);
    }
    return INITIAL_INSPECTIONS; // empty []
  });

  // Load vehicles registered by Admin
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VEHICLES);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved vehicles', e);
    }
    return INITIAL_VEHICLES;
  });

  // Load drivers registered by Admin
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DRIVERS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved drivers', e);
    }
    return INITIAL_DRIVERS;
  });

  const [role, setRole] = useState<UserRole>('conductor');
  const [activePortal, setActivePortal] = useState<'conductor' | 'admin'>('conductor');

  // Live real-time clock updating every second
  const [currentTime, setCurrentTime] = useState<string>(() =>
    new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  );
  const [currentDate, setCurrentDate] = useState<string>(() =>
    new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setCurrentDate(now.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Notifications system - Starts empty as requested ("elimines las notificaciones y solo salgan las que realmente se van hacer de ahora en adelante")
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse notifications', e);
    }
    return [];
  });

  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to save notifications', e);
    }
  }, [notifications]);

  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'timestamp' | 'date'>) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateStr = now.toLocaleDateString('es-CO');
    const newNotif: AppNotification = {
      ...notif,
      id: `NOTIF-${Date.now().toString().slice(-5)}`,
      timestamp: timeStr,
      date: dateStr,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setUnreadNotificationsCount((prev) => prev + 1);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadNotificationsCount(0);
    localStorage.removeItem(STORAGE_KEY_NOTIFICATIONS);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const resetUnreadNotifications = useCallback(() => {
    setUnreadNotificationsCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Conductor session: default "Andrés Martínez"
  const [isConductorLoggedIn, setIsConductorLoggedIn] = useState(true);
  const [conductorTab, setConductorTab] = useState<'turnos' | 'vehiculo' | 'rutas' | 'perfil'>('turnos');
  const [driverId, setDriverId] = useState('OP-7420');
  const [driverName, setDriverName] = useState('Andrés Martínez');
  const [vehiclePlate, setVehiclePlate] = useState('TRL-842');
  const [vehicleUnit, setVehicleUnit] = useState('VAN #204');

  // Helper to verify if conductor or vehicle already submitted their daily inspection today
  const hasDriverInspectedToday = useCallback(
    (targetDriverIdOrName: string): InspectionRecord | undefined => {
      const term = targetDriverIdOrName.trim().toLowerCase();
      return inspections.find((i) => {
        const matchesDriver =
          i.driverId.toLowerCase() === term ||
          i.driverName.toLowerCase() === term;
        return matchesDriver && isSameCalendarDay(i.timestamp);
      });
    },
    [inspections]
  );

  const hasVehicleInspectedToday = useCallback(
    (plateOrUnit: string): InspectionRecord | undefined => {
      const term = plateOrUnit.trim().toLowerCase();
      return inspections.find((i) => {
        const matchesVehicle =
          i.plate.toLowerCase() === term ||
          i.unitNumber.toLowerCase() === term;
        return matchesVehicle && isSameCalendarDay(i.timestamp);
      });
    },
    [inspections]
  );

  // Admin session: default "Julio Pérez"
  const [adminName, setAdminName] = useState('Julio Pérez');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(true);
  const [adminTab, setAdminTab] = useState<'control' | 'inspecciones' | 'vehiculos' | 'conductores'>('control');
  const [adminBase, setAdminBase] = useState<'villanueva' | 'valledupar' | 'sanjuan'>('villanueva');

  // Real-time notifications
  const [liveAdminAlert, setLiveAdminAlert] = useState<{ title: string; message: string; recordId: string; timestamp: string } | null>(null);
  const [unreadAdminAlerts, setUnreadAdminAlerts] = useState<number>(0);

  // Dynamic Operational Stats calculated directly from real records & fleet
  const stats: OperationalStats = {
    totalFleet: vehicles.length,
    authorizedApt: inspections.filter((i) => i.status === 'apto').length,
    rejectedBlocked: inspections.filter((i) => i.status === 'bloqueado').length,
    inProgress: inspections.filter((i) => i.status === 'en_progreso').length,
    technicalFailures: inspections.filter((i) => i.status === 'bloqueado' && !i.documentIssues).length,
    docFailures: inspections.filter((i) => i.status === 'bloqueado' && !!i.documentIssues).length,
    avgTimeMin: 4,
  };

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INSPECTIONS, JSON.stringify(inspections));
    } catch (e) {
      console.error('Failed to save inspections', e);
    }
  }, [inspections]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VEHICLES, JSON.stringify(vehicles));
    } catch (e) {
      console.error('Failed to save vehicles', e);
    }
  }, [vehicles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DRIVERS, JSON.stringify(drivers));
    } catch (e) {
      console.error('Failed to save drivers', e);
    }
  }, [drivers]);

  // BroadcastChannel for cross-tab instant synchronization
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(BROADCAST_CHANNEL);
      channel.onmessage = (event) => {
        if (event.data?.type === 'NEW_INSPECTION') {
          const newRecord = event.data.payload as InspectionRecord;
          setInspections((prev) => {
            const exists = prev.find((i) => i.id === newRecord.id);
            if (exists) {
              return prev.map((i) => (i.id === newRecord.id ? newRecord : i));
            }
            return [newRecord, ...prev];
          });
          setLiveAdminAlert({
            title: '¡Nueva Inspección Preoperacional Recibida!',
            message: `${newRecord.driverName} (${newRecord.plate} - ${newRecord.unitNumber}) ha registrado su planilla. Estado: ${newRecord.status.toUpperCase()}`,
            recordId: newRecord.id,
            timestamp: newRecord.timeLabel,
          });
          setUnreadAdminAlerts((prev) => prev + 1);
          playNotificationChime();
        } else if (event.data?.type === 'CLEAR_INSPECTIONS') {
          setInspections([]);
        } else if (event.data?.type === 'DELETE_INSPECTION') {
          const deletedId = event.data?.payload?.id;
          if (deletedId) {
            setInspections((prev) => prev.filter((i) => i.id !== deletedId));
          }
        }
      };
    } catch (e) {
      console.log('BroadcastChannel not supported', e);
    }

    return () => {
      channel?.close();
    };
  }, []);

  const loginConductor = (id: string, _pin: string) => {
    setIsConductorLoggedIn(true);
    setDriverId(id || 'OP-7420');
    // Check if this ID matches any registered driver
    const matched = drivers.find((d) => d.id.toLowerCase() === id.toLowerCase() || d.dni.includes(id));
    if (matched) {
      setDriverName(matched.fullName);
      if (matched.assignedVehiclePlate) setVehiclePlate(matched.assignedVehiclePlate);
      if (matched.assignedVehicleUnit) setVehicleUnit(matched.assignedVehicleUnit);
    } else {
      setDriverName('Andrés Martínez');
    }
    setConductorTab('turnos');
    setActivePortal('conductor');
  };

  const logoutConductor = () => {
    setIsConductorLoggedIn(false);
  };

  const loginAdmin = (base: 'villanueva' | 'valledupar' | 'sanjuan', _user: string, _pin: string) => {
    setIsAdminLoggedIn(true);
    setAdminBase(base);
    setAdminName('Julio Pérez');
    setAdminTab('control');
    setActivePortal('admin');
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
  };

  // Vehicles management by Admin
  const addVehicle = useCallback((newVehData: Omit<Vehicle, 'id'>) => {
    const newId = `veh-${Date.now().toString().slice(-4)}`;
    const newVehicle: Vehicle = {
      ...newVehData,
      id: newId,
    };
    setVehicles((prev) => [newVehicle, ...prev]);

    // Real notification for vehicle addition
    addNotification({
      title: 'Vehículo Vinculado al Parque Automotor',
      message: `Unidad ${newVehicle.unitNumber} (${newVehicle.plate} - ${newVehicle.model}) dada de alta en Base ${newVehicle.baseLocation}.`,
      type: 'vehicle',
      target: 'all',
    });

    return newVehicle;
  }, [addNotification]);

  const updateVehicle = useCallback((id: string, updates: Partial<Vehicle>) => {
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  }, []);

  const deleteVehicle = useCallback((id: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  }, []);

  // Drivers management by Admin
  const addDriver = useCallback((newDriver: Driver) => {
    setDrivers((prev) => [newDriver, ...prev]);

    // Real notification for driver addition
    addNotification({
      title: 'Nuevo Conductor Registrado',
      message: `Operador ${newDriver.fullName} (Cód: ${newDriver.id}, Cat: ${newDriver.licenseCategory}) habilitado en la plataforma.`,
      type: 'driver',
      target: 'all',
    });
  }, [addNotification]);

  const updateDriver = useCallback((id: string, updates: Partial<Driver>) => {
    setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  }, []);

  const deleteDriver = useCallback((id: string) => {
    setDrivers((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // Submit inspection from Conductor or Admin
  const submitInspection = useCallback(
    (recordData: Omit<InspectionRecord, 'id' | 'timestamp' | 'timeLabel' | 'dateLabel'>) => {
      const now = new Date();
      const timeLabel = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
      const dateLabel = now.toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });
      const newId = `INS-${Date.now().toString().slice(-4)}`;

      const newRecord: InspectionRecord = {
        ...recordData,
        id: newId,
        timestamp: now.toISOString(),
        timeLabel,
        dateLabel,
        isNew: true,
      };

      setInspections((prev) => [newRecord, ...prev.filter((i) => i.plate !== newRecord.plate)]);

      // Add real notification according to actual outcome
      if (newRecord.status === 'apto') {
        addNotification({
          title: `Inspección Aprobada: ${newRecord.unitNumber}`,
          message: `${newRecord.driverName} (${newRecord.plate}) completó satisfactoriamente el checklist preoperacional (${newRecord.checklistCount} conforme). Apto para despacho.`,
          type: 'inspection_apto',
          target: 'all',
          recordId: newId,
        });
      } else {
        addNotification({
          title: `⚠️ Bloqueo Preventivo: ${newRecord.unitNumber}`,
          message: `${newRecord.driverName} (${newRecord.plate}) reportó novedad crítica: ${newRecord.failureReason || 'Fallas en la inspección'}. Despacho suspendido.`,
          type: 'inspection_blocked',
          target: 'all',
          recordId: newId,
        });
      }

      // Trigger immediate Admin visual alert
      setLiveAdminAlert({
        title: newRecord.status === 'apto' ? '⚡ ¡Inspección Recibida y Aprobada!' : '⚠️ ¡Inspección con Novedades Críticas!',
        message: `${newRecord.driverName} (${newRecord.plate} - ${newRecord.unitNumber}) registró su planilla desde el Portal Conductor.`,
        recordId: newId,
        timestamp: timeLabel,
      });
      setUnreadAdminAlerts((prev) => prev + 1);
      playNotificationChime();

      // Broadcast across tabs
      try {
        const channel = new BroadcastChannel(BROADCAST_CHANNEL);
        channel.postMessage({ type: 'NEW_INSPECTION', payload: newRecord });
        channel.close();
      } catch (e) {
        console.log('Broadcast error', e);
      }

      return newRecord;
    },
    [addNotification]
  );

  const authorizeDispatch = useCallback((id: string) => {
    const now = new Date();
    const dispatchTime = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
    
    let updatedPlate = '';
    let updatedUnit = '';

    setInspections((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          updatedPlate = item.plate;
          updatedUnit = item.unitNumber;
          return {
            ...item,
            dispatchAuthorized: true,
            dispatchTime,
            status: 'apto',
            fuecNumber: item.fuecNumber || `FUEC-4409-COOTRANSVIG-${now.getFullYear()}-${item.id.replace('INS-', '')}`,
          };
        }
        return item;
      })
    );

    addNotification({
      title: 'FUEC Emitido y Despacho Autorizado',
      message: `Vehículo ${updatedUnit || id} (${updatedPlate}) autorizado por Dirección Operativa para salida en ruta intermunicipal.`,
      type: 'dispatch',
      target: 'all',
      recordId: id,
    });

    playNotificationChime();
  }, [addNotification]);

  const resolveInspectionFailure = useCallback((id: string) => {
    let resolvedUnit = '';
    let resolvedPlate = '';

    setInspections((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          resolvedUnit = item.unitNumber;
          resolvedPlate = item.plate;
          return {
            ...item,
            status: 'apto',
            failureReason: undefined,
            documentIssues: undefined,
            checklistProgress: 100,
            checklistCount: '36/36',
            dispatchAuthorized: true,
            fuecNumber: item.fuecNumber || `FUEC-4409-COOTRANSVIG-${new Date().getFullYear()}-${item.id}`,
          };
        }
        return item;
      })
    );

    addNotification({
      title: 'Bloqueo Técnico Subsanado',
      message: `Se levantó la novedad técnica para ${resolvedUnit || id} (${resolvedPlate}). Unidad habilitada como APTA para el servicio.`,
      type: 'unblock',
      target: 'all',
      recordId: id,
    });
  }, [addNotification]);

  const addManualInspection = useCallback((record: InspectionRecord) => {
    setInspections((prev) => [record, ...prev]);
  }, []);

  // Delete a specific inspection record (useful for testing phase so driver can re-inspect)
  const deleteInspection = useCallback((id: string) => {
    let deletedTarget: InspectionRecord | undefined;
    setInspections((prev) => {
      deletedTarget = prev.find((i) => i.id === id);
      return prev.filter((i) => i.id !== id);
    });

    if (deletedTarget) {
      addNotification({
        title: 'Inspección Eliminada (Fase de Pruebas)',
        message: `Se eliminó el registro ${deletedTarget.id} de la unidad ${deletedTarget.unitNumber || deletedTarget.plate} (${deletedTarget.driverName}). El conductor ahora puede volver a realizar su inspección preoperacional de hoy.`,
        type: 'warning',
        target: 'all',
        plate: deletedTarget.plate,
        unitNumber: deletedTarget.unitNumber,
      });
    }

    try {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL);
      channel.postMessage({ type: 'DELETE_INSPECTION', payload: { id } });
      channel.close();
    } catch (e) {
      console.log('Broadcast error', e);
    }
  }, [addNotification]);

  // Wipes all inspections so user can start completely fresh or reset testing
  const clearAllInspections = useCallback(() => {
    setInspections([]);
    localStorage.removeItem(STORAGE_KEY_INSPECTIONS);
    try {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL);
      channel.postMessage({ type: 'CLEAR_INSPECTIONS' });
      channel.close();
    } catch (e) {
      console.log('Broadcast error', e);
    }
  }, []);

  const clearLiveAlert = () => setLiveAdminAlert(null);
  const resetUnreadAlerts = () => setUnreadAdminAlerts(0);

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentTime,
        currentDate,
        isConductorLoggedIn,
        conductorTab,
        setConductorTab,
        driverId,
        setDriverId,
        driverName,
        setDriverName,
        vehiclePlate,
        setVehiclePlate,
        vehicleUnit,
        setVehicleUnit,
        loginConductor,
        logoutConductor,
        hasDriverInspectedToday,
        hasVehicleInspectedToday,
        adminName,
        setAdminName,
        isAdminLoggedIn,
        adminTab,
        setAdminTab,
        adminBase,
        setAdminBase,
        loginAdmin,
        logoutAdmin,
        vehicles,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        drivers,
        addDriver,
        updateDriver,
        deleteDriver,
        inspections,
        stats,
        submitInspection,
        authorizeDispatch,
        resolveInspectionFailure,
        addManualInspection,
        deleteInspection,
        clearAllInspections,
        notifications,
        addNotification,
        clearNotifications,
        dismissNotification,
        unreadNotificationsCount,
        resetUnreadNotifications,
        liveAdminAlert,
        clearLiveAlert,
        unreadAdminAlerts,
        resetUnreadAlerts,
        activePortal,
        setActivePortal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
