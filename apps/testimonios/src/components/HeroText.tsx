import React from 'react';
import { useState, useEffect, useRef } from 'react';
import MobileCarousel from './MobileCarousel';

const HeroText: React.FC = () => {
  const [typedText, setTypedText] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const fullText = '+100 clientes ya confiaron en nosotros';

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={heroRef} className="relative">
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 lg:space-y-10">

        {/* Título Principal */}
        <div
          className={`relative w-full lg:w-auto transition-all duration-1500 ease-out ${
            isVisible
              ? 'opacity-100 translate-x-0 rotate-0'
              : 'opacity-0 -translate-x-32 -rotate-2'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          <div className="relative inline-block">
            <div className="hidden lg:block absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-white to-blue-400 rounded-full"></div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-tight lg:pl-6">
              <span className="block mb-2 text-blue-300 text-lg sm:text-xl lg:text-base xl:text-lg font-semibold tracking-wider uppercase opacity-80">
                {typedText}
                <span className="animate-pulse">|</span>
              </span>

              <span className="block transform hover:scale-105 transition-transform duration-300 lg:origin-left">
                Tu coche hasta
              </span>

              <span className="block relative">
                <span className="relative z-10 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent animate-shimmer">
                  30% menos
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl"></div>
              </span>

              <span className="block text-blue-200/90 transform hover:scale-105 transition-transform duration-300 lg:origin-left">
                que en España
              </span>
            </h1>
          </div>
        </div>

        {/* Separador decorativo - Solo desktop */}
        <div
          className={`hidden lg:block w-32 h-1 bg-gradient-to-r from-blue-500 via-white to-transparent rounded-full transition-all duration-1000 ${
            isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
          }`}
          style={{ transitionDelay: '300ms', transformOrigin: 'left' }}
        ></div>

        {/* CTA Principal - Visible en móvil antes del slider */}
        <div
          className={`lg:hidden w-full transition-all duration-1000 ease-out ${
            isVisible
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 -translate-x-20'
          }`}
          style={{ transitionDelay: '300ms' }}
        >
          <div className="relative group max-w-2xl mx-auto lg:mx-0">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 rounded-xl lg:rounded-2xl blur-lg lg:blur-xl opacity-60 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105 animate-pulse"></div>

            <button
              onClick={() => window.open('http://form.typeform.com/to/o2fPnvxI?fbclid=PAZXh0bgNhZW0CMTEAAafp2FWzXRVZGp1EZBq8DCDeiypuGbV3cZPrLkbeZX0c4TH7kM14ru_bJjESyQ_aem_zcoC4ZfCzDT0QgfVvDKFiw&typeform-source=l.instagram.com', '_blank')}
              className="relative w-full bg-gradient-to-r from-[#0029D4] to-blue-600 hover:from-blue-600 hover:to-[#0029D4] text-white px-8 py-6 lg:px-10 lg:py-6 rounded-xl lg:rounded-2xl font-black text-base lg:text-lg xl:text-xl transition-all duration-500 hover:scale-105 active:scale-95 border-2 border-white/30 hover:border-white/60 shadow-2xl overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-3 lg:gap-4">
                <span>QUIERO MI COCHE ALEMÁN</span>
                <svg className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-2 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>

              <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover:left-full transition-all duration-700"></div>
            </button>
          </div>

          <div className="mt-4 lg:mt-5 flex items-center justify-center lg:justify-start gap-2 lg:gap-3 text-white/80 text-sm lg:text-base">
            <div className="flex gap-1">
              <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 bg-green-400 rounded-full animate-ping"></div>
              <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="font-semibold lg:font-bold">Respuesta en 24h</span>
          </div>
        </div>

        {/* Slider - Solo móvil, después del CTA */}
        <div
          className={`lg:hidden w-full transition-all duration-1200 ease-out ${
            isVisible
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-20 scale-90'
          }`}
          style={{ transitionDelay: '500ms' }}
        >
          <MobileCarousel />
        </div>

        {/* CTA Principal - Solo desktop */}
        <div
          className={`hidden lg:block w-full transition-all duration-1000 ease-out ${
            isVisible
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 -translate-x-20'
          }`}
          style={{ transitionDelay: '700ms' }}
        >
          <div className="relative group max-w-2xl mx-auto lg:mx-0">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 rounded-xl lg:rounded-2xl blur-lg lg:blur-xl opacity-60 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105 animate-pulse"></div>

            <button
              onClick={() => window.open('http://form.typeform.com/to/o2fPnvxI?fbclid=PAZXh0bgNhZW0CMTEAAafp2FWzXRVZGp1EZBq8DCDeiypuGbV3cZPrLkbeZX0c4TH7kM14ru_bJjESyQ_aem_zcoC4ZfCzDT0QgfVvDKFiw&typeform-source=l.instagram.com', '_blank')}
              className="relative w-full bg-gradient-to-r from-[#0029D4] to-blue-600 hover:from-blue-600 hover:to-[#0029D4] text-white px-8 py-6 lg:px-10 lg:py-6 rounded-xl lg:rounded-2xl font-black text-base lg:text-lg xl:text-xl transition-all duration-500 hover:scale-105 active:scale-95 border-2 border-white/30 hover:border-white/60 shadow-2xl overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-3 lg:gap-4">
                <span>QUIERO MI COCHE ALEMÁN</span>
                <svg className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-2 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>

              <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover:left-full transition-all duration-700"></div>
            </button>
          </div>

          <div className="mt-4 lg:mt-5 flex items-center justify-center lg:justify-start gap-2 lg:gap-3 text-white/80 text-sm lg:text-base">
            <div className="flex gap-1">
              <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 bg-green-400 rounded-full animate-ping"></div>
              <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="font-semibold lg:font-bold">Respuesta en 24h</span>
          </div>
        </div>

        {/* Propuesta de Valor - Visible en ambas versiones */}
        <div
          className={`flex flex-col gap-4 w-full transition-all duration-1000 ease-out ${
            isVisible
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 -translate-x-20'
          }`}
          style={{ transitionDelay: '900ms' }}
        >
          <div className="relative group">
            <div className="hidden lg:block absolute -left-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-400 rounded-full group-hover:scale-150 transition-transform duration-300"></div>

            <div className="bg-white/5 backdrop-blur-xl border-l-4 border-green-400 rounded-r-xl px-6 py-4 hover:bg-white/10 transition-all duration-300 lg:hover:translate-x-2">
              <p className="text-white font-bold text-base flex items-center gap-3">
                <svg className="w-6 h-6 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Más de 100 personas ya lo han conseguido</span>
              </p>
            </div>
          </div>

          <div className="relative group">
            <div className="hidden lg:block absolute -left-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-400 rounded-full group-hover:scale-150 transition-transform duration-300"></div>

            <div className="bg-white/5 backdrop-blur-xl border-l-4 border-blue-400 rounded-r-xl px-6 py-4 hover:bg-white/10 transition-all duration-300 lg:hover:translate-x-2">
              <p className="text-white font-bold text-base flex items-center gap-3">
                <svg className="w-6 h-6 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Ahora queremos hacerlo contigo</span>
              </p>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-shimmer {
          background-size: 200% 200%;
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default HeroText;
