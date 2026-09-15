import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { InspectionRecord, UserRole, OperationalStats, Vehicle, Driver } from '../types';
import { INITIAL_INSPECTIONS, INITIAL_VEHICLES, INITIAL_DRIVERS, playNotificationChime } from '../services/store';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;

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
  submitInspection: (record: Omit<InspectionRecord, 'id' | 'timestamp' | 'timeLabel'>) => InspectionRecord;
  authorizeDispatch: (id: string) => void;
  resolveInspectionFailure: (id: string) => void;
  addManualInspection: (record: InspectionRecord) => void;
  clearAllInspections: () => void;

  // Live alerts
  liveAdminAlert: { title: string; message: string; recordId: string; timestamp: string } | null;
  clearLiveAlert: () => void;
  unreadAdminAlerts: number;
  resetUnreadAlerts: () => void;

  // Quick switch between screens
  activePortal: 'conductor' | 'admin';
  setActivePortal: (portal: 'conductor' | 'admin') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_INSPECTIONS = 'cootransvig_inspections_v2';
const STORAGE_KEY_VEHICLES = 'cootransvig_vehicles_v2';
const STORAGE_KEY_DRIVERS = 'cootransvig_drivers_v2';
const BROADCAST_CHANNEL = 'cootransvig_sync_channel_v2';

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

  // Conductor session: default "Andrés Martínez"
  const [isConductorLoggedIn, setIsConductorLoggedIn] = useState(true);
  const [conductorTab, setConductorTab] = useState<'turnos' | 'vehiculo' | 'rutas' | 'perfil'>('turnos');
  const [driverId, setDriverId] = useState('OP-7420');
  const [driverName, setDriverName] = useState('Andrés Martínez');
  const [vehiclePlate, setVehiclePlate] = useState('TRL-842');
  const [vehicleUnit, setVehicleUnit] = useState('VAN #204');

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
    return newVehicle;
  }, []);

  const updateVehicle = useCallback((id: string, updates: Partial<Vehicle>) => {
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  }, []);

  const deleteVehicle = useCallback((id: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  }, []);

  // Drivers management by Admin
  const addDriver = useCallback((newDriver: Driver) => {
    setDrivers((prev) => [newDriver, ...prev]);
  }, []);

  const updateDriver = useCallback((id: string, updates: Partial<Driver>) => {
    setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  }, []);

  const deleteDriver = useCallback((id: string) => {
    setDrivers((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // Submit inspection from Conductor or Admin
  const submitInspection = useCallback(
    (recordData: Omit<InspectionRecord, 'id' | 'timestamp' | 'timeLabel'>) => {
      const now = new Date();
      const timeLabel = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
      const newId = `INS-${Date.now().toString().slice(-4)}`;

      const newRecord: InspectionRecord = {
        ...recordData,
        id: newId,
        timestamp: now.toISOString(),
        timeLabel,
        isNew: true,
      };

      setInspections((prev) => [newRecord, ...prev.filter((i) => i.plate !== newRecord.plate)]);

      // Trigger immediate Admin notifications
      setLiveAdminAlert({
        title: '⚡ ¡Inspección Preoperacional Recibida en Tiempo Real!',
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
    []
  );

  const authorizeDispatch = useCallback((id: string) => {
    const now = new Date();
    const dispatchTime = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
    setInspections((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            dispatchAuthorized: true,
            dispatchTime,
            status: 'apto',
            fuecNumber: item.fuecNumber || `FUEC-4409-COOTRANSVIG-${new Date().getFullYear()}-${item.id.replace('INS-', '')}`,
          };
        }
        return item;
      })
    );
    playNotificationChime();
  }, []);

  const resolveInspectionFailure = useCallback((id: string) => {
    setInspections((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: 'apto',
            failureReason: undefined,
            documentIssues: undefined,
            checklistProgress: 100,
            checklistCount: '8/8',
            dispatchAuthorized: true,
            fuecNumber: item.fuecNumber || `FUEC-4409-COOTRANSVIG-2025-${item.id}`,
          };
        }
        return item;
      })
    );
  }, []);

  const addManualInspection = useCallback((record: InspectionRecord) => {
    setInspections((prev) => [record, ...prev]);
  }, []);

  // Wipes all inspections so user can start completely fresh
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
        clearAllInspections,
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
