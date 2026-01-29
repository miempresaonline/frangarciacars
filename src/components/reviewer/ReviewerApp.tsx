import { useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAutoTimer } from '../../hooks/useAutoTimer';
import { ClipboardList, User, LogOut, Menu, X, CheckCircle, AlertCircle, Calendar, User as User2, Clock, ArrowLeft, Send, Search, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { PWASettings } from '../ui/PWASettings';
import { getReviewsByReviewer, getReviewById, updateReviewStatus, getReviewProgress, getIncompleteItems } from '../../lib/reviews';
import { ChecklistScreen } from './ChecklistScreen';
import { MediaCapture } from './MediaCapture';
import { ReviewTimer } from './ReviewTimer';
import { IncompleteItemsModal } from './IncompleteItemsModal';
import { supabase } from '../../lib/supabase';
import type { ReviewWithRelations as Review } from '../../types';
import type { IncompleteItem } from '../../lib/reviews';
import { sendReviewerWebhook } from '../../lib/reviews';
import { OfflineIndicator } from '../common/OfflineIndicator';
import { syncService } from '../../lib/sync';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

type ReviewerView = 'reviews' | 'profile' | 'work' | 'settings';

export function ReviewerApp() {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<ReviewerView>('reviews');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const isOnline = useNetworkStatus();

  // Initialize Sync on mount
  useEffect(() => {
    syncService.processQueue();
  }, []);

  const handleSelectReview = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setCurrentView('work');
    setMenuOpen(false);
  };

  const handleBackToReviews = () => {
    setSelectedReviewId(null);
    setCurrentView('reviews');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-automotive-slate-50 to-automotive-slate-100">
      <div className="fixed top-0 left-0 right-0 z-50">
        <OfflineIndicator />
      </div>

      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/95 backdrop-blur-lg border-b border-automotive-slate-200 sticky top-0 z-40 shadow-lg mt-8" // Added margin for offline indicator
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src="/frangarcia-logo.png"
            alt="Logo"
            className="h-10"
          />

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-3 rounded-xl hover:bg-automotive-slate-100 transition-colors"
          >
            <AnimatePresence mode="wait">
              {menuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                >
                  <X size={28} className="text-automotive-navy-800" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                >
                  <Menu size={28} className="text-automotive-navy-800" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-automotive-slate-200 bg-white/95 backdrop-blur-lg overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setCurrentView('reviews');
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl font-semibold transition-all min-h-[3rem] ${currentView === 'reviews'
                    ? 'bg-gradient-to-r from-automotive-navy-800 to-automotive-navy-700 text-white shadow-lg shadow-automotive-navy-900/30'
                    : 'text-automotive-navy-700 hover:bg-automotive-slate-100'
                    }`}
                >
                  <ClipboardList size={24} />
                  <span className="text-base">Mis Revisiones</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setCurrentView('profile');
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl font-semibold transition-all min-h-[3rem] ${currentView === 'profile'
                    ? 'bg-gradient-to-r from-automotive-navy-800 to-automotive-navy-700 text-white shadow-lg shadow-automotive-navy-900/30'
                    : 'text-automotive-navy-700 hover:bg-automotive-slate-100'
                    }`}
                >
                  <User size={24} />
                  <span className="text-base">Mi Perfil</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setCurrentView('settings');
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl font-semibold transition-all min-h-[3rem] ${currentView === 'settings'
                    ? 'bg-gradient-to-r from-automotive-navy-800 to-automotive-navy-700 text-white shadow-lg shadow-automotive-navy-900/30'
                    : 'text-automotive-navy-700 hover:bg-automotive-slate-100'
                    }`}
                >
                  <Settings size={24} />
                  <span className="text-base">Configuración</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={signOut}
                  className="w-full flex items-center gap-3 px-5 py-4 text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-all min-h-[3rem]"
                >
                  <LogOut size={24} />
                  <span className="text-base">Cerrar Sesión</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentView === 'reviews' && <ReviewsView onSelectReview={handleSelectReview} />}
            {currentView === 'profile' && <ProfileView user={user} />}
            {currentView === 'settings' && <PWASettings />}
            {currentView === 'work' && selectedReviewId && (
              <WorkView reviewId={selectedReviewId} onBack={handleBackToReviews} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function ReviewsView({ onSelectReview }: { onSelectReview: (id: string) => void }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user?.id) return;

    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await getReviewsByReviewer(user.id);
        setReviews(data);

        const progressData: Record<string, number> = {};
        for (const review of data) {
          if (review.status !== 'sent_to_client' && review.status !== 'draft') {
            progressData[review.id] = review.progress_percentage || 0;
          }
        }
        setProgressMap(progressData);
      } catch (err) {
        setError('Error cargando revisiones');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [user?.id]);

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.vehicle_make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vehicle_model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vehicle_vin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.client?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && r.status !== 'sent_to_client') ||
      (statusFilter === 'completed' && r.status === 'sent_to_client');

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; bg: string; text: string }> = {
      draft: { label: 'Creada', bg: 'bg-gray-100', text: 'text-gray-700' },
      in_progress: { label: 'En Ejecución', bg: 'bg-blue-100', text: 'text-blue-700' },
      pending_qc: { label: 'En Revisión (QC)', bg: 'bg-amber-100', text: 'text-amber-700' },
      sent_to_client: { label: 'Aprobada', bg: 'bg-emerald-100', text: 'text-emerald-700' },
      closed: { label: 'Cerrada', bg: 'bg-red-100', text: 'text-red-700' },
    };
    return badges[status] || badges.draft;
  };

  if (loading) {
    return (
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl sm:text-4xl font-bold text-automotive-navy-900 mb-8"
        >
          Mis Revisiones
        </motion.h1>
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-[#0029D4] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl sm:text-4xl font-bold text-automotive-navy-900 mb-8"
        >
          Mis Revisiones
        </motion.h1>
        <Card className="bg-red-50 border-red-200 flex items-center justify-center min-h-[8rem]">
          <AlertCircle size={24} className="text-red-500 mr-3" />
          <p className="text-red-700 font-medium">{error}</p>
        </Card>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl sm:text-4xl font-bold text-automotive-navy-900 mb-8"
        >
          Mis Revisiones
        </motion.h1>
        <Card className="min-h-[16rem] flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-4"
            >
              <ClipboardList size={64} className="mx-auto text-automotive-slate-300" />
            </motion.div>
            <p className="text-automotive-slate-500 text-lg font-medium">
              No tienes revisiones asignadas
            </p>
          </motion.div>
        </Card>
      </div>
    );
  }

  const pendingReviews = filteredReviews.filter((r) => r.status !== 'sent_to_client');
  const completedReviews = filteredReviews.filter((r) => r.status === 'sent_to_client');

  const getActionButton = (review: any) => {
    if (review.status === 'sent_to_client') {
      return (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectReview(review.id)}
          className="w-full px-4 py-2.5 bg-gray-50 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition border border-gray-300"
        >
          Ver Versión Final
        </motion.button>
      );
    }

    if (review.status === 'draft' || !review.started_at) {
      return (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectReview(review.id)}
          className="w-full px-4 py-2.5 bg-[#0029D4] text-white rounded-lg font-medium hover:bg-[#0021A0] transition"
        >
          Empezar Revisión
        </motion.button>
      );
    }

    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelectReview(review.id)}
        className="w-full px-4 py-2.5 bg-[#0029D4] text-white rounded-lg font-medium hover:bg-[#0021A0] transition"
      >
        Seguir Revisión
      </motion.button>
    );
  };

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl sm:text-4xl font-bold text-automotive-navy-900 mb-6"
      >
        Mis Revisiones
      </motion.h1>

      <div className="mb-6 relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Buscar por vehículo, VIN o cliente..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent"
        />
      </div>

      {filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No se encontraron revisiones</p>
        </div>
      ) : (
        <div className="space-y-8">
          {pendingReviews.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-1 bg-amber-500 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-900">Pendientes</h2>
                <span className="ml-auto bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-full text-sm">
                  {pendingReviews.length}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingReviews.map((review, index) => {
                  const badge = getStatusBadge(review.status);
                  return (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition p-5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-semibold ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        {review.vehicle_make} {review.vehicle_model}
                      </h3>

                      <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-semibold text-gray-500 min-w-[60px]">Cliente:</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {review.client?.full_name || '-'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {review.client?.email || '-'}
                            </p>
                          </div>
                        </div>
                        {review.vehicle_year && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500 min-w-[60px]">Año:</span>
                            <p className="text-sm text-gray-700">{review.vehicle_year}</p>
                          </div>
                        )}
                        {review.vehicle_km && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500 min-w-[60px]">Km:</span>
                            <p className="text-sm text-gray-700">{review.vehicle_km.toLocaleString()}</p>
                          </div>
                        )}
                        {review.vehicle_vin && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500 min-w-[60px]">VIN:</span>
                            <p className="text-xs font-mono text-gray-600">{review.vehicle_vin}</p>
                          </div>
                        )}
                      </div>

                      {review.status !== 'draft' && (progressMap[review.id] !== undefined || review.started_at) && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Progreso</span>
                            <span className="font-semibold">{progressMap[review.id] || 0}%</span>
                          </div>
                          <ProgressBar progress={progressMap[review.id] || 0} />
                        </div>
                      )}

                      {getActionButton(review)}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {completedReviews.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-1 bg-emerald-500 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-900">Completadas</h2>
                <span className="ml-auto bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full text-sm">
                  {completedReviews.length}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedReviews.map((review, index) => {
                  const badge = getStatusBadge(review.status);
                  return (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition p-5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-semibold ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        {review.vehicle_make} {review.vehicle_model}
                      </h3>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-semibold text-gray-500 min-w-[60px]">Cliente:</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {review.client?.full_name || '-'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {review.client?.email || '-'}
                            </p>
                          </div>
                        </div>
                        {review.vehicle_year && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500 min-w-[60px]">Año:</span>
                            <p className="text-sm text-gray-700">{review.vehicle_year}</p>
                          </div>
                        )}
                        {review.vehicle_km && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500 min-w-[60px]">Km:</span>
                            <p className="text-sm text-gray-700">{review.vehicle_km.toLocaleString()}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-500 min-w-[60px]">Enviada:</span>
                          <p className="text-sm text-gray-700">{new Date(review.created_at).toLocaleDateString('es-ES')}</p>
                        </div>
                      </div>

                      {getActionButton(review)}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WorkView({ reviewId, onBack }: { reviewId: string; onBack: () => void }) {
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'checklist' | 'media' | 'timers'>('checklist');
  const [progress, setProgress] = useState(0);
  const [incompleteItems, setIncompleteItems] = useState<IncompleteItem[]>([]);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);

  useAutoTimer({ reviewId, enabled: !loading && !!review });

  useEffect(() => {
    loadReview();
  }, [reviewId]);

  useEffect(() => {
    if (review && review.status === 'in_progress') {
      loadProgress();
    }
  }, [review]);

  const loadReview = async () => {
    try {
      setLoading(true);
      const data = await getReviewById(reviewId);
      setReview(data);

      if (data && data.status === 'draft') {
        await updateReviewStatus(reviewId, 'in_progress');
        const updatedData = await getReviewById(reviewId);
        setReview(updatedData);
      }
    } catch (err) {
      console.error('Error loading review:', err);
      alert('Error al cargar la revisión');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      setLoadingProgress(true);
      const progressValue = await getReviewProgress(reviewId);
      setProgress(progressValue);
    } catch (err) {
      console.error('Error loading progress:', err);
    } finally {
      setLoadingProgress(false);
    }
  };

  const handleSubmitToQC = async () => {
    try {
      setLoadingProgress(true);
      const currentProgress = await getReviewProgress(reviewId);
      setProgress(currentProgress);

      if (currentProgress < 100) {
        const incomplete = await getIncompleteItems(reviewId);
        setIncompleteItems(incomplete);
        setShowIncompleteModal(true);
        return;
      }

      if (
        !confirm(
          '¿Seguro que quieres enviar esta revisión a Control de Calidad?'
        )
      ) {
        return;
      }

      setSubmitting(true);

      // Enviar Webhook antes de cambiar estado
      await sendReviewerWebhook(reviewId);

      await updateReviewStatus(reviewId, 'pending_qc');
      alert('Revisión enviada a Control de Calidad exitosamente');
      onBack();
    } catch (err: any) {
      console.error(err);
      alert(`Error al enviar: ${err.message}`);
    } finally {
      setSubmitting(false);
      setLoadingProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <ClipboardList size={48} className="mx-auto text-[#0029D4] mb-4" />
          </motion.div>
          <p className="text-gray-600">Cargando revisión...</p>
        </div>
      </div>
    );
  }

  if (!review) {
    return null;
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft size={20} />
          Volver a revisiones
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {review.vehicle_year} {review.vehicle_make} {review.vehicle_model}
              </h1>
              <p className="text-gray-600 mt-1">Cliente: {review.client?.full_name}</p>
            </div>
          </div>

          {review.vehicle_vin && (
            <p className="text-sm text-gray-600">
              <span className="font-semibold">VIN:</span> {review.vehicle_vin}
            </p>
          )}
          {review.vehicle_km && (
            <p className="text-sm text-gray-600 mb-4">
              <span className="font-semibold">Kilometraje:</span> {review.vehicle_km.toLocaleString()} km
            </p>
          )}

          {review.status === 'in_progress' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Progreso de Revisión</span>
                  <span className={`text-sm font-bold ${progress === 100 ? 'text-green-600' :
                    progress >= 90 ? 'text-green-500' :
                      progress >= 50 ? 'text-amber-600' :
                        'text-red-600'
                    }`}>
                    {progress}%
                  </span>
                </div>
                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`h-full transition-colors ${progress === 100 ? 'bg-green-600' :
                      progress >= 90 ? 'bg-green-500' :
                        progress >= 50 ? 'bg-amber-500' :
                          'bg-red-500'
                      }`}
                  />
                </div>
                {progress < 100 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Completa todos los items del checklist para enviar a QC
                  </p>
                )}
              </div>

              <button
                onClick={handleSubmitToQC}
                disabled={submitting}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition ${progress === 100
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  } disabled:opacity-50`}
                title={progress < 100 ? 'Completa el 100% de la revisión para enviar a QC' : ''}
              >
                <Send size={20} />
                {submitting ? 'Enviando...' : 'Enviar a QC'}
              </button>
            </div>
          )}
        </div>

        <IncompleteItemsModal
          isOpen={showIncompleteModal}
          onClose={() => setShowIncompleteModal(false)}
          incompleteItems={incompleteItems}
        />
      </div>

      <div className="mb-6">
        <div className="flex gap-2 bg-white rounded-xl shadow-sm border border-gray-200 p-2">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${activeTab === 'checklist'
              ? 'bg-[#0029D4] text-white'
              : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            Checklist
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${activeTab === 'media'
              ? 'bg-[#0029D4] text-white'
              : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            Multimedia
          </button>
          <button
            onClick={() => setActiveTab('timers')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${activeTab === 'timers'
              ? 'bg-[#0029D4] text-white'
              : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            Cronómetros
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'checklist' && <ChecklistScreen reviewId={reviewId} onItemUpdate={loadProgress} />}
          {activeTab === 'media' && <MediaCapture reviewId={reviewId} checklistItemId={null} />}
          {activeTab === 'timers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ReviewTimer reviewId={reviewId} timerType="driving" label="Tiempo de Conducción" />
              <ReviewTimer reviewId={reviewId} timerType="total" label="Tiempo Total" />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ProfileView({ user }: { user: any }) {
  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl sm:text-4xl font-bold text-automotive-navy-900 mb-6"
      >
        Mi Perfil
      </motion.h1>

      <Card className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="text-sm font-semibold text-automotive-slate-600 uppercase tracking-wide">
            Nombre
          </label>
          <p className="text-xl sm:text-2xl font-bold text-automotive-navy-900 mt-2">
            {user?.profile?.full_name}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="text-sm font-semibold text-automotive-slate-600 uppercase tracking-wide">
            Email
          </label>
          <p className="text-lg sm:text-xl text-automotive-navy-800 mt-2">
            {user?.email}
          </p>
        </motion.div>

        {user?.profile?.phone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="text-sm font-semibold text-automotive-slate-600 uppercase tracking-wide">
              Teléfono
            </label>
            <p className="text-lg sm:text-xl text-automotive-navy-800 mt-2">
              {user.profile.phone}
            </p>
          </motion.div>
        )}

        {user?.profile?.location && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="text-sm font-semibold text-automotive-slate-600 uppercase tracking-wide">
              Ubicación
            </label>
            <p className="text-lg sm:text-xl text-automotive-navy-800 mt-2">
              {user.profile.location}
            </p>
          </motion.div>
        )}
      </Card>
    </div>
  );
}
