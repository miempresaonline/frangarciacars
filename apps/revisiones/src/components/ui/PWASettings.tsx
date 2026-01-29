import { useState, useEffect } from 'react';
import { Download, CheckCircle, AlertCircle, Wifi, WifiOff, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type InstallOS = 'ios' | 'android' | 'windows' | 'macos' | 'generic';

export function PWASettings() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [detectOS, setDetectOS] = useState<InstallOS>('generic');

  useEffect(() => {
    const detectDeviceOS = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) {
        setDetectOS('ios');
      } else if (/android/.test(userAgent)) {
        setDetectOS('android');
      } else if (/windows/.test(userAgent)) {
        setDetectOS('windows');
      } else if (/macintosh|mac os x/.test(userAgent)) {
        setDetectOS('macos');
      }
    };

    detectDeviceOS();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast.success('Aplicación instalada correctamente');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    const checkInstalledStatus = async () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    checkInstalledStatus();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
          setIsInstalled(true);
          toast.success('¡Aplicación instalada! Ahora puedes usarla sin conexión.');
        }

        setDeferredPrompt(null);
      } catch (err) {
        console.error('Error installing PWA:', err);
        toast.error('Error al instalar la aplicación');
      }
    } else if (detectOS === 'ios') {
      setShowIOSInstructions(true);
    } else {
      setShowIOSInstructions(true);
    }
  };

  return (
    <div className="space-y-6">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl sm:text-4xl font-bold text-automotive-navy-900"
      >
        Configuración PWA
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
      >
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {isOnline ? (
                <Wifi className="w-8 h-8 text-green-500" />
              ) : (
                <WifiOff className="w-8 h-8 text-amber-500" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Estado de Conexión</h3>
              <p className={`text-sm mt-1 ${isOnline ? 'text-green-600' : 'text-amber-600'}`}>
                {isOnline
                  ? 'Estás conectado a internet'
                  : 'Trabajando sin conexión - usando datos guardados localmente'}
              </p>
            </div>
          </div>

          <hr />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Aplicación Móvil</h3>
            <p className="text-sm text-gray-600">
              Instala la aplicación en tu dispositivo para acceder sin conexión a internet. Los cambios se sincronizarán automáticamente cuando recuperes la conexión.
            </p>

            {isInstalled ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4"
              >
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-900">Aplicación instalada</p>
                  <p className="text-sm text-green-700">Puedes usar la aplicación offline</p>
                </div>
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                <Download size={20} />
                Instalar Aplicación
              </motion.button>
            )}
          </div>

          <hr />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Funcionalidades Offline</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                Acceso a revisiones asignadas
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                Completar checklist sin conexión
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                Capturar fotos y videos
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                Sincronización automática al conectar
              </li>
            </ul>
          </div>

          <hr />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Nota:</span> Los datos se almacenan localmente en tu dispositivo y se sincronizan automáticamente cuando recuperes la conexión a internet.
            </p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showIOSInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowIOSInstructions(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Instalar Aplicación</h2>
                <button
                  onClick={() => setShowIOSInstructions(false)}
                  className="p-2 hover:bg-blue-500 rounded-lg transition"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {detectOS === 'ios' ? (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-900 font-semibold mb-3">
                        Sigue estos pasos para instalar en tu iPhone/iPad:
                      </p>
                      <ol className="space-y-2 text-sm text-blue-800">
                        <li className="flex gap-2">
                          <span className="font-bold flex-shrink-0">1.</span>
                          <span>Toca el icono Compartir (cuadrado con flecha)</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold flex-shrink-0">2.</span>
                          <span>Desplázate y selecciona "Añadir a pantalla de inicio"</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold flex-shrink-0">3.</span>
                          <span>Dale un nombre (por ej: "Revisiones")</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold flex-shrink-0">4.</span>
                          <span>Toca "Añadir" en la esquina superior derecha</span>
                        </li>
                      </ol>
                    </div>
                  </>
                ) : detectOS === 'android' ? (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-900 font-semibold mb-3">
                        Sigue estos pasos para instalar en tu dispositivo Android:
                      </p>
                      <ol className="space-y-2 text-sm text-blue-800">
                        <li className="flex gap-2">
                          <span className="font-bold flex-shrink-0">1.</span>
                          <span>Toca el menú (⋮) en la esquina superior</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold flex-shrink-0">2.</span>
                          <span>Selecciona "Instalar aplicación"</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold flex-shrink-0">3.</span>
                          <span>Confirma en la ventana que aparece</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold flex-shrink-0">4.</span>
                          <span>La aplicación aparecerá en tu pantalla de inicio</span>
                        </li>
                      </ol>
                    </div>
                  </>
                ) : detectOS === 'windows' ? (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-900 font-semibold mb-3">
                        Sigue estos pasos para instalar en Windows:
                      </p>
                      <ol className="space-y-2 text-sm text-blue-800">
                        <li className="flex gap-2">
                          <span className="font-bold flex-shrink-0">1.</span>
                          <span>Toca el icono Instalar (⬇ en la barra de direcciones)</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold flex-shrink-0">2.</span>
                          <span>Espera a que se descargue e instale</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold flex-shrink-0">3.</span>
                          <span>La aplicación se abrirá automáticamente</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold flex-shrink-0">4.</span>
                          <span>Encuentra el acceso directo en tu Menú Inicio</span>
                        </li>
                      </ol>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-900 font-semibold mb-3">
                        Para instalar esta aplicación:
                      </p>
                      <ol className="space-y-2 text-sm text-blue-800">
                        <li className="flex gap-2">
                          <span className="font-bold flex-shrink-0">1.</span>
                          <span>Abre el menú del navegador (⋮ o ≡)</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold flex-shrink-0">2.</span>
                          <span>Busca la opción "Instalar" o "Install app"</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold flex-shrink-0">3.</span>
                          <span>Confirma la instalación</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold flex-shrink-0">4.</span>
                          <span>La aplicación estará lista para usar</span>
                        </li>
                      </ol>
                    </div>
                  </>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">
                    💡 Una vez instalada, podrás usar la aplicación sin conexión a internet. Los cambios se sincronizarán automáticamente.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex gap-3">
                <button
                  onClick={() => setShowIOSInstructions(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
