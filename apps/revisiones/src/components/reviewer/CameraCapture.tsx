import { useState, useRef, useEffect } from 'react';
import { Camera, Send, X, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { uploadPhoto } from '../../lib/media';
import { compressMultipleImagesWithStats, formatFileSize } from '../../lib/imageCompression';

interface CameraCaptureProps {
  reviewId: string;
  checklistItemId: string;
  maxLimit: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function CameraCapture({
  reviewId,
  checklistItemId,
  maxLimit,
  onClose,
  onSuccess,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<Blob[]>([]);
  const [isStreamActive, setIsStreamActive] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1440 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {
            toast.error('No se pudo reproducir el video de la cámara');
          });
        };
        setStream(mediaStream);
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      let errorMessage = 'No se pudo acceder a la cámara';
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Debes permitir el acceso a la cámara';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No se encontró una cámara en tu dispositivo';
      }
      toast.error(errorMessage);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    if (capturedPhotos.length >= maxLimit) {
      toast.error(`Ya has capturado el máximo de ${maxLimit} fotos`);
      return;
    }

    try {
      const context = canvasRef.current.getContext('2d');
      if (!context) return;

      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      canvasRef.current.toBlob(async (blob) => {
        if (blob) {
          setCapturedPhotos((prev) => [...prev, blob]);
          toast.success(`Foto capturada (${capturedPhotos.length + 1}/${maxLimit})`);
        }
      }, 'image/jpeg', 0.7);
    } catch (err) {
      console.error('Error capturing photo:', err);
      toast.error('Error al capturar la foto');
    }
  };

  const removePhoto = (index: number) => {
    setCapturedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async () => {
    if (capturedPhotos.length === 0) {
      toast.error('Debes capturar al menos una foto');
      return;
    }

    setUploading(true);
    try {
      setUploadProgress(0);

      const files: File[] = capturedPhotos.map((blob, index) => {
        return new File([blob], `photo_${index}_${Date.now()}.jpg`, { type: 'image/jpeg' });
      });

      const compressionResults = await compressMultipleImagesWithStats(
        files,
        {},
        (current, total) => {
          setUploadProgress((current / total) * 50);
        }
      );

      const totalOriginalSize = compressionResults.reduce((sum, r) => sum + r.originalSize, 0);
      const totalCompressedSize = compressionResults.reduce((sum, r) => sum + r.compressedSize, 0);
      const averageRatio = ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100;

      if (compressionResults.length > 0) {
        toast.success(
          `Fotos optimizadas: ${formatFileSize(totalOriginalSize)} → ${formatFileSize(totalCompressedSize)} (${averageRatio.toFixed(0)}% reducción)`,
          { duration: 4000 }
        );
      }

      const compressedFiles = compressionResults.map((r) => r.file);
      const BATCH_SIZE = 3;
      let successCount = 0;

      for (let i = 0; i < compressedFiles.length; i += BATCH_SIZE) {
        const batch = compressedFiles.slice(i, i + BATCH_SIZE);

        setUploadProgress(50 + (i / compressedFiles.length) * 50);

        const results = await Promise.allSettled(
          batch.map((file) => uploadPhoto(reviewId, checklistItemId, file))
        );

        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            successCount++;
          }
        });
      }

      setUploadProgress(100);

      if (successCount > 0) {
        toast.success(`${successCount} foto${successCount > 1 ? 's' : ''} subida${successCount > 1 ? 's' : ''}`);
        setCapturedPhotos([]);
        onSuccess();
      }
    } catch (err) {
      console.error('Error uploading photos:', err);
      toast.error('Error al subir las fotos');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="bg-gray-900 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h2 className="text-white font-semibold">Captura de Fotos</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-lg transition"
        >
          <X size={24} className="text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col lg:flex-row gap-4 p-4 min-h-full">
          <div className="flex-1 flex flex-col">
            <div className="bg-black rounded-lg overflow-hidden relative mb-4 aspect-video lg:aspect-auto lg:min-h-[400px]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {capturedPhotos.length >= maxLimit && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center"
                >
                  <div className="text-center p-4">
                    <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                    <p className="text-white font-semibold">Límite alcanzado</p>
                    <p className="text-gray-300 text-sm">Ya tienes {maxLimit} fotos capturadas</p>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={capturePhoto}
                disabled={capturedPhotos.length >= maxLimit || uploading}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-lg font-semibold transition text-base ${
                  capturedPhotos.length >= maxLimit || uploading
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                }`}
              >
                <Camera size={24} />
                Capturar ({capturedPhotos.length}/{maxLimit})
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fileInputRef.current?.click()}
                disabled={capturedPhotos.length >= maxLimit || uploading}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-lg font-semibold transition text-base ${
                  capturedPhotos.length >= maxLimit || uploading
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800'
                }`}
              >
                <ImageIcon size={24} />
                Galería
              </motion.button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (capturedPhotos.length + files.length > maxLimit) {
                    toast.error(`Solo puedes tener ${maxLimit} fotos máximo`);
                    return;
                  }
                  files.forEach((file) => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const img = new Image();
                      img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                          ctx.drawImage(img, 0, 0);
                          canvas.toBlob(
                            (blob) => {
                              if (blob) {
                                setCapturedPhotos((prev) => [...prev, blob]);
                              }
                            },
                            'image/jpeg',
                            0.7
                          );
                        }
                      };
                      img.src = event.target?.result as string;
                    };
                    reader.readAsDataURL(file);
                  });
                }}
              />
            </div>
          </div>

          <div className="w-full lg:w-80 flex flex-col">
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="text-green-400" size={20} />
                Fotos capturadas ({capturedPhotos.length}/{maxLimit})
              </h3>

              {capturedPhotos.length === 0 ? (
                <div className="text-center py-8">
                  <Camera className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No hay fotos capturadas</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                  <AnimatePresence>
                    {capturedPhotos.map((photo, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative group"
                      >
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Foto ${index + 1}`}
                          className="w-full aspect-square rounded-lg object-cover"
                        />
                        <div className="absolute top-1 left-1 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
                          #{index + 1}
                        </div>
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 p-1.5 bg-red-500 hover:bg-red-600 rounded-lg transition opacity-90 group-hover:opacity-100"
                        >
                          <X size={16} className="text-white" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {uploading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 bg-blue-900 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-white text-sm font-semibold">Subiendo fotos...</span>
                </div>
                <div className="w-full bg-blue-800 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="bg-blue-400 h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs text-blue-200 mt-2 text-right font-semibold">{Math.round(uploadProgress)}%</p>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={uploadPhotos}
              disabled={capturedPhotos.length === 0 || uploading}
              className={`w-full flex items-center justify-center gap-2 px-4 py-4 rounded-lg font-bold transition text-base ${
                capturedPhotos.length === 0 || uploading
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-lg'
              }`}
            >
              <Send size={20} />
              Enviar {capturedPhotos.length} foto{capturedPhotos.length !== 1 ? 's' : ''}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
