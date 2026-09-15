import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const AdminLogin: React.FC = () => {
  const { loginAdmin, setActivePortal } = useApp();
  const [base, setBase] = useState<'villanueva' | 'valledupar' | 'sanjuan'>('villanueva');
  const [username, setUsername] = useState('admin.villanueva');
  const [password, setPassword] = useState('Admin2025*');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAdmin(base, username, password);
  };

  const handleBiometric = () => {
    setShowBiometricModal(true);
    setTimeout(() => {
      setShowBiometricModal(false);
      loginAdmin(base, username, password);
    }, 1400);
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased selection:bg-secondary-container selection:text-on-secondary-container justify-between">
      {/* Header Institucional Ligero */}
      <header className="w-full bg-surface-container-lowest/80 backdrop-blur-md shadow-sm z-30 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm">
              <span className="material-symbols-outlined text-[24px]">directions_bus</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">
                  Cootransvig Admin
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-surface-container text-secondary text-[11px] font-bold font-label-badge">
                  GESTIÓN
                </span>
              </div>
              <span className="font-label-badge text-label-badge text-secondary tracking-wider">
                MOVILIDAD CESAR & GUAJIRA
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSupportModal(true)}
              className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors text-sm font-body-sm px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">help_outline</span>
              <span className="font-medium">Soporte TI</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenedor Principal */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg my-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-secondary font-label-badge text-label-badge mb-3 border border-outline-variant/30">
              <span className="material-symbols-outlined text-[15px]">admin_panel_settings</span>
              <span>PORTAL DE CONTROL OPERATIVO & DESPACHO</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              Acceso Administrativo
            </h1>
            <p className="text-on-surface-variant font-body-md mt-1.5">
              Gestión de flota, despachos y supervisión en línea
            </p>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl shadow-lg border border-outline-variant/30 p-6 sm:p-8">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Sede / Base Operativa */}
              <div>
                <label className="block font-label-data text-label-data text-on-surface mb-2 font-semibold">
                  Sede / Base Operativa
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <label className="cursor-pointer">
                    <input
                      checked={base === 'villanueva'}
                      onChange={() => setBase('villanueva')}
                      className="sr-only"
                      name="base_operativa"
                      type="radio"
                      value="villanueva"
                    />
                    <div
                      className={`flex flex-col items-center justify-center py-2.5 px-2 text-center rounded-xl border transition-all duration-150 ${
                        base === 'villanueva'
                          ? 'border-primary bg-primary-container text-on-primary shadow-sm'
                          : 'border-outline-variant/60 bg-surface-container-low/40 text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px] mb-0.5">domain</span>
                      <span className="text-[12px] font-bold">Villanueva</span>
                      <span className="text-[10px] opacity-75">Guajira</span>
                    </div>
                  </label>

                  <label className="cursor-pointer">
                    <input
                      checked={base === 'valledupar'}
                      onChange={() => setBase('valledupar')}
                      className="sr-only"
                      name="base_operativa"
                      type="radio"
                      value="valledupar"
                    />
                    <div
                      className={`flex flex-col items-center justify-center py-2.5 px-2 text-center rounded-xl border transition-all duration-150 ${
                        base === 'valledupar'
                          ? 'border-primary bg-primary-container text-on-primary shadow-sm'
                          : 'border-outline-variant/60 bg-surface-container-low/40 text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px] mb-0.5">location_city</span>
                      <span className="text-[12px] font-bold">Valledupar</span>
                      <span className="text-[10px] opacity-75">Cesar</span>
                    </div>
                  </label>

                  <label className="cursor-pointer">
                    <input
                      checked={base === 'sanjuan'}
                      onChange={() => setBase('sanjuan')}
                      className="sr-only"
                      name="base_operativa"
                      type="radio"
                      value="sanjuan"
                    />
                    <div
                      className={`flex flex-col items-center justify-center py-2.5 px-2 text-center rounded-xl border transition-all duration-150 ${
                        base === 'sanjuan'
                          ? 'border-primary bg-primary-container text-on-primary shadow-sm'
                          : 'border-outline-variant/60 bg-surface-container-low/40 text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px] mb-0.5">share_location</span>
                      <span className="text-[12px] font-bold">San Juan</span>
                      <span className="text-[10px] opacity-75">Guajira</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Usuario o Cédula Corporativa */}
              <div>
                <label className="block font-label-data text-label-data text-on-surface mb-1.5 font-semibold" htmlFor="username">
                  Usuario o Cédula Corporativa
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">badge</span>
                  </div>
                  <input
                    className="block w-full pl-11 pr-4 py-3 bg-surface-container-low/30 rounded-xl border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary-container/20 text-on-surface text-body-md placeholder:text-on-surface-variant/50 transition-colors outline-none"
                    id="username"
                    name="username"
                    placeholder="Ej. admin.villanueva o CC"
                    required
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              {/* Contraseña / Token */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-label-data text-label-data text-on-surface font-semibold" htmlFor="password">
                    Contraseña / Token de Acceso
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Contacte al Superadministrador de Cootransvig para regenerar su Token OTP.')}
                    className="text-xs font-label-badge text-secondary hover:text-primary transition-colors underline-offset-4 hover:underline cursor-pointer"
                  >
                    ¿Olvidó sus credenciales?
                  </button>
                </div>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </div>
                  <input
                    className="block w-full pl-11 pr-11 py-3 bg-surface-container-low/30 rounded-xl border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary-container/20 text-on-surface text-body-md placeholder:text-on-surface-variant/50 transition-colors outline-none"
                    id="password"
                    name="password"
                    placeholder="••••••••••••"
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    aria-label="Ver contraseña"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Checkbox and SSL badge */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary-container cursor-pointer"
                    name="remember_device"
                    type="checkbox"
                  />
                  <span className="font-body-sm text-body-sm text-on-surface-variant select-none">
                    Recordar sesión en este equipo
                  </span>
                </label>
                <div className="flex items-center gap-1 text-[11px] text-secondary font-label-badge font-semibold">
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  <span>Acceso Seguro SSL</span>
                </div>
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <button
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-primary hover:bg-tertiary-container active:scale-[0.98] text-on-primary font-semibold text-[16px] transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
                  type="submit"
                >
                  <span>Ingresar al Centro de Control</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
              </div>

              {/* Biometrics */}
              <div className="pt-1">
                <button
                  onClick={handleBiometric}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-outline-variant/60 bg-surface-container-low/40 hover:bg-surface-container text-on-surface text-sm font-medium transition-colors cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-secondary text-[20px]">fingerprint</span>
                  <span>Huella / Face ID Corporativo</span>
                </button>
              </div>
            </form>

            {/* Portal Conductor Switcher */}
            <div className="pt-5 mt-5 border-t border-outline-variant/30 flex items-center justify-between text-xs">
              <span className="text-on-surface-variant">¿Eres conductor o propietario?</span>
              <button
                onClick={() => setActivePortal('conductor')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary-container/40 hover:bg-secondary-container text-on-secondary-container font-semibold transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">badge</span>
                <span>Cambiar a Portal Conductor</span>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Institucional de Auditoría */}
      <footer className="w-full py-4 text-center font-body-sm text-body-sm text-on-surface-variant/70 border-t border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-on-surface-variant/70">
          <div>© 2025 Cootransvig S.A.S. • Terminales Cesar y Guajira</div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSupportModal(true)} className="hover:text-primary transition-colors hover:underline">
              Soporte TI
            </button>
            <span>•</span>
            <a className="hover:text-primary transition-colors hover:underline" href="#privacidad">
              Privacidad
            </a>
            <span>•</span>
            <span>NIT: 892.300.541-2</span>
          </div>
        </div>
      </footer>

      {/* Support TI Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-sm w-full border border-outline-variant shadow-xl">
            <h3 className="font-headline-sm text-base font-bold text-on-surface">Soporte Técnico Operativo</h3>
            <p className="font-body-sm text-xs text-on-surface-variant mt-1">
              Plataforma de Despacho e Interconexión Cootransvig con RUNT y MinTransporte.
            </p>
            <div className="mt-4 space-y-2 text-xs">
              <div className="p-3 bg-surface-container-low rounded-lg">
                <span className="text-on-surface-variant block">Mesa de Ayuda TI:</span>
                <strong className="text-primary">soporte@cootransvig.com.co</strong>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg">
                <span className="text-on-surface-variant block">Central Satelital 24 Horas:</span>
                <strong className="text-primary">(+57) 605 574 8920</strong>
              </div>
            </div>
            <button
              onClick={() => setShowSupportModal(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Biometric Modal */}
      {showBiometricModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-xs w-full text-center border border-outline-variant shadow-xl animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-secondary-container text-secondary flex items-center justify-center mx-auto mb-3 animate-pulse">
              <span className="material-symbols-outlined text-4xl">fingerprint</span>
            </div>
            <h3 className="font-headline-sm text-sm font-bold text-on-surface">Autenticación Corporativa</h3>
            <p className="font-body-sm text-xs text-on-surface-variant mt-1">
              Validando credenciales biométricas del despachador en Base {base}...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
