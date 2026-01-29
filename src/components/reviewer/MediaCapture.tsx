import { useState, useRef, useEffect } from 'react';
import { Camera, Video, X, Upload, Loader2, Image as ImageIcon, Trash2, Eye } from 'lucide-react';
import { uploadPhoto, uploadVideo, getReviewMedia, deleteMediaFile, type MediaFile } from '../../lib/media';
import { ImageLightbox } from '../ui/ImageLightbox';
import { AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { compressMultipleImagesWithStats, formatFileSize } from '../../lib/imageCompression';

interface MediaCaptureProps {
  reviewId: string;
  checklistItemId: string | null;
  minPhotos?: number;
  maxPhotos?: number;
  onMediaUploaded?: () => void;
}

export function MediaCapture({ reviewId, checklistItemId, minPhotos = 0, maxPhotos, onMediaUploaded }: MediaCaptureProps) {
  const [photos, setPhotos] = useState<MediaFile[]>([]);
  const [videos, setVideos] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [selectedTab, setSelectedTab] = useState<'photos' | 'videos'>('photos');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMedia();
  }, [reviewId]);

  const loadMedia = async () => {
    try {
      const [photoData, videoData] = await Promise.all([
        getReviewMedia(reviewId, 'photo'),
        getReviewMedia(reviewId, 'video'),
      ]);
      setPhotos(photoData);
      setVideos(videoData);
    } catch (err) {
      console.error('Error loading media:', err);
      toast.error('Error al cargar medios');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (!checklistItemId) {
      toast.error('Debes seleccionar un item del checklist primero');
      return;
    }

    const currentPhotosCount = currentItemPhotos.length;
    if (maxPhotos && currentPhotosCount + files.length > maxPhotos) {
      toast.error(`Solo puedes subir ${maxPhotos} fotos máximo. Actualmente tienes ${currentPhotosCount}.`);
      if (photoInputRef.current) {
        photoInputRef.current.value = '';
      }
      return;
    }

    setUploading(true);
    setUploadPercentage(0);

    try {
      setUploadProgress('Comprimiendo imágenes...');

      const compressionResults = await compressMultipleImagesWithStats(
        files,
        {},
        (current, total) => {
          setUploadPercentage((current / total) * 40);
        }
      );

      const totalOriginalSize = compressionResults.reduce((sum, r) => sum + r.originalSize, 0);
      const totalCompressedSize = compressionResults.reduce((sum, r) => sum + r.compressedSize, 0);
      const averageRatio = ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100;

      if (compressionResults.length > 0) {
        toast.success(
          `Imágenes optimizadas: ${formatFileSize(totalOriginalSize)} → ${formatFileSize(totalCompressedSize)} (${averageRatio.toFixed(0)}% reducción)`,
          { duration: 3000 }
        );
      }

      const compressedFiles = compressionResults.map((r) => r.file);
      let successCount = 0;

      setUploadProgress('Subiendo fotos...');

      for (let i = 0; i < compressedFiles.length; i++) {
        const file = compressedFiles[i];
        try {
          setUploadProgress(`Subiendo foto ${i + 1} de ${compressedFiles.length}...`);
          setUploadPercentage(40 + ((i + 1) / compressedFiles.length) * 60);
          await uploadPhoto(reviewId, checklistItemId, file);
          successCount++;
        } catch (err: any) {
          console.error('Error uploading photo:', err);
          toast.error(`Error al subir foto ${i + 1}: ${err.message}`);
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} foto${successCount > 1 ? 's' : ''} subida${successCount > 1 ? 's' : ''} correctamente`);
        await loadMedia();
        onMediaUploaded?.();
      }
    } catch (err: any) {
      console.error('Error processing photos:', err);
      toast.error(`Error al procesar las fotos: ${err.message}`);
    } finally {
      setUploadProgress('');
      setUploadPercentage(0);
      setUploading(false);

      if (photoInputRef.current) {
        photoInputRef.current.value = '';
      }
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!checklistItemId) {
      toast.error('Debes seleccionar un item del checklist primero');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error('El video no debe superar 100MB');
      return;
    }

    setUploading(true);
    setUploadProgress('Subiendo video...');
    setUploadPercentage(50);

    try {
      await uploadVideo(reviewId, checklistItemId, file);
      setUploadPercentage(100);
      await loadMedia();
      toast.success('Video subido correctamente');
      onMediaUploaded?.();
    } catch (err: any) {
      toast.error(`Error al subir video: ${err.message}`);
    } finally {
      setUploadProgress('');
      setUploadPercentage(0);
      setUploading(false);
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('¿Seguro que quieres eliminar esta foto?')) return;

    try {
      await deleteMediaFile(photoId);
      setPhotos(photos.filter((p) => p.id !== photoId));
      toast.success('Foto eliminada correctamente');
      onMediaUploaded?.();
    } catch (err: any) {
      toast.error(`Error al eliminar foto: ${err.message}`);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('¿Seguro que quieres eliminar este video?')) return;

    try {
      await deleteMediaFile(videoId);
      setVideos(videos.filter((v) => v.id !== videoId));
      toast.success('Video eliminado correctamente');
      onMediaUploaded?.();
    } catch (err: any) {
      toast.error(`Error al eliminar video: ${err.message}`);
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const formatFileSize = (sizeBytes: number) => {
    const sizeKb = sizeBytes / 1024;
    if (sizeKb < 1024) {
      return `${sizeKb.toFixed(1)} KB`;
    }
    return `${(sizeKb / 1024).toFixed(2)} MB`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentItemPhotos = checklistItemId
    ? photos.filter((p) => p.checklist_item_id === checklistItemId)
    : photos;
  const currentItemVideos = checklistItemId
    ? videos.filter((v) => v.checklist_item_id === checklistItemId)
    : videos;

  const isPhotoLimitReached = maxPhotos ? currentItemPhotos.length >= maxPhotos : false;

  const lightboxImages = currentItemPhotos.map((photo, index) => ({
    url: photo.metadata.public_url,
    alt: `Foto ${index + 1}`,
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Archivos Multimedia</h3>
          <div className="flex gap-2">
            <span className="text-sm text-gray-600">
              {photos.length} fotos · {videos.length} videos
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSelectedTab('photos')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              selectedTab === 'photos'
                ? 'bg-[#0029D4] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ImageIcon size={18} />
            Fotos ({currentItemPhotos.length}{maxPhotos ? `/${maxPhotos}` : ''})
          </button>
          <button
            onClick={() => setSelectedTab('videos')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              selectedTab === 'videos'
                ? 'bg-[#0029D4] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Video size={18} />
            Videos ({currentItemVideos.length})
          </button>
        </div>
      </div>

      <div className="p-4">
        {uploading && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Loader2 className="animate-spin text-blue-600" size={20} />
              <span className="text-blue-700 font-medium">{uploadProgress}</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${uploadPercentage}%` }}
              />
            </div>
            <p className="text-xs text-blue-600 mt-2 text-right font-semibold">
              {Math.round(uploadPercentage)}%
            </p>
          </div>
        )}

        {!checklistItemId && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700 text-sm">
            Selecciona un item del checklist para asociar los archivos multimedia
          </div>
        )}

        {selectedTab === 'photos' && (
          <div className="space-y-4">
            <div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handlePhotoUpload}
                disabled={uploading || !checklistItemId}
                className="hidden"
                aria-label="Seleccionar fotos para subir"
              />
              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={uploading || !checklistItemId || isPhotoLimitReached}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0029D4] text-white rounded-lg font-medium hover:bg-[#0021A0] transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={isPhotoLimitReached ? 'Límite de fotos alcanzado' : 'Subir fotos'}
              >
                <Camera size={20} />
                {isPhotoLimitReached ? 'Límite Alcanzado' : 'Subir Fotos'}
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Formatos: JPG, PNG, WEBP • Máx. 10MB por foto
                {maxPhotos && ` • Límite: ${maxPhotos} fotos`}
              </p>
              {isPhotoLimitReached && (
                <div className="mt-2 bg-orange-50 border border-orange-200 rounded-lg p-3 text-orange-700 text-sm">
                  Has alcanzado el límite de {maxPhotos} fotos para este item
                </div>
              )}
            </div>

            {currentItemPhotos.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Camera size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No hay fotos</p>
                {checklistItemId && (
                  <p className="text-sm text-gray-400 mt-1">Sube fotos del item actual</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {currentItemPhotos.map((photo, index) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.metadata.public_url}
                      alt="Review photo"
                      className="w-full h-32 object-cover rounded-lg cursor-pointer"
                      onClick={() => openLightbox(index)}
                    />
                    <button
                      onClick={() => openLightbox(index)}
                      className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center opacity-0 group-hover:opacity-100"
                      aria-label={`Ver foto ${index + 1} en pantalla completa`}
                    >
                      <Eye size={24} className="text-white" />
                    </button>
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition hover:bg-red-600 z-10"
                      aria-label={`Eliminar foto ${index + 1}`}
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {formatFileSize(photo.file_size_bytes)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'videos' && (
          <div className="space-y-4">
            <div>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/quicktime"
                onChange={handleVideoUpload}
                disabled={uploading || !checklistItemId}
                className="hidden"
                aria-label="Seleccionar video para subir"
              />
              <button
                onClick={() => videoInputRef.current?.click()}
                disabled={uploading || !checklistItemId}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0029D4] text-white rounded-lg font-medium hover:bg-[#0021A0] transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Subir video"
              >
                <Video size={20} />
                Subir Video
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Formatos: MP4, MOV • Máx. 100MB
              </p>
            </div>

            {currentItemVideos.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Video size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No hay videos</p>
                {checklistItemId && (
                  <p className="text-sm text-gray-400 mt-1">Sube videos del item actual</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {currentItemVideos.map((video) => (
                  <div key={video.id} className="relative group bg-gray-50 rounded-lg p-4">
                    <video
                      src={video.metadata.public_url}
                      controls
                      className="w-full rounded-lg mb-2"
                    />
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {formatFileSize(video.file_size_bytes)}
                        {video.duration_seconds && ` • ${formatDuration(video.duration_seconds)}`}
                      </div>
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <ImageLightbox
            images={lightboxImages}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
            onNavigate={setLightboxIndex}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
