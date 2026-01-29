import { useEffect, useState } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import VideoPlayer from './components/VideoPlayer';
import CTASection from './components/CTASection';

function App() {
  const [videoStarted, setVideoStarted] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'auto';
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-3 sm:px-6 lg:px-8 py-0 sm:py-2 lg:py-4">
        <div className="max-w-6xl mx-auto space-y-3 sm:space-y-6 lg:space-y-8">
          <HeroSection />
          <VideoPlayer onVideoStart={() => setVideoStarted(true)} />
          {videoStarted && <CTASection />}
        </div>
      </main>

      <div className="h-8 sm:h-12"></div>
    </div>
  );
}

export default App;
