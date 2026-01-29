import React, { useState, useEffect, useRef } from 'react';

const MobileCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
      url: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/sign/reports/car4.PNG?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83YmM0MmQzMy02OTI3LTQ4ZWYtYmY0YS05MzBmYWIwZmMzMDYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZXBvcnRzL2NhcjQuUE5HIiwiaWF0IjoxNzU4NTYzOTgwLCJleHAiOjU2NzI2NTg0NTc3OTk4MH0.DgnGEAktd8KKEOo8VfccS9LHdpPfk7vnRe00_4lkoAk',
      caption: 'Volkswagen Passat',
      year: '2022'
    },
    {
      url: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/sign/reports/Untitled%20folder/Captura.PNG?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83YmM0MmQzMy02OTI3LTQ4ZWYtYmY0YS05MzBmYWIwZmMzMDYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZXBvcnRzL1VudGl0bGVkIGZvbGRlci9DYXB0dXJhLlBORyIsImlhdCI6MTc1OTMzMjY5NCwiZXhwIjo0NzkxMjY2NjI0MTU4Mjk0fQ.zwmH214ivWW3WEUpIy3uQ3hYst0fYzh1RMlmTf8Ell4',
      caption: 'Audi A6',
      year: '2023'
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying || isHovered) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carImages.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [carImages.length, isAutoPlaying, isHovered]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setLoadedImages(loaded => new Set(loaded).add(index));
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carImages.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carImages.length) % carImages.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setStartX(e.targetTouches[0].clientX);
    setIsAutoPlaying(false);
    setIsDragging(false);
    setDragOffset(0);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
    if (touchStart) {
      const currentX = e.targetTouches[0].clientX;
      const diff = currentX - startX;
      setDragOffset(diff);
      setIsDragging(true);
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    setIsDragging(false);
    setDragOffset(0);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setStartX(e.clientX);
    setIsAutoPlaying(false);
    setIsDragging(false);
    setDragOffset(0);

    const handleMouseMove = (e: MouseEvent) => {
      const currentX = e.clientX;
      const diff = currentX - startX;
      setDragOffset(diff);
      setIsDragging(true);
    };

    const handleMouseUp = () => {
      const distance = -dragOffset;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;

      if (isLeftSwipe) {
        nextSlide();
      } else if (isRightSwipe) {
        prevSlide();
      }

      setIsDragging(false);
      setDragOffset(0);

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Container with 3D perspective */}
      <div className="relative perspective-1000">

        {/* Floating shadow layers for depth */}
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 rounded-3xl blur-3xl opacity-60 animate-pulse"></div>

        {/* Main Slider Wrapper */}
        <div className="relative">

          {/* Slider Container */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-black/30 via-blue-900/20 to-black/30 backdrop-blur-md border-2 border-white/10 shadow-2xl group">

            {/* Animated gradient border effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-30 transition-opacity duration-700 blur-xl"></div>

            {/* Corner accents - minimalist */}
            <div className="absolute top-3 left-3 w-12 h-12 border-t-2 border-l-2 border-blue-400/60 rounded-tl-2xl z-10 transition-all duration-300 group-hover:w-16 group-hover:h-16"></div>
            <div className="absolute top-3 right-3 w-12 h-12 border-t-2 border-r-2 border-blue-400/60 rounded-tr-2xl z-10 transition-all duration-300 group-hover:w-16 group-hover:h-16"></div>
            <div className="absolute bottom-3 left-3 w-12 h-12 border-b-2 border-l-2 border-blue-400/60 rounded-bl-2xl z-10 transition-all duration-300 group-hover:w-16 group-hover:h-16"></div>
            <div className="absolute bottom-3 right-3 w-12 h-12 border-b-2 border-r-2 border-blue-400/60 rounded-br-2xl z-10 transition-all duration-300 group-hover:w-16 group-hover:h-16"></div>

            {/* Image Slider */}
            <div
              className={`flex transition-transform ease-out ${isDragging ? 'duration-0' : 'duration-700'}`}
              style={{
                transform: `translateX(calc(-${currentSlide * 100}% + ${dragOffset}px))`,
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onMouseDown={onMouseDown}
            >
              {carImages.map((image, index) => (
                <div key={index} className="relative w-full h-80 sm:h-96 flex-shrink-0">
                  <img
                    src={image.url}
                    alt={`${image.caption} ${image.year}`}
                    loading={loadedImages.has(index) ? 'eager' : 'lazy'}
                    className="w-full h-full object-cover select-none transition-all duration-700 group-hover:scale-110"
                    draggable={false}
                  />

                  {/* Subtle gradient overlays only */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows - more premium design */}
            <button
              onClick={prevSlide}
              className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/5 backdrop-blur-2xl border border-white/20 text-white p-4 rounded-full hover:bg-white/15 transition-all duration-500 hover:scale-125 hover:-translate-x-1 active:scale-95 z-20 group/btn opacity-0 group-hover:opacity-100 shadow-2xl"
              aria-label="Previous slide"
            >
              <svg className="w-6 h-6 transition-transform duration-300 group-hover/btn:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/5 backdrop-blur-2xl border border-white/20 text-white p-4 rounded-full hover:bg-white/15 transition-all duration-500 hover:scale-125 hover:translate-x-1 active:scale-95 z-20 group/btn opacity-0 group-hover:opacity-100 shadow-2xl"
              aria-label="Next slide"
            >
              <svg className="w-6 h-6 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Progress bar at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/50 z-20">
              <div
                className="h-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 transition-all duration-700 shadow-lg shadow-blue-500/50"
                style={{ width: `${((currentSlide + 1) / carImages.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Thumbnail previews */}
          <div className="flex justify-center items-center gap-4 mt-8">
            {carImages.map((image, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`relative group/thumb transition-all duration-500 ${
                  index === currentSlide
                    ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent scale-110'
                    : 'hover:scale-105 opacity-60 hover:opacity-100'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              >
                {/* Glow effect for active thumbnail */}
                {index === currentSlide && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-md opacity-75 animate-pulse"></div>
                )}

                {/* Thumbnail image */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-white/20 bg-black/30 backdrop-blur-sm">
                  <img
                    src={image.url}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-110"
                  />

                  {/* Overlay for non-active */}
                  {index !== currentSlide && (
                    <div className="absolute inset-0 bg-black/40 group-hover/thumb:bg-black/20 transition-colors duration-300"></div>
                  )}

                  {/* Active indicator */}
                  {index === currentSlide && (
                    <div className="absolute inset-0 border-2 border-blue-400 rounded-xl"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileCarousel;
