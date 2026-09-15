import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const ConductorLogin: React.FC = () => {
  const { loginConductor, setActivePortal, drivers, setDriverId: setGlobalDriverId, setDriverName } = useApp();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [driverId, setDriverId] = useState('OP-7420');
  const [pin, setPin] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  // Registration state
  const [regName, setRegName] = useState('');
  const [regDni, setRegDni] = useState('');
  const [regLicense, setRegLicense] = useState('C1');
  const [regPhone, setRegPhone] = useState('');
  const [regSubmitted, setRegSubmitted] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginConductor(driverId, pin);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegSubmitted(true);
    setTimeout(() => {
      setRegSubmitted(false);
      setTab('login');
      setDriverId(regDni || 'OP-8492');
      setNotificationMessage('¡Solicitud registrada! Inicia sesión para acceder a tu turno.');
    }, 1800);
  };

  const handleBiometricAuth = () => {
    setShowBiometricModal(true);
    setTimeout(() => {
      setShowBiometricModal(false);
      loginConductor('OP-7420', '123456');
    }, 1500);
  };

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col justify-between selection:bg-secondary-container selection:text-on-secondary-container">
      {/* TopAppBar: Brand & Operational Header */}
      <header className="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-margin md:px-margin-desktop h-14 bg-surface-container-lowest/90 backdrop-blur-md shadow-sm border-b border-outline-variant">
        <div className="flex items-center gap-space-sm">
          <div className="w-9 h-9 rounded-lg bg-primary text-on-primary flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[20px]">directions_car</span>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface tracking-tight">
              Cootransvig Conductor
            </span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full font-label-badge text-label-badge bg-surface-container-high text-secondary font-semibold ml-1 uppercase">
              OPERACIONES
            </span>
          </div>
        </div>

        {/* Right Controls: Dispatch Support & System Status */}
        <div className="flex items-center gap-space-sm">
          <button
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors duration-150 font-label-data text-label-data"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">support_agent</span>
            <span className="hidden md:inline">Mesa de Ayuda</span>
          </button>
          <button
            onClick={() => setNotificationMessage('Sistema operativo en línea. Ruta Villanueva ⇄ Valledupar habilitada.')}
            aria-label="Notificaciones del sistema"
            className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-transform active:scale-95 duration-150 relative"
            type="button"
          >
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full"></span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow pt-20 pb-12 px-margin md:px-margin-tablet lg:px-margin-desktop max-w-5xl mx-auto w-full flex flex-col justify-center items-center">
        {/* Flash notification if any */}
        {notificationMessage && (
          <div className="w-full max-w-xl mb-4 p-3 bg-secondary-container text-on-secondary-container rounded-xl flex items-center justify-between border border-secondary/30 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">info</span>
              <span className="font-body-sm text-xs font-semibold">{notificationMessage}</span>
            </div>
            <button
              onClick={() => setNotificationMessage(null)}
              className="text-on-secondary-container hover:opacity-75 p-1"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {/* Hero / Status Banner */}
        <div className="w-full max-w-xl text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high text-secondary mb-3 border border-secondary/20 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim animate-pulse"></span>
            <span className="font-label-badge text-label-badge tracking-wider uppercase font-bold text-on-secondary-container">
              Servicio Especial Intermunicipal • Villanueva - Valledupar
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-primary font-extrabold tracking-tight">
            Acceso a Turno Operativo
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1.5">
            Conecta con tu camioneta o vehículo especial y sincroniza tu hoja de ruta del día.
          </p>
        </div>

        {/* Main Card Container */}
        <div className="w-full max-w-xl bg-surface-container-lowest rounded-xl border border-outline-variant shadow-md overflow-hidden">
          {/* Interactive Segmented Tab Selector */}
          <div className="grid grid-cols-2 p-1.5 bg-surface-container-low border-b border-outline-variant gap-1">
            <button
              onClick={() => setTab('login')}
              className={`py-2.5 px-4 rounded-lg font-headline-sm text-[14px] transition-all duration-200 flex items-center justify-center gap-2 ${
                tab === 'login'
                  ? 'bg-surface-container-lowest text-primary shadow-xs font-bold border border-outline-variant/40'
                  : 'text-on-surface-variant hover:text-on-surface font-medium'
              }`}
              id="tab-login"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">badge</span>
              <span>Iniciar Sesión</span>
            </button>
            <button
              onClick={() => setTab('register')}
              className={`py-2.5 px-4 rounded-lg font-headline-sm text-[14px] transition-all duration-200 flex items-center justify-center gap-2 ${
                tab === 'register'
                  ? 'bg-surface-container-lowest text-primary shadow-xs font-bold border border-outline-variant/40'
                  : 'text-on-surface-variant hover:text-on-surface font-medium'
              }`}
              id="tab-register"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>Nuevo Registro</span>
            </button>
          </div>

          <div className="p-space-lg sm:p-8">
            {tab === 'login' ? (
              /* PANEL LOGIN */
              <div className="space-y-4" id="panel-login">
                <form className="space-y-4" onSubmit={handleLoginSubmit}>
                  <div className="space-y-1.5">
                    <label
                      className="font-headline-sm text-body-md text-on-surface font-semibold flex items-center justify-between"
                      htmlFor="driver-id"
                    >
                      <span>Cédula o ID de Conductor</span>
                      <span className="text-on-surface-variant font-label-data text-[12px] font-normal">
                        Ej. OP-7420 o CC
                      </span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px]">
                        badge
                      </span>
                      <input
                        className="w-full h-12 pl-11 pr-4 bg-surface-container-low/60 rounded-lg border border-outline-variant text-on-surface placeholder:text-outline font-body-md text-body-md focus:border-secondary focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 transition-all outline-none"
                        id="driver-id"
                        placeholder="Ingresa tu identificación o carnet"
                        required
                        type="text"
                        value={driverId}
                        onChange={(e) => setDriverId(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        className="font-headline-sm text-body-md text-on-surface font-semibold"
                        htmlFor="driver-pin"
                      >
                        Contraseña / PIN de acceso
                      </label>
                      <button
                        type="button"
                        onClick={() => setNotificationMessage('Para restablecer tu PIN operativo acércate a taquilla o contacta a Mesa de Ayuda.')}
                        className="font-body-sm text-body-sm text-secondary hover:underline font-semibold"
                      >
                        ¿Olvidaste tu PIN?
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px]">
                        lock
                      </span>
                      <input
                        className="w-full h-12 pl-11 pr-11 bg-surface-container-low/60 rounded-lg border border-outline-variant text-on-surface placeholder:text-outline font-body-md text-body-md focus:border-secondary focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 transition-all outline-none tracking-wider"
                        id="driver-pin"
                        placeholder="Introduce tu PIN de 6 dígitos"
                        required
                        type={showPassword ? 'text' : 'password'}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                      />
                      <button
                        aria-label="Ver u ocultar contraseña"
                        className="absolute right-3 p-1 text-on-surface-variant hover:text-on-surface focus:outline-none"
                        onClick={() => setShowPassword(!showPassword)}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-outline text-secondary focus:ring-secondary/20 bg-surface-container-low"
                        id="remember-unit"
                        type="checkbox"
                      />
                      <span className="font-body-sm text-body-sm text-on-surface-variant select-none">
                        Recordar credencial
                      </span>
                    </label>
                    <div className="flex items-center gap-1 text-secondary font-label-badge text-label-badge font-semibold">
                      <span className="material-symbols-outlined text-[16px]">verified_user</span>
                      <span>Acceso Seguro</span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      className="w-full h-12 bg-primary text-on-primary rounded-lg font-headline-sm text-[15px] font-bold flex items-center justify-center gap-2 hover:bg-primary-container active:scale-[0.99] transition-all shadow-sm cursor-pointer"
                      type="submit"
                    >
                      <span>Ingresar como Conductor</span>
                      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </button>
                  </div>
                </form>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-outline-variant"></div>
                  <span className="flex-shrink mx-4 font-label-badge text-label-badge text-outline uppercase tracking-wider">
                    Otras Opciones
                  </span>
                  <div className="flex-grow border-t border-outline-variant"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={handleBiometricAuth}
                    className="w-full h-11 bg-surface-container-low border border-outline-variant hover:bg-surface-container text-on-surface rounded-lg font-headline-sm text-[13px] font-semibold flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-secondary text-[20px]">fingerprint</span>
                    <span>Huella / Face ID</span>
                  </button>
                  <button
                    onClick={() => loginConductor('INVITADO-1', '000000')}
                    className="w-full h-11 bg-surface-container-low border border-outline-variant hover:bg-surface-container text-on-surface rounded-lg font-headline-sm text-[13px] font-semibold flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-secondary text-[20px]">person_outline</span>
                    <span>Ingresar como Invitado</span>
                  </button>
                </div>

                <div className="pt-2 text-center">
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    ¿Nuevo conductor?{' '}
                    <button
                      className="text-secondary font-semibold hover:underline cursor-pointer"
                      onClick={() => setTab('register')}
                      type="button"
                    >
                      Crear cuenta / Registrarme
                    </button>
                  </p>
                </div>

                {/* Quick portal switch */}
                <div className="mt-4 pt-4 border-t border-outline-variant flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant font-medium">¿Eres despachador o administrador?</span>
                  <button
                    onClick={() => setActivePortal('admin')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container text-primary font-bold transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                    <span>Ir al Portal Admin</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  </button>
                </div>
              </div>
            ) : (
              /* PANEL REGISTER */
              <div className="space-y-4" id="panel-register">
                <div className="p-3.5 bg-surface-container-low rounded-lg border border-outline-variant flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary text-[22px]">info</span>
                  <div className="text-left">
                    <p className="font-headline-sm text-body-md text-on-surface font-semibold">
                      Registro de Conductor Cootransvig
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Crea tu cuenta de operador para acceder a turnos y asignación vehicular.
                    </p>
                  </div>
                </div>

                {regSubmitted ? (
                  <div className="py-8 text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-secondary-container text-secondary flex items-center justify-center mx-auto animate-bounce">
                      <span className="material-symbols-outlined text-3xl">check</span>
                    </div>
                    <p className="font-headline-sm text-sm font-bold text-primary">
                      ¡Solicitud enviada a la Central Cootransvig!
                    </p>
                    <p className="font-body-sm text-xs text-on-surface-variant">
                      Un supervisor validará tu licencia y FUEC en breve. Redirigiendo a inicio de sesión...
                    </p>
                  </div>
                ) : (
                  <form className="space-y-3" onSubmit={handleRegisterSubmit}>
                    <div className="space-y-1">
                      <label className="font-headline-sm text-body-md text-on-surface font-semibold" htmlFor="reg-name">
                        Nombres y Apellidos
                      </label>
                      <input
                        className="w-full h-11 px-3.5 bg-surface-container-low/60 rounded-lg border border-outline-variant font-body-md text-body-md focus:border-secondary focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 outline-none"
                        id="reg-name"
                        placeholder="Nombre completo según documento"
                        required
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-headline-sm text-body-md text-on-surface font-semibold" htmlFor="reg-dni">
                          Cédula de Ciudadanía
                        </label>
                        <input
                          className="w-full h-11 px-3.5 bg-surface-container-low/60 rounded-lg border border-outline-variant font-body-md text-body-md focus:border-secondary focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 outline-none"
                          id="reg-dni"
                          placeholder="Número de cédula"
                          required
                          type="text"
                          value={regDni}
                          onChange={(e) => setRegDni(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-headline-sm text-body-md text-on-surface font-semibold" htmlFor="reg-license">
                          Categoría de Licencia
                        </label>
                        <select
                          className="w-full h-11 px-3 bg-surface-container-low/60 rounded-lg border border-outline-variant font-body-md text-body-md text-on-surface focus:border-secondary focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 outline-none"
                          id="reg-license"
                          value={regLicense}
                          onChange={(e) => setRegLicense(e.target.value)}
                        >
                          <option value="C1">Categoría C1 (Camioneta / Especial)</option>
                          <option value="C2">Categoría C2 (Van / Microbús)</option>
                          <option value="C3">Categoría C3 (Bus / Articulado)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-headline-sm text-body-md text-on-surface font-semibold" htmlFor="reg-phone">
                        Teléfono Móvil
                      </label>
                      <input
                        className="w-full h-11 px-3.5 bg-surface-container-low/60 rounded-lg border border-outline-variant font-body-md text-body-md focus:border-secondary focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 outline-none"
                        id="reg-phone"
                        placeholder="+57 300 123 4567"
                        required
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        className="w-full h-12 bg-primary text-on-primary rounded-lg font-headline-sm text-[15px] font-bold flex items-center justify-center gap-2 hover:bg-primary-container active:scale-[0.99] transition-all shadow-sm cursor-pointer"
                        type="submit"
                      >
                        <span>Registrar y Solicitar Vinculación</span>
                        <span className="material-symbols-outlined text-[20px]">send</span>
                      </button>
                    </div>
                  </form>
                )}

                <div className="text-center pt-1">
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    ¿Ya tienes cuenta?{' '}
                    <button
                      className="text-secondary font-semibold hover:underline cursor-pointer"
                      onClick={() => setTab('login')}
                      type="button"
                    >
                      Iniciar sesión aquí
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Clean Corporate Footer */}
      <footer className="w-full bg-surface-container-lowest border-t border-outline-variant py-4 px-margin text-center">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-on-surface-variant font-body-sm text-body-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-secondary">shield</span>
            <span>© Cootransvig S.A.S. • Todos los derechos reservados</span>
          </div>
          <div className="flex items-center gap-4">
            <a className="hover:text-primary transition-colors" href="#terminos">
              Términos de Conducción
            </a>
            <span>•</span>
            <a className="hover:text-primary transition-colors" href="#privacidad">
              Privacidad
            </a>
          </div>
        </div>
      </footer>

      {/* Help Desk Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-sm w-full border border-outline-variant shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-surface-container-high text-primary flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-2xl">support_agent</span>
            </div>
            <h3 className="font-headline-sm text-base font-bold text-on-surface">Mesa de Ayuda Cootransvig</h3>
            <p className="font-body-sm text-xs text-on-surface-variant mt-1">
              Atención a conductores 24/7 en las terminales de Villanueva, San Juan y Valledupar.
            </p>
            <div className="mt-4 space-y-2">
              <a
                href="tel:018000912345"
                className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-bold text-xs"
              >
                <span>Línea Gratuita Nacional</span>
                <span className="font-label-data text-secondary">01 8000 912345</span>
              </a>
              <a
                href="tel:+573014589200"
                className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-bold text-xs"
              >
                <span>Despacho Villanueva</span>
                <span className="font-label-data text-secondary">+57 301 458 9200</span>
              </a>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Biometric Simulation Modal */}
      {showBiometricModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-xs w-full text-center border border-outline-variant shadow-xl animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-secondary-container text-secondary flex items-center justify-center mx-auto mb-3 animate-pulse">
              <span className="material-symbols-outlined text-4xl">fingerprint</span>
            </div>
            <h3 className="font-headline-sm text-sm font-bold text-on-surface">Sensor Biométrico Activo</h3>
            <p className="font-body-sm text-xs text-on-surface-variant mt-1">
              Verificando huella dactilar de conductor asignado en cabina...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
