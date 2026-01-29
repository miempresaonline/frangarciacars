import { useEffect } from 'react';
import HeroSection from './components/HeroSection';
import VideoPlayer from './components/VideoPlayer';

function App() {
  useEffect(() => {
    document.body.style.overflow = 'auto';
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="flex justify-center pt-8 sm:pt-10 lg:pt-14 pb-3">
        <img
          src="/confirmacion-de-llamada/logo_transparente_v2.png"
          alt="FranGarciaCars Logo"
          className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto"
        />
      </div>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16 lg:space-y-20">
          <HeroSection />
          <VideoPlayer />
        </div>
      </main>

      <div className="h-12 sm:h-16"></div>
    </div>
  );
}

export default App;
