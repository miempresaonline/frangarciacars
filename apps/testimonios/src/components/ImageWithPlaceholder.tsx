import React, { useState, useEffect } from 'react';

interface ImageWithPlaceholderProps {
  src: string;
  alt: string;
  className?: string;
  placeholderColor?: string;
  onClick?: () => void;
  priority?: boolean;
}

const ImageWithPlaceholder: React.FC<ImageWithPlaceholderProps> = ({
  src,
  alt,
  className = '',
  placeholderColor = '#1a1a1a',
  onClick,
  priority = false
}) => {
  const [isLoaded, setIsLoaded] = useState(priority);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!priority) {
      setIsLoaded(false);
    }
    setHasError(false);
  }, [src, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div className="relative w-full h-full" onClick={onClick}>
      {!isLoaded && (
        <div
          className="absolute inset-0 transition-opacity duration-300 z-10"
          style={{
            backgroundColor: placeholderColor
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-300`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        style={{
          backgroundColor: placeholderColor,
          opacity: isLoaded ? 1 : 0
        }}
      />

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Error al cargar</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageWithPlaceholder;
