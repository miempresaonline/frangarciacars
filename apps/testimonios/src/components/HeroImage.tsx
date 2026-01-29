import React, { useState, useEffect } from 'react';
import ImageWithPlaceholder from './ImageWithPlaceholder';

interface HeroImageProps {
  mousePosition: { x: number; y: number };
}

const HeroImage: React.FC<HeroImageProps> = ({ mousePosition }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const [shouldLoadAll, setShouldLoadAll] = useState(false);

  const carImages = [
    {
      url: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/sign/reports/Untitled%20folder/111111.PNG?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83YmM0MmQzMy02OTI3LTQ4ZWYtYmY0YS05MzBmYWIwZmMzMDYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZXBvcnRzL1VudGl0bGVkIGZvbGRlci8xMTExMTEuUE5HIiwiaWF0IjoxNzU5MTU1NTM2LCJleHAiOjQ4ODY1MDQ4NjM3MTUzNn0.bYnF7zNH4zCZbxjOEsE5YhLPhVNA4xSo3G5Gmuj85Rc',
      caption: 'BMW Serie 5',
      year: '2022'
    },
    {
      url: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/sign/reports/Untitled%20folder/a-GWjGc1OPgggzHE8gv6BKfdf3BvKXwcEDsNpR87N88.jpeg.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83YmM0MmQzMy02OTI3LTQ4ZWYtYmY0YS05MzBmYWIwZmMzMDYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZXBvcnRzL1VudGl0bGVkIGZvbGRlci9hLUdXakdjMU9QZ2dnekhFOGd2NkJLZmRmM0J2S1h3Y0VEc05wUjg3Tjg4LmpwZWcuanBnIiwiaWF0IjoxNzU5MTU3ODkzLCJleHAiOjU2NzI3NDQ4NjM3Mzg5M30.1Gkz5exeIaq2OYQ2woYnhgy9oWJTokZsm3smwTqw8kU',
      caption: 'Mercedes Clase E',
      year: '2021'
    },
    {
      url: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/sign/reports/Untitled%20folder/Captura.PNG?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83YmM0MmQzMy02OTI3LTQ4ZWYtYmY0YS05MzBmYWIwZmMzMDYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZXBvcnRzL1VudGl0bGVkIGZvbGRlci9DYXB0dXJhLlBORyIsImlhdCI6MTc1OTMzMjY5NCwiZXhwIjo0NzkxMjY2NjI0MTU4Mjk0fQ.zwmH214ivWW3WEUpIy3uQ3hYst0fYzh1RMlmTf8Ell4',
      caption: 'Audi A6',
      year: '2023'
    },
    {
      url: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/sign/reports/car4.PNG?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83YmM0MmQzMy02OTI3LTQ4ZWYtYmY0YS05MzBmYWIwZmMzMDYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZXBvcnRzL2NhcjQuUE5HIiwiaWF0IjoxNzU4NTYzOTgwLCJleHAiOjU2NzI2NTg0NTc3OTk4MH0.DgnGEAktd8KKEOo8VfccS9LHdpPfk7vnRe00_4lkoAk',
      caption: 'Volkswagen Passat',
      year: '2022'
    }
  ];

  useEffect(() => {
    const preloadTimer = setTimeout(() => {
      setShouldLoadAll(true);
      const allIndices = Array.from({ length: carImages.length }, (_, i) => i);
      setLoadedImages(new Set(allIndices));
    }, 2000);

    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const nextSlide = (prev + 1) % carImages.length;
        setLoadedImages(loaded => new Set(loaded).add(nextSlide));
        return nextSlide;
      });
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(preloadTimer);
    };
  }, [carImages.length]);

  const handleSlideChange = (index: number) => {
    setLoadedImages(loaded => new Set(loaded).add(index));
    setCurrentSlide(index);
  };

  return (
    <div className="relative opacity-0 animate-fade-in-up lg:animate-fade-in-right" style={{ animationDelay: '1s' }}>
      {/* Desktop carousel centrado y más grande */}
      <div 
        className="relative group"
        style={{ 
          transform: `translateX(${mousePosition.x * 0.3}px) translateY(${mousePosition.y * 0.3}px)` 
        }}
      >
        {/* 3D Shadow layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-3xl transform translate-x-3 translate-y-3 blur-xl opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-blue-900/40 rounded-3xl transform translate-x-1.5 translate-y-1.5 blur-lg opacity-70"></div>
        
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl hover:shadow-blue-500/40 transition-all duration-700 hover:scale-105 hover:-translate-y-3 transform-gpu max-w-2xl mx-auto">
          {/* Image slider */}
          <div 
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {carImages.map((image, index) => (
              <div key={index} className="relative w-full h-[280px] sm:h-[320px] lg:h-[500px] xl:h-[600px] flex-shrink-0">
                {(index === 0 || loadedImages.has(index) || shouldLoadAll) ? (
                  <ImageWithPlaceholder
                    src={image.url}
                    alt={`${image.caption} ${image.year}`}
                    className="w-full h-full object-cover transition-all duration-1000 hover:scale-110"
                    placeholderColor="#1a1a2e"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-white font-bold text-xl lg:text-2xl mb-1">{image.caption}</h3>
                      <p className="text-blue-300 text-sm font-medium">{image.year}</p>
                    </div>
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      Disponible
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Overlays premium */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Efecto de brillo */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1500"></div>
          
          {/* Navigation arrows */}
          <button
            onClick={() => handleSlideChange((currentSlide - 1 + carImages.length) % carImages.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm opacity-0 group-hover:opacity-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => handleSlideChange((currentSlide + 1) % carImages.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm opacity-0 group-hover:opacity-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
            {currentSlide + 1}/{carImages.length}
          </div>
        </div>
      </div>
      
      {/* Dot indicators mejorados */}
      <div className="flex justify-center space-x-3 mt-6">
        {carImages.map((_, index) => (
          <button
            key={index}
            className={`transition-all duration-500 rounded-full ${
              index === currentSlide 
                ? 'w-10 h-3 bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50' 
                : 'w-3 h-3 bg-white/50 hover:bg-white/80 hover:scale-125'
            }`}
            onClick={() => handleSlideChange(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroImage;