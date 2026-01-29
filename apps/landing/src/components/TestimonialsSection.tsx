import React, { useEffect, useRef, useState } from 'react';
import ImageWithPlaceholder from './ImageWithPlaceholder';

interface Testimonial {
  id: string;
  name: string;
  city: string;
  image: string;
}

const TestimonialsSection: React.FC = () => {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const [displayCount, setDisplayCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);

  const desktopTestimonials: Testimonial[] = [
    { id: '1', name: 'Erick', city: 'Madrid', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/10.jpg' },
    { id: '13', name: 'Abdou', city: 'Barcelona', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/22.jpg' },
    { id: '14', name: 'Richar', city: 'Valencia', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/23.jpg' },
    { id: '19', name: 'David', city: 'Madrid', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/28.jpg' },
    { id: '31', name: 'Guillermo', city: 'Mallorca', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/40.jpg' },
    { id: '35', name: 'Aitor', city: 'País Vasco', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/44.jpg' },
    { id: '37', name: 'Darío', city: 'Valencia', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/46.jpg' },
    { id: '38', name: 'Toñy', city: 'Valencia', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/47.jpg' },
    { id: '39', name: 'Janice', city: 'Granada', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/48.jpg' },
    { id: '42', name: 'Iago', city: 'Valencia', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/51.jpg' },
    { id: '50', name: 'Xavier', city: 'Girona', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/59.jpg' },
    { id: '36', name: 'Rubén', city: 'Madrid', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/45.jpg' }
  ];

  const mobileTestimonials: Testimonial[] = [
    { id: '1', name: 'Erick', city: 'Madrid', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/10.jpg' },
    { id: '13', name: 'Abdou', city: 'Barcelona', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/22.jpg' },
    { id: '14', name: 'Richar', city: 'Valencia', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/23.jpg' },
    { id: '19', name: 'David', city: 'Madrid', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/28.jpg' },
    { id: '31', name: 'Guillermo', city: 'Mallorca', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/40.jpg' },
    { id: '35', name: 'Aitor', city: 'País Vasco', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/44.jpg' },
    { id: '37', name: 'Darío', city: 'Valencia', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/46.jpg' },
    { id: '39', name: 'Janice', city: 'Granada', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/48.jpg' },
    { id: '36', name: 'Rubén', city: 'Madrid', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/45.jpg' }
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const testimonials = isMobile ? mobileTestimonials : desktopTestimonials;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-testimonial-id');
            if (id) {
              setTimeout(() => {
                setVisibleItems(prev => new Set([...prev, id]));
              }, 100);
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px'
      }
    );

    const testimonialElements = document.querySelectorAll('[data-testimonial-id]');
    testimonialElements.forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [displayCount]);

  useEffect(() => {
    const loadMoreObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLoadingMore && displayCount < testimonials.length) {
            setIsLoadingMore(true);
            setTimeout(() => {
              setDisplayCount(prev => Math.min(prev + 12, testimonials.length));
              setIsLoadingMore(false);
            }, 300);
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '200px'
      }
    );

    if (loadMoreTriggerRef.current) {
      loadMoreObserver.observe(loadMoreTriggerRef.current);
    }

    return () => {
      loadMoreObserver.disconnect();
    };
  }, [displayCount, isLoadingMore, testimonials.length]);

  return (
    <section className="py-12 lg:py-20 bg-gradient-to-b from-white via-blue-50/30 to-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent"></div>
      <div className="absolute top-32 right-20 w-64 h-64 bg-blue-100/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-32 left-20 w-80 h-80 bg-royal-blue/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={sectionRef}>
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-royal-blue to-blue-600 rounded-2xl mb-6 shadow-2xl shadow-blue-500/25">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>

          <h2 className="text-3xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
            Resultados de{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-royal-blue to-blue-600">
              nuestros clientes
            </span>
          </h2>

          <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Más de 100 personas ya ahorraron miles de euros importando su coche alemán
          </p>

          <div className="w-24 h-1 bg-gradient-to-r from-royal-blue to-blue-600 mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-16">
          {testimonials.slice(0, displayCount).map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              isVisible={visibleItems.has(testimonial.id)}
              index={index}
              isPriority={index < 12}
            />
          ))}
        </div>

        {displayCount < testimonials.length && (
          <div
            ref={loadMoreTriggerRef}
            className="flex justify-center items-center py-8"
          >
            {isLoadingMore && (
              <div className="flex items-center space-x-3 text-royal-blue">
                <div className="w-6 h-6 border-3 border-royal-blue border-t-transparent rounded-full animate-spin"></div>
                <span className="font-semibold">Cargando más coches...</span>
              </div>
            )}
          </div>
        )}

        {displayCount >= testimonials.length && testimonials.length > 12 && (
          <div className="text-center py-6">
            <p className="text-gray-600 font-medium">Mostrando todos los {testimonials.length} ejemplos reales</p>
          </div>
        )}

        <div className="text-center mt-8">
          <a
            href="https://frangarciacars.com/testimonios"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-royal-blue hover:text-blue-600 transition-colors duration-300 group"
          >
            <span>Ver más testimonios</span>
            <svg
              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <div className="text-center mt-16 lg:mt-20 relative">
          <div className={`relative space-y-8 transition-all duration-1000 ${
            visibleItems.size >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="relative space-y-6">
              <div className="relative max-w-4xl mx-auto">
                <div className="absolute -inset-1 bg-gradient-to-r from-royal-blue via-blue-500 to-royal-blue rounded-2xl blur opacity-30 animate-pulse"></div>

                <div className="relative bg-gradient-to-br from-white via-blue-50/50 to-white backdrop-blur-xl border-2 border-royal-blue/20 rounded-2xl px-8 py-8 shadow-2xl">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-royal-blue/5 via-transparent to-blue-600/5 rounded-2xl"></div>

                  <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="group text-center transform hover:scale-110 transition-all duration-500">
                      <div className="relative inline-block mb-3">
                        <div className="absolute inset-0 bg-gradient-to-r from-royal-blue to-blue-600 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                        <div className="relative bg-gradient-to-br from-royal-blue to-blue-600 text-white w-20 h-20 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-royal-blue/20">
                          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="text-4xl lg:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-royal-blue to-blue-600 mb-1">100+</div>
                      <div className="text-sm font-bold text-gray-600 uppercase tracking-wider">Coches importados</div>
                      <div className="mt-2 h-1 w-16 mx-auto bg-gradient-to-r from-royal-blue to-blue-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                    </div>

                    <div className="group text-center transform hover:scale-110 transition-all duration-500" style={{ transitionDelay: '0.1s' }}>
                      <div className="relative inline-block mb-3">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                        <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 text-white w-20 h-20 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-green-500/20">
                          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="text-4xl lg:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-600 mb-1">20%</div>
                      <div className="text-sm font-bold text-gray-600 uppercase tracking-wider">Ahorro promedio</div>
                      <div className="mt-2 h-1 w-16 mx-auto bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                    </div>

                    <div className="group text-center transform hover:scale-110 transition-all duration-500" style={{ transitionDelay: '0.2s' }}>
                      <div className="relative inline-block mb-3">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                        <div className="relative bg-gradient-to-br from-amber-500 to-orange-600 text-white w-20 h-20 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-amber-500/20">
                          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      </div>
                      <div className="text-4xl lg:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600 mb-1">98%</div>
                      <div className="text-sm font-bold text-gray-600 uppercase tracking-wider">Satisfacción</div>
                      <div className="mt-2 h-1 w-16 mx-auto bg-gradient-to-r from-amber-500 to-orange-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                    </div>
                  </div>

                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-royal-blue to-transparent rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

interface TestimonialCardProps {
  testimonial: Testimonial;
  isVisible: boolean;
  index: number;
  isPriority: boolean;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial, isVisible, index, isPriority }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <>
      <div
        data-testimonial-id={testimonial.id}
        className={`group relative transition-all duration-700 perspective-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{ transitionDelay: `${(index % 6) * 100}ms` }}
        onMouseMove={handleMouseMove}
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-royal-blue via-blue-500 to-royal-blue rounded-3xl blur-sm opacity-0 group-hover:opacity-75 transition-all duration-700 animate-gradient-x"></div>

        <div className="absolute -inset-0.5 bg-gradient-to-r from-royal-blue/50 via-blue-400/50 to-royal-blue/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse-glow"></div>

        <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.08] hover:-translate-y-3 transform-gpu">
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-gradient-to-r from-royal-blue to-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>#{index + 1}</span>
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-br from-royal-blue/5 via-transparent to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div
            className="relative w-full aspect-[16/9] cursor-pointer overflow-hidden"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(0, 41, 212, 0.08), transparent 50%)`
            }}
          >
            <div className="absolute inset-0 border-4 border-transparent group-hover:border-white/30 transition-all duration-500 rounded-t-2xl"></div>

            <ImageWithPlaceholder
              src={testimonial.image}
              alt={`Testimonio de ${testimonial.name}`}
              className="w-full h-full object-contain bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 transform group-hover:scale-105 transition-transform duration-700"
              placeholderColor="#1a1a1a"
              onClick={() => setIsModalOpen(true)}
              priority={isPriority}
            />

            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-center justify-center" onClick={() => setIsModalOpen(true)}>
              <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="bg-white/95 backdrop-blur-md rounded-full p-4 shadow-2xl ring-4 ring-royal-blue/20 animate-pulse">
                  <svg className="w-10 h-10 text-royal-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute top-0 left-0 w-20 h-20 bg-white/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0s' }}></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>

          <div className="p-5 bg-gradient-to-b from-white to-gray-50/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-royal-blue/30 to-transparent"></div>

            <div className="flex items-center gap-3 relative z-10">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-royal-blue to-blue-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 ring-4 ring-royal-blue/10 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <span className="text-white font-bold text-base">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 text-base truncate flex items-center gap-2 group-hover:text-royal-blue transition-colors duration-300">
                  {testimonial.name}
                  <svg className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </h4>
                <div className="flex items-center gap-1.5 text-gray-600 text-sm group-hover:text-royal-blue transition-colors duration-300">
                  <svg className="w-4 h-4 flex-shrink-0 animate-bounce" fill="currentColor" viewBox="0 0 20 20" style={{ animationDuration: '3s' }}>
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold truncate">{testimonial.city}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-royal-blue via-blue-500 to-royal-blue transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left shadow-lg shadow-blue-500/50"></div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-royal-blue/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative max-w-7xl w-full max-h-[90vh] flex items-center justify-center">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 hover:rotate-90 shadow-2xl"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <img
              src={testimonial.image}
              alt={`Testimonio de ${testimonial.name}`}
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default TestimonialsSection;
