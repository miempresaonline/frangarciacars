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
  const sectionRef = useRef<HTMLDivElement>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);

  const testimonials: Testimonial[] = [
    { id: '1', name: 'Erick', city: 'Madrid', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/10.jpg' },
    { id: '2', name: 'Miele', city: 'Barcelona', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/11.jpg' },
    { id: '3', name: 'Santiago', city: 'Alicante', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/12.jpg' },
    { id: '4', name: 'Pepe', city: 'Soria', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/13.jpg' },
    { id: '5', name: 'Carlos', city: 'Islas baleares', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/14.jpg' },
    { id: '6', name: 'Mateo', city: 'Malaga', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/15.jpg' },
    { id: '7', name: 'Toni', city: 'Alicante', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/16.jpg' },
    { id: '8', name: 'Adriá', city: 'Barcelona', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/17.jpg' },
    { id: '9', name: 'Javier', city: 'Bilbao', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/18.jpg' },
    { id: '10', name: 'María', city: 'Vizcalla', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/19.jpg' },
    { id: '11', name: 'Darwin', city: 'Madrid', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/20.jpg' },
    { id: '12', name: 'Voro', city: 'Castellón', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/21.jpg' },
    { id: '13', name: 'Abdou', city: 'Barcelona', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/22.jpg' },
    { id: '14', name: 'Richar', city: 'Valencia', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/23.jpg' },
    { id: '15', name: 'Rubén', city: 'Barcelona', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/24.jpg' },
    { id: '16', name: 'Dasa', city: 'Valencia', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/25.jpg' },
    { id: '17', name: 'Rodrigo', city: 'Mérida', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/26.jpg' },
    { id: '18', name: 'Pepa', city: 'Guadalajara', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/27.jpg' },
    { id: '19', name: 'David', city: 'Madrid', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/28.jpg' },
    { id: '20', name: 'Sergio y Laura', city: 'Sevilla', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/29.jpg' },
    { id: '21', name: 'Juan', city: 'Barcelona', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/30.jpg' },
    { id: '22', name: 'José Francisco', city: 'Ávila', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/31.jpg' },
    { id: '23', name: 'Javi Peñas', city: 'Cáceres', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/32.jpg' },
    { id: '24', name: 'Alejandro', city: 'Madrid', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/33.jpg' },
    { id: '25', name: 'Miguel', city: 'Madrid', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/34.jpg' },
    { id: '26', name: 'Fran', city: 'Valencia', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/35.jpg' },
    { id: '27', name: 'Iván', city: 'Castellón', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/36.jpg' },
    { id: '28', name: 'Alejandro', city: 'Huelva', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/37.jpg' },
    { id: '29', name: 'Daniel', city: 'Madrid', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/38.jpg' },
    { id: '30', name: 'Fernando', city: 'Cáceres', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/39.jpg' },
    { id: '31', name: 'Guillermo', city: 'Mallorca', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/40.jpg' },
    { id: '32', name: 'Carlos', city: 'Tarragona', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/41.jpg' },
    { id: '33', name: 'Verónica', city: 'Madrid', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/42.jpg' },
    { id: '34', name: 'Stiven', city: 'Toledo', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/43.jpg' },
    { id: '35', name: 'Aitor', city: 'País Vasco', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/44.jpg' },
    { id: '36', name: 'Rubén', city: 'Madrid', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/45.jpg' },
    { id: '37', name: 'Darío', city: 'Valencia', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/46.jpg' },
    { id: '38', name: 'Toñy', city: 'Valencia', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/47.jpg' },
    { id: '39', name: 'Janice', city: 'Granada', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/48.jpg' },
    { id: '40', name: 'David y Victor', city: 'Valencia', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/49.jpg' },
    { id: '41', name: 'David Díaz', city: 'Madrid', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/50.jpg' },
    { id: '42', name: 'Iago', city: 'Valencia', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/51.jpg' },
    { id: '43', name: 'Cristobal', city: 'Toledo', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/52.jpg' },
    { id: '44', name: 'Javi Sierra', city: 'Lleida', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/53.jpg' },
    { id: '45', name: 'Mohamed', city: 'Asturias', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/54.jpg' },
    { id: '46', name: 'Lluk', city: 'Barcelona', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/55.jpg' },
    { id: '47', name: 'Pepe', city: 'País Vasco', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/56.jpg' },
    { id: '48', name: 'Kevin', city: 'Madrid', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/57.jpg' },
    { id: '49', name: 'Aitor y Toni', city: 'Valencia', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/58.jpg' },
    { id: '50', name: 'Xavier', city: 'Girona', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/59.jpg' },
    { id: '51', name: 'Sergio', city: 'Teruel', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/60.jpg' },
    { id: '52', name: 'Julia', city: 'Madrid', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/61.jpg' },
    { id: '53', name: 'Javi Rubio', city: 'Madrid', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/62.jpg' },
    { id: '54', name: 'David', city: 'Barcelona', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/63.jpg' },
    { id: '55', name: 'Antonio', city: 'Huesca', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/64.jpg' },
    { id: '56', name: 'Ramón', city: 'Valencia', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/65.jpg' },
    { id: '57', name: 'Jorge', city: 'Jaén', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/66.jpg' },
    { id: '58', name: 'Juaquín', city: 'Huesca', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/67.jpg' },
    { id: '59', name: 'Alejandro', city: 'Cádiz', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/68.jpg' },
    { id: '60', name: 'Diego', city: 'Vigo', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/69.jpg' },
    { id: '61', name: 'Román', city: 'Lugo', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/70.jpg' },
    { id: '62', name: 'Saul', city: 'Almería', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/71.jpg' },
    { id: '63', name: 'Miguel', city: 'Sevilla', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/72.jpg' },
    { id: '64', name: 'Antonio', city: 'Alicante', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/73.jpg' },
    { id: '65', name: 'Alejandro', city: 'Cáceres', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/74.jpg' },
    { id: '66', name: 'Eduardo', city: 'Valladolid', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/75.jpg' },
    { id: '67', name: 'Jose', city: 'Madrid', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/76.jpg' },
    { id: '68', name: 'Dabiel', city: 'Cádiz', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/77.jpg' },
    { id: '69', name: 'Kevin', city: 'Madrid', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/78.jpg' },
    { id: '70', name: 'Cristian', city: 'Teruel', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/79.jpg' },
    { id: '71', name: 'Mario', city: 'Granada', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/80.jpg' },
    { id: '72', name: 'Christian', city: 'Valencia', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/81.jpg' },
    { id: '73', name: 'Paco', city: 'Barcelona', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/82.jpg' },
    { id: '74', name: 'Jose', city: 'Madrid', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/83.jpg' },
    { id: '75', name: 'Jose', city: 'Madrid', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/84.jpg' },
    { id: '76', name: 'Darío', city: 'A Coruña', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/85.jpg' },
    { id: '77', name: 'Miguel', city: 'Málaga', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/86.jpg' },
    { id: '78', name: 'Óliver', city: 'Zamora', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/87.jpg' },
    { id: '79', name: 'Francisco', city: 'Álava', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/88.jpg' },
    { id: '80', name: 'César', city: 'Madrid', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/90.jpg' },
    { id: '81', name: 'Pablo', city: 'Valencia', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/91.jpg' },
    { id: '82', name: 'Ortega', city: 'Villarreal', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/92.jpg' },
    { id: '83', name: 'Carlos', city: 'Barcelona', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/93.jpg' },
    { id: '84', name: 'Toni', city: 'Alicante', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/94.jpg' },
    { id: '85', name: 'Frank y Álvaro', city: 'Sin ciudad', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/95.jpg' },
    { id: '86', name: 'Sergio', city: 'Pontevedra', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/96.jpg' },
    { id: '87', name: 'Carlos', city: 'Córdoba', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/97.jpg' },
    { id: '88', name: 'Santiago', city: 'Almería', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/98.jpg' },
    { id: '89', name: 'Max', city: 'La Rioja', image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/99.jpg' }
  ];

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
    <section className="py-16 lg:py-24 bg-gradient-to-b from-white via-blue-50/30 to-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent"></div>
      <div className="absolute top-32 right-20 w-64 h-64 bg-blue-100/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-32 left-20 w-80 h-80 bg-royal-blue/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={sectionRef}>
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 bg-[#0029D4]/10 backdrop-blur-sm border border-[#0029D4]/20 rounded-full px-6 py-3 mb-8 animate-pulse">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            <span className="text-green-400 font-bold text-sm uppercase tracking-wider">+100 Clientes Satisfechos</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.1]">
            <span className="block text-gray-900 mb-2">
              Resultados de
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#0029D4] via-blue-400 to-[#0029D4] animate-gradient-x bg-[length:200%_auto]">
              nuestros clientes
            </span>
          </h1>

          <p className="text-gray-600 text-lg font-semibold mt-6">
            Ordenados por presupuesto, de menor a mayor
          </p>
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

        <div className="text-center mt-16 lg:mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-royal-blue/5 to-transparent blur-3xl"></div>

          <div className={`relative transition-all duration-1000 ${
            visibleItems.size >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-gradient-to-r from-royal-blue/10 to-blue-600/10 rounded-full blur-3xl animate-pulse"></div>

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
