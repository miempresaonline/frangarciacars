import Header from './components/Header';
import HeroContent from './components/HeroContent';
import BenefitsTimeline from './components/BenefitsTimeline';
import TestimonialsSection from './components/TestimonialsSection';
import AboutUsSection from './components/AboutUsSection';
import { Footer } from './components/Footer';
import { CookieBanner } from './components/CookieBanner';

function App() {
  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden scroll-smooth">
      <Header />

      <main id="hero" className="relative">
        <HeroContent />
      </main>

      <div id="benefits">
        <BenefitsTimeline />
      </div>

      <div id="testimonials">
        <TestimonialsSection />
      </div>

      <div id="about">
        <AboutUsSection />
      </div>

      <div id="contact" className="bg-gray-50 py-16 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            ¿Listo para tu próximo coche?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Contáctanos y te ayudaremos a encontrar el mejor precio
          </p>
          <button
            onClick={() => window.open('https://frangarciacars.com/sesion-estrategica', '_blank')}
            className="px-8 py-4 bg-[#0029D4] text-white text-lg font-semibold rounded-full hover:bg-blue-700 transition-colors duration-200"
          >
            Solicitar información
          </button>
        </div>
      </div>

      <Footer />
      <CookieBanner />
    </div>
  );
}

export default App;