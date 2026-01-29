import { useEffect } from 'react';
import VideoPlayer from './components/VideoPlayer';

function App() {
  useEffect(() => {
    document.body.style.overflow = 'auto';
  }, []);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">
          <div className="flex justify-center fade-in">
            <img
              src="/formulario-completado/logo_transparente_v2.png"
              alt="Fran Cars Logo"
              className="w-32 sm:w-36 md:w-44 lg:w-48 h-auto hover:scale-105 transition-all duration-500"
            />
          </div>

          <div className="text-center fade-in" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-gray-900">
              Mira este vídeo para terminar la preinscripción
            </h1>
          </div>

          <VideoPlayer />
        </div>
      </main>

      <footer className="py-8 text-center text-xs sm:text-sm text-gray-700 px-4">
        <p className="max-w-4xl mx-auto leading-relaxed">
          Cualquier uso o copia de materiales del sitio web, elementos de diseño y diseño en general no está permitido sin un permiso por escrito del titular de los derechos de autor y solo con referencia a la fuente: <a href="https://frangarciacars.com" className="underline hover:text-gray-900 transition-colors font-medium" target="_blank" rel="noopener noreferrer">https://frangarciacars.com</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
