import React, { useEffect, useRef, useState } from 'react';

interface Benefit {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const BenefitsTimeline: React.FC = () => {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const [timelineProgress, setTimelineProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const benefits: Benefit[] = [
    {
      id: 'cheaper',
      icon: (
        <svg className="w-8 h-8 lg:w-10 lg:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      title: 'Más baratos',
      description: 'Paga hasta un 30% menos que en España y ahorra miles de euros en tu coche.',
      delay: 0.2
    },
    {
      id: 'variety',
      icon: (
        <svg className="w-8 h-8 lg:w-10 lg:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      title: 'Más oferta',
      description: 'Accede al enorme mercado alemán con modelos y configuraciones que aquí ni existen.',
      delay: 0.4
    },
    {
      id: 'equipment',
      icon: (
        <svg className="w-8 h-8 lg:w-10 lg:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Mejor equipamiento',
      description: 'Consigue coches con extras y mejor historial de mantenimiento.',
      delay: 0.6
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-benefit-id');
            if (id) {
              setVisibleItems(prev => new Set([...prev, id]));
            }
          }
        });
      },
      { 
        threshold: 0.3,
        rootMargin: '-50px 0px'
      }
    );

    // Observe benefit items
    const benefitElements = document.querySelectorAll('[data-benefit-id]');
    benefitElements.forEach(el => observer.observe(el));

    // Timeline progress observer
    const timelineObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const rect = entry.boundingClientRect;
            const windowHeight = window.innerHeight;
            const progress = Math.min(Math.max((windowHeight - rect.top) / windowHeight, 0), 1);
            setTimelineProgress(progress);
          }
        });
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    if (timelineRef.current) {
      timelineObserver.observe(timelineRef.current);
    }

    return () => {
      observer.disconnect();
      timelineObserver.disconnect();
    };
  }, []);

  return (
    <section className="py-12 lg:py-16 relative overflow-hidden">
      {/* Background decorations */}
      {/* Fondo dinámico mejorado */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-black"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30"></div>
      
      {/* Elementos decorativos animados */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      {/* Patrón de puntos */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10" ref={sectionRef}>
        {/* Section Header */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-700 rounded-3xl mb-8 shadow-2xl shadow-blue-500/40 animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-2xl lg:text-4xl font-black text-white mb-4 leading-tight">
            La Oportunidad de{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">
              Alemania
            </span>
          </h2>
          <p className="text-base lg:text-lg text-blue-100/90 max-w-2xl mx-auto leading-relaxed">
Descubre por qué cada vez más personas compran su coche en Alemania.          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-200 mx-auto mt-4 rounded-full animate-pulse"></div>
        </div>

        {/* Mobile Timeline (Vertical) */}
        <div className="lg:hidden relative" ref={timelineRef}>
          {/* Animated Timeline Line */}
          <div className="absolute left-8 top-0 w-0.5 h-full bg-white/20 rounded-full">
            <div 
              className="w-full bg-gradient-to-b from-blue-400 to-blue-600 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-blue-500/25"
              style={{ height: `${timelineProgress * 100}%` }}
            ></div>
          </div>

          {/* Timeline Items */}
          <div className="space-y-8">
            {benefits.map((benefit, _index) => (
              <div
                key={benefit.id}
                data-benefit-id={benefit.id}
                className={`relative flex items-start space-x-6 transition-all duration-700 ease-out ${
                  visibleItems.has(benefit.id)
                    ? 'opacity-100 translate-x-0'
                    : `opacity-0 ${_index % 2 === 0 ? '-translate-x-8' : 'translate-x-8'}`
                }`}
                style={{ transitionDelay: `${benefit.delay}s` }}
              >
                {/* Timeline Node */}
                <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-500 ${
                  visibleItems.has(benefit.id)
                    ? 'bg-gradient-to-r from-blue-500 to-blue-700 scale-100 shadow-lg shadow-blue-500/25'
                    : 'bg-white/20 scale-75'
                }`}>
                  <div className={`text-white transition-all duration-300 ${
                    visibleItems.has(benefit.id) ? 'scale-100' : 'scale-75'
                  }`}>
                    {benefit.icon}
                  </div>
                  
                  {/* Pulse effect */}
                  {visibleItems.has(benefit.id) && (
                    <div className="absolute inset-0 rounded-xl bg-blue-500 animate-ping opacity-20"></div>
                  )}
                </div>

                {/* Content Card */}
                <div className={`flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:border-blue-300 ${
                  visibleItems.has(benefit.id) ? 'translate-y-0' : 'translate-y-4'
                }`}>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-blue-100/80 leading-relaxed text-sm">
                    {benefit.description}
                  </p>
                  
                  {/* Decorative element */}
                  <div className="mt-3 w-8 h-0.5 bg-gradient-to-r from-blue-400 to-blue-200 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Timeline (Horizontal) */}
        <div className="hidden lg:block relative" ref={timelineRef}>
          {/* Horizontal Timeline Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/20 rounded-full transform -translate-y-1/2">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-blue-500/25"
              style={{ width: `${timelineProgress * 100}%` }}
            ></div>
          </div>

          {/* Timeline Items */}
          <div className="grid grid-cols-3 gap-8 relative z-10">
            {benefits.map((benefit, _index) => (
              <div
                key={benefit.id}
                data-benefit-id={benefit.id}
                className={`text-center transition-all duration-700 ease-out ${
                  visibleItems.has(benefit.id)
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${benefit.delay}s` }}
              >
                {/* Timeline Node */}
                <div className={`relative mx-auto mb-6 flex items-center justify-center w-16 h-16 rounded-xl transition-all duration-500 ${
                  visibleItems.has(benefit.id)
                    ? 'bg-gradient-to-r from-blue-500 to-blue-700 scale-100 shadow-lg shadow-blue-500/25'
                    : 'bg-white/20 scale-75'
                }`}>
                  <div className={`text-white transition-all duration-300 ${
                    visibleItems.has(benefit.id) ? 'scale-100' : 'scale-75'
                  }`}>
                    {benefit.icon}
                  </div>
                  
                  {/* Pulse effect */}
                  {visibleItems.has(benefit.id) && (
                    <div className="absolute inset-0 rounded-xl bg-blue-500 animate-ping opacity-20"></div>
                  )}
                </div>

                {/* Content Card */}
                <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:border-blue-300 hover:scale-105 ${
                  visibleItems.has(benefit.id) ? 'translate-y-0' : 'translate-y-4'
                }`}>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-blue-100/80 leading-relaxed">
                    {benefit.description}
                  </p>
                  
                  {/* Decorative element */}
                  <div className="mt-4 w-12 h-0.5 bg-gradient-to-r from-blue-400 to-blue-200 rounded-full mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-8 lg:mt-12">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 text-blue-300 font-semibold">
                <span>¿Listo para aprovechar estas ventajas?</span>
                <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div> 
            
            {/* Botón CTA prominente */}
            <button 
              onClick={() => window.open('http://form.typeform.com/to/o2fPnvxI?fbclid=PAZXh0bgNhZW0CMTEAAafp2FWzXRVZGp1EZBq8DCDeiypuGbV3cZPrLkbeZX0c4TH7kM14ru_bJjESyQ_aem_zcoC4ZfCzDT0QgfVvDKFiw&typeform-source=l.instagram.com', '_blank')}
              className="premium-cta group relative overflow-hidden bg-gradient-to-r from-[#0029D4] to-blue-600 hover:from-blue-500 hover:to-[#0029D4] text-white px-8 py-4 rounded-xl font-bold transition-all duration-500 shadow-xl hover:shadow-blue-500/50 hover:scale-105 hover:-translate-y-2 border-2 border-blue-400/50 text-lg"
            >
              <span className="relative z-10 flex items-center justify-center space-x-2">
                <span>SOLICITAR TU COCHE AHORA</span>
                <svg className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
            </button>
            
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsTimeline;