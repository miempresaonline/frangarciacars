import { useState, useEffect } from 'react';
import { X, Car, User, Clock, CheckCircle, XCircle, Image, Video, FileText, Loader2, AlertCircle } from 'lucide-react';
import { getReviewById, updateReviewStatus, sendClientWebhook } from '../../lib/reviews';
import { getReviewMedia, deleteMediaFile, getMediaPublicUrl, type MediaFile } from '../../lib/media';
import { DocumentsManager } from './DocumentsManager';
import { supabase } from '../../lib/supabase';
import type { ReviewStatus } from '../../types';

interface ReviewDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewId: string;
  onSuccess?: () => void;
}

interface ChecklistItem {
  id: string;
  review_id: string;
  item_key: string;
  item_label: string;
  category: string;
  value: string;
  notes: string | null;
  created_at: string;
}

export function ReviewDetailModal({ isOpen, onClose, reviewId, onSuccess }: ReviewDetailModalProps) {
  const [review, setReview] = useState<any>(null);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [photos, setPhotos] = useState<MediaFile[]>([]);
  const [videos, setVideos] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'checklist' | 'photos' | 'videos' | 'documents'>('checklist');
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [qcNotes, setQcNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadReviewDetails();
    }
  }, [isOpen, reviewId]);

  const loadReviewDetails = async () => {
    try {
      setLoading(true);
      const [reviewData, mediaPhotos, mediaVideos, items] = await Promise.all([
        getReviewById(reviewId),
        getReviewMedia(reviewId, 'photo'),
        getReviewMedia(reviewId, 'video'),
        loadChecklistItems(),
      ]);

      setReview(reviewData);
      setPhotos(mediaPhotos);
      setVideos(mediaVideos);
      setChecklistItems(items);
      setQcNotes(reviewData?.qc_notes || '');
    } catch (err) {
      console.error('Error loading review details:', err);
      alert('Error al cargar detalles de la revisión');
    } finally {
      setLoading(false);
    }
  };

  const loadChecklistItems = async () => {
    const { data, error } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('review_id', reviewId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as ChecklistItem[];
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('¿Seguro que quieres eliminar esta foto?')) return;

    try {
      await deleteMediaFile(photoId);
      setPhotos(photos.filter((p) => p.id !== photoId));
    } catch (err: any) {
      alert(`Error al eliminar foto: ${err.message}`);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('¿Seguro que quieres eliminar este video?')) return;

    try {
      await deleteMediaFile(videoId);
      setVideos(videos.filter((v) => v.id !== videoId));
    } catch (err: any) {
      alert(`Error al eliminar video: ${err.message}`);
    }
  };

  const handleReject = async () => {
    if (!qcNotes.trim()) {
      alert('Por favor, ingresa notas explicando por qué se rechaza la revisión');
      return;
    }

    if (!confirm('¿Seguro que quieres rechazar esta revisión? Se enviará de vuelta al revisor.')) {
      return;
    }

    try {
      setProcessing(true);
      await supabase
        .from('reviews')
        .update({
          status: 'in_progress',
          qc_notes: qcNotes,
        })
        .eq('id', reviewId);

      alert('Revisión rechazada y enviada de vuelta al revisor');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = async () => {
    if (!confirm('¿Seguro que quieres cerrar/descartar esta revisión? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setProcessing(true);
      await supabase
        .from('reviews')
        .update({
          status: 'closed',
          qc_notes: qcNotes || 'Revisión cerrada por el administrador',
        })
        .eq('id', reviewId);

      alert('Revisión cerrada correctamente');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('¿Seguro que quieres aprobar y enviar esta revisión al cliente?')) {
      return;
    }

    try {
      setProcessing(true);
      // Enviar Webhook al cliente
      const webhookSent = await sendClientWebhook(reviewId);
      if (!webhookSent) {
        console.warn('Webhook notification might have failed');
      }

      await updateReviewStatus(reviewId, 'sent_to_client');

      // Legacy notification (optional/backup)
      /*
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-review-notification`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ review_id: reviewId }),
        }
      );
      */

      alert('Revisión aprobada y enviada al cliente');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const getItemValueColor = (value: string) => {
    if (value === 'good' || value === 'yes') return 'text-green-600';
    if (value === 'bad' || value === 'no') return 'text-red-600';
    if (value === 'moderate') return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getItemValueLabel = (value: string) => {
    const labels: Record<string, string> = {
      good: 'Bueno',
      moderate: 'Moderado',
      bad: 'Malo',
      yes: 'Sí',
      no: 'No',
    };
    return labels[value] || value;
  };

  const groupItemsByCategory = () => {
    const grouped: Record<string, ChecklistItem[]> = {};
    checklistItems.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    return grouped;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8">
          <Loader2 className="w-12 h-12 text-[#0029D4] animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  if (!review) {
    return null;
  }

  const groupedItems = groupItemsByCategory();
  const canPerformQC = review.status === 'pending_qc';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full my-4 sm:my-8 max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Detalle de Revisión</h2>
            <p className="text-xs sm:text-sm text-gray-500 truncate">ID: {reviewId.slice(0, 8)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0 ml-2"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 sm:p-6 border border-blue-200">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <Car size={20} className="text-blue-600 sm:w-6 sm:h-6" />
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">Vehículo</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {review.vehicle_make} {review.vehicle_model}
                  </p>
                  {review.vehicle_year && (
                    <p className="text-sm sm:text-base text-gray-600">Año: {review.vehicle_year}</p>
                  )}
                  {review.vehicle_km && (
                    <p className="text-sm sm:text-base text-gray-600">Kilometraje: {review.vehicle_km.toLocaleString()} km</p>
                  )}
                  {review.vehicle_vin && (
                    <p className="text-xs sm:text-sm text-gray-600 font-mono break-all">VIN: {review.vehicle_vin}</p>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 sm:p-6 border border-green-200">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <User size={20} className="text-green-600 sm:w-6 sm:h-6" />
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">Participantes</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Cliente</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900">{review.client?.full_name}</p>
                    <p className="text-xs sm:text-sm text-gray-500 break-all">{review.client?.email}</p>
                  </div>
                  {review.reviewer && (
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Revisor</p>
                      <p className="text-sm sm:text-base font-semibold text-gray-900">{review.reviewer.full_name}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {review.driving_time_seconds > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 sm:p-6 border border-purple-200">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <Clock size={20} className="text-purple-600 sm:w-6 sm:h-6" />
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">Tiempos de Revisión</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Tiempo de Conducción</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatDuration(review.driving_time_seconds)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tiempo Total</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatDuration(review.total_time_seconds)}
                    </p>
                  </div>
                  {review.paused_time_seconds > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Tiempo en Pausa</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatDuration(review.paused_time_seconds)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4 sm:pt-6">
              <div className="flex overflow-x-auto border-b border-gray-200 mb-4 sm:mb-6 -mx-3 px-3 sm:mx-0 sm:px-0">
                <button
                  onClick={() => setActiveTab('checklist')}
                  className={`px-3 sm:px-6 py-2 sm:py-3 font-medium transition-all whitespace-nowrap flex-shrink-0 ${activeTab === 'checklist'
                      ? 'text-[#0029D4] border-b-2 border-[#0029D4]'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <CheckCircle size={16} className="sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-base">Checklist ({checklistItems.length})</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('photos')}
                  className={`px-3 sm:px-6 py-2 sm:py-3 font-medium transition-all whitespace-nowrap flex-shrink-0 ${activeTab === 'photos'
                      ? 'text-[#0029D4] border-b-2 border-[#0029D4]'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Image size={16} className="sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-base">Fotos ({photos.length})</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('videos')}
                  className={`px-3 sm:px-6 py-2 sm:py-3 font-medium transition-all whitespace-nowrap flex-shrink-0 ${activeTab === 'videos'
                      ? 'text-[#0029D4] border-b-2 border-[#0029D4]'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Video size={16} className="sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-base">Videos ({videos.length})</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`px-3 sm:px-6 py-2 sm:py-3 font-medium transition-all whitespace-nowrap flex-shrink-0 ${activeTab === 'documents'
                      ? 'text-[#0029D4] border-b-2 border-[#0029D4]'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <FileText size={16} className="sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-base">Documentos</span>
                  </div>
                </button>
              </div>

              {activeTab === 'checklist' && (
                <div className="space-y-6">
                  {Object.entries(groupedItems).map(([category, items]) => (
                    <div key={category} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-bold text-gray-900 mb-4 text-lg">{category}</h4>
                      <div className="space-y-3">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="bg-white rounded-lg p-4 border border-gray-200"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <p className="font-medium text-gray-900">{item.item_label}</p>
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-bold ${getItemValueColor(
                                  item.value
                                )}`}
                              >
                                {getItemValueLabel(item.value)}
                              </span>
                            </div>
                            {item.notes && (
                              <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'photos' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.metadata.public_url}
                        alt="Review photo"
                        className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                        onClick={() => setLightboxPhoto(photo.metadata.public_url)}
                      />
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                      <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        {(photo.file_size_bytes / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  ))}
                  {photos.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                      No hay fotos disponibles
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'videos' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videos.map((video) => (
                    <div key={video.id} className="relative group">
                      <video
                        src={video.metadata.public_url}
                        controls
                        className="w-full rounded-lg"
                      />
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                      <div className="mt-2 text-sm text-gray-600">
                        {(video.file_size_bytes / 1024 / 1024).toFixed(2)} MB
                        {video.duration_seconds && ` • ${video.duration_seconds}s`}
                      </div>
                    </div>
                  ))}
                  {videos.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                      No hay videos disponibles
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'documents' && <DocumentsManager reviewId={reviewId} />}
            </div>

            {canPerformQC && (
              <div className="border-t border-gray-200 pt-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                  <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-semibold text-yellow-900">Control de Calidad Requerido</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Esta revisión está pendiente de aprobación. Revisa todos los elementos y decide si aprobar o rechazar.
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas de QC
                  </label>
                  <textarea
                    value={qcNotes}
                    onChange={(e) => setQcNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent"
                    placeholder="Agrega notas sobre la revisión (requerido si se rechaza)..."
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleReject}
                    disabled={processing}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <XCircle size={20} />
                    )}
                    Rechazar
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={processing}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <CheckCircle size={20} />
                    )}
                    Aprobar y Enviar
                  </button>
                </div>
              </div>
            )}

            {review.status !== 'closed' && review.status !== 'sent_to_client' && (
              <div className="border-t border-gray-200 pt-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                  <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-semibold text-red-900">Cerrar/Descartar Revisión</p>
                    <p className="text-sm text-red-700 mt-1">
                      Si esta revisión no se puede completar o debe descartarse, puedes cerrarla manualmente. Esta acción no se puede deshacer.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  disabled={processing}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <XCircle size={20} />
                  )}
                  Cerrar Revisión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {lightboxPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <img
            src={lightboxPhoto}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
          />
          <button
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-4 right-4 p-2 bg-white rounded-lg hover:bg-gray-100 transition"
          >
            <X size={24} />
          </button>
        </div>
      )}
    </div>
  );
}
