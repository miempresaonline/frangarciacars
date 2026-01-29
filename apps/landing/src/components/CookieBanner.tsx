import React, { useState, useEffect } from 'react';

interface CookiePreferences {
  necessary: boolean;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
}

export const CookieBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    preferences: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    } else {
      const savedPreferences = JSON.parse(consent);
      setPreferences(savedPreferences);
      applyConsent(savedPreferences);
    }
  }, []);

  const applyConsent = (prefs: CookiePreferences) => {
    if (prefs.analytics) {
      console.log('Analytics cookies enabled');
    } else {
      console.log('Analytics cookies disabled');
    }

    if (prefs.marketing) {
      console.log('Marketing cookies enabled');
    } else {
      console.log('Marketing cookies disabled');
    }
  };

  const saveConsent = (prefs: CookiePreferences) => {
    const consentData = {
      ...prefs,
      timestamp: new Date().toISOString(),
      version: '1.0',
    };
    localStorage.setItem('cookieConsent', JSON.stringify(consentData));
    applyConsent(prefs);
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      preferences: true,
      analytics: true,
      marketing: true,
    };
    saveConsent(allAccepted);
  };

  const rejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      preferences: false,
      analytics: false,
      marketing: false,
    };
    saveConsent(onlyNecessary);
  };

  const saveSettings = () => {
    saveConsent(preferences);
  };

  if (!showBanner) {
    return null;
  }

  if (showSettings) {
    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
            <h2 className="text-2xl font-bold text-gray-900">Configuración de Cookies</h2>
            <p className="text-sm text-gray-600 mt-2">
              Personaliza qué cookies deseas aceptar. Las cookies necesarias siempre están activas.
            </p>
          </div>

          <div className="px-6 py-6 space-y-4">
            <div className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 rounded-r">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Cookies Necesarias</h3>
                <span className="text-sm text-blue-600 font-semibold">Siempre activas</span>
              </div>
              <p className="text-sm text-gray-600">
                Estas cookies son esenciales para el funcionamiento del sitio web y no pueden ser desactivadas.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Cookies de Preferencias</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.preferences}
                    onChange={(e) => setPreferences({ ...preferences, preferences: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <p className="text-sm text-gray-600">
                Permiten recordar tus preferencias y mejorar tu experiencia de navegación.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Cookies Analíticas</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <p className="text-sm text-gray-600">
                Nos ayudan a entender cómo utilizas el sitio para poder mejorarlo (Google Analytics).
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Cookies de Marketing</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <p className="text-sm text-gray-600">
                Permiten mostrar publicidad personalizada basada en tus intereses.
              </p>
            </div>
          </div>

          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
            <button
              onClick={saveSettings}
              className="flex-1 bg-gradient-to-r from-royal-blue to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              Guardar preferencias
            </button>
            <button
              onClick={() => setShowSettings(false)}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-4 border-royal-blue shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-3xl">🍪</span>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Este sitio utiliza cookies</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Utilizamos cookies propias y de terceros para analizar nuestros servicios y mostrarte publicidad
                  relacionada con tus preferencias. Puedes aceptar todas las cookies, rechazarlas o configurar
                  tus preferencias.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  <strong>Responsable:</strong> Fran García Cars |{' '}
                  <strong>Finalidad:</strong> Mejorar la experiencia del usuario y analítica web |{' '}
                  <strong>Derechos:</strong> Acceso, rectificación, supresión, entre otros |{' '}
                  Más información en nuestra Política de Cookies
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={acceptAll}
              className="bg-gradient-to-r from-royal-blue to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 whitespace-nowrap"
            >
              Aceptar todas
            </button>
            <button
              onClick={rejectAll}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors whitespace-nowrap"
            >
              Rechazar todas
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="border-2 border-royal-blue text-royal-blue px-6 py-3 rounded-xl font-semibold hover:bg-royal-blue hover:text-white transition-all duration-300 whitespace-nowrap"
            >
              Configurar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
