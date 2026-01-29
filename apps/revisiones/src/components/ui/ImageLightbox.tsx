import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageLightboxProps {
  images: Array<{ url: string; alt: string }>;
  currentIndex: number;
  onClose: () => void;
  onNavigate?: (index: number) => void;
}

export function ImageLightbox({ images, currentIndex, onClose, onNavigate }: ImageLightboxProps) {
  const [index, setIndex] = useState(currentIndex);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setIndex(currentIndex);
    setZoom(1);
  }, [currentIndex]);

  const handlePrevious = () => {
    const newIndex = index > 0 ? index - 1 : images.length - 1;
    setIndex(newIndex);
    setZoom(1);
    onNavigate?.(newIndex);
  };

  const handleNext = () => {
    const newIndex = index < images.length - 1 ? index + 1 : 0;
    setIndex(newIndex);
    setZoom(1);
    onNavigate?.(newIndex);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 1));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = images[index].url;
    link.download = `image-${index + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [index]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Visor de imágenes"
    >
      <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <span className="text-white font-semibold" aria-live="polite">
            Imagen {index + 1} de {images.length}
          </span>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZoomOut();
              }}
              disabled={zoom <= 1}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Reducir zoom"
            >
              <ZoomOut size={20} className="text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZoomIn();
              }}
              disabled={zoom >= 3}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Aumentar zoom"
            >
              <ZoomIn size={20} className="text-white" />
            </button>
            <span
              className="px-3 py-2 bg-white/10 rounded-lg text-white text-sm font-medium"
              aria-live="polite"
              aria-label={`Zoom al ${Math.round(zoom * 100)} por ciento`}
            >
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
            aria-label="Descargar imagen"
          >
            <Download size={20} className="text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
            aria-label="Cerrar visor de imágenes"
          >
            <X size={20} className="text-white" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden" role="img" aria-label={images[index].alt}>
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition z-10"
            aria-label="Imagen anterior"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>
        )}

        <AnimatePresence mode="wait">
          <motion.img
            key={index}
            src={images[index].url}
            alt={images[index].alt}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: zoom }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="max-w-full max-h-full object-contain cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />
        </AnimatePresence>

        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition z-10"
            aria-label="Imagen siguiente"
          >
            <ChevronRight size={24} className="text-white" />
          </button>
        )}
      </div>

      {images.length > 1 && (
        <div className="p-4 flex gap-2 overflow-x-auto bg-black/50 backdrop-blur-sm" role="navigation" aria-label="Miniaturas de imágenes">
          {images.map((image, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setIndex(i);
                setZoom(1);
                onNavigate?.(i);
              }}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                i === index ? 'border-blue-500' : 'border-white/20 hover:border-white/40'
              }`}
              aria-label={`Ver imagen ${i + 1}`}
              aria-current={i === index ? 'true' : 'false'}
            >
              <img
                src={image.url}
                alt={`Miniatura ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
