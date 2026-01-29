import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { FileText, LogOut, AlertCircle, Eye, Car, Calendar, CheckCircle, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card, GlassCard } from '../ui/Card';
import { supabase } from '../../lib/supabase';
import { ReviewDetailModal } from '../admin/ReviewDetailModal';

export function ClientView() {
  const { user, signOut } = useAuth();
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  useEffect(() => {
    if (disclaimerAccepted && user?.id) {
      loadReviews();
    }
  }, [disclaimerAccepted, user?.id]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('client_id', user?.id)
        .eq('status', 'sent_to_client')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!disclaimerAccepted) {
    return <DisclaimerScreen onAccept={() => setDisclaimerAccepted(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-automotive-slate-50 to-white">
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/95 backdrop-blur-lg border-b border-automotive-slate-200 sticky top-0 z-40 shadow-lg"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src="/frangarcia-logo.png"
            alt="Logo"
            className="h-10"
          />

          <div className="flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden sm:block text-right"
            >
              <p className="text-sm font-bold text-automotive-navy-900">
                {user?.profile?.full_name}
              </p>
              <p className="text-xs text-automotive-slate-600">{user?.email}</p>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={signOut}
              className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={22} />
            </motion.button>
          </div>
        </div>
      </motion.header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-automotive-navy-900 mb-4">
            Mis Informes de Revisión
          </h1>
          <p className="text-lg text-automotive-slate-600 max-w-2xl mx-auto">
            Aquí podrás ver los informes detallados de tus vehículos con análisis
            profesional y fotografías
          </p>
        </motion.div>

        {loading ? (
          <Card className="min-h-[24rem] flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <FileText size={64} className="mx-auto text-[#0029D4]" />
            </motion.div>
          </Card>
        ) : reviews.length === 0 ? (
          <Card className="min-h-[24rem] flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="mb-6"
              >
                <FileText size={96} className="mx-auto text-automotive-slate-300" />
              </motion.div>
              <h2 className="text-2xl sm:text-3xl font-bold text-automotive-navy-900 mb-3">
                No hay informes disponibles
              </h2>
              <p className="text-automotive-slate-600 text-lg max-w-lg mx-auto">
                Tu informe de revisión aparecerá aquí una vez que esté completado y
                aprobado por nuestro equipo de profesionales
              </p>
            </motion.div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-xl transition-shadow cursor-pointer h-full">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-automotive-navy-900 mb-2">
                          {review.vehicle_year} {review.vehicle_make} {review.vehicle_model}
                        </h3>
                        {review.vehicle_vin && (
                          <p className="text-sm text-gray-600 font-mono">
                            VIN: {review.vehicle_vin}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                          <CheckCircle size={16} />
                          Completada
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      {review.vehicle_km && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Car size={18} />
                          <span className="text-sm">
                            {review.vehicle_km.toLocaleString()} km
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={18} />
                        <span className="text-sm">
                          {new Date(review.created_at).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedReviewId(review.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0029D4] text-white rounded-lg font-medium hover:bg-[#0021A0] transition"
                    >
                      <Eye size={20} />
                      Ver Informe Completo
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {selectedReviewId && (
        <ReviewDetailModal
          isOpen={true}
          onClose={() => setSelectedReviewId(null)}
          reviewId={selectedReviewId}
        />
      )}

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="border-t border-automotive-slate-200 mt-16 bg-white/50 backdrop-blur-sm"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
          <p className="text-sm font-semibold text-automotive-slate-600">
            Fran Garcia Cars &copy; {new Date().getFullYear()}
          </p>
          <p className="text-xs text-automotive-slate-500 mt-2">
            Inspecciones Premium de Vehículos
          </p>
        </div>
      </motion.footer>
    </div>
  );
}

function DisclaimerScreen({ onAccept }: { onAccept: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-automotive-navy-900 via-automotive-navy-800 to-automotive-navy-900 flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1 }}
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.8) 1px, transparent 1px),
                           radial-gradient(circle at 80% 80%, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: '60px 60px, 90px 90px',
        }}
      />

      <motion.div
        className="absolute top-0 left-0 w-96 h-96 bg-automotive-electric-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <div className="max-w-3xl w-full relative z-10">
        <GlassCard>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex justify-center mb-8">
              <motion.img
                whileHover={{ scale: 1.05 }}
                src="/frangarcia-logo.png"
                alt="Fran Garcia Cars"
                className="h-16 w-auto"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-start gap-4 mb-8 p-5 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl"
            >
              <AlertCircle className="text-amber-600 flex-shrink-0 mt-1" size={28} />
              <div>
                <h2 className="text-xl font-bold text-automotive-navy-900 mb-3">
                  Aviso Importante
                </h2>
                <p className="text-sm text-automotive-navy-800 leading-relaxed">
                  Este informe es una revisión técnica realizada por profesionales
                  independientes. No constituye una garantía del vehículo ni un
                  documento oficial de certificación.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-5 mb-8 text-sm text-automotive-navy-800 leading-relaxed"
            >
              <h3 className="font-bold text-automotive-navy-900 text-lg">
                Términos y Condiciones:
              </h3>

              <ul className="space-y-3 ml-2">
                {[
                  'Este informe refleja el estado del vehículo en el momento de la inspección',
                  'No nos responsabilizamos de problemas que puedan surgir después de la revisión',
                  'Este documento no sustituye una inspección oficial (TÜV, ITV)',
                  'No somos vendedores del vehículo, actuamos como inspectores independientes',
                  'Las fotos y comentarios son informativos y representan la opinión profesional del revisor',
                  'Se recomienda realizar una prueba de conducción propia y consultar con un mecánico de confianza antes de cualquier compra',
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <span className="w-2 h-2 bg-automotive-electric-600 rounded-full mt-2 flex-shrink-0" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="pt-4 text-automotive-slate-700 italic font-medium"
              >
                Al continuar, aceptas haber leído y comprendido estos términos.
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Button onClick={onAccept} variant="primary" size="lg" className="w-full">
                He Leído y Acepto los Términos
              </Button>
            </motion.div>
          </motion.div>
        </GlassCard>
      </div>
    </div>
  );
}
