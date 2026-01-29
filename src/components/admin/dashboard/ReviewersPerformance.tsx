import { memo } from 'react';
import { motion } from 'framer-motion';
import { Award, TrendingUp, Clock, Star } from 'lucide-react';
import { ReviewerPerformance } from '../../../lib/dashboardStats';
import { Badge } from '../../ui/Badge';

interface ReviewersPerformanceProps {
  reviewers: ReviewerPerformance[];
  loading: boolean;
  period: 'day' | 'week' | 'month';
  onPeriodChange: (period: 'day' | 'week' | 'month') => void;
}

function ReviewersPerformanceComponent({
  reviewers,
  loading,
  period,
  onPeriodChange,
}: ReviewersPerformanceProps) {
  const getRankBadge = (index: number) => {
    if (index === 0) return { color: 'from-yellow-400 to-yellow-600', label: 'Oro', icon: '🥇' };
    if (index === 1) return { color: 'from-gray-400 to-gray-600', label: 'Plata', icon: '🥈' };
    if (index === 2) return { color: 'from-orange-400 to-orange-600', label: 'Bronce', icon: '🥉' };
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl shadow-automotive-navy-900/10 border border-automotive-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
              <Award className="text-white" size={20} />
            </div>
            <h3 className="text-lg font-bold text-automotive-navy-900">Rendimiento de Revisores</h3>
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-automotive-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl shadow-automotive-navy-900/10 border border-automotive-slate-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
            <Award className="text-white" size={20} />
          </div>
          <h3 className="text-lg font-bold text-automotive-navy-900">
            Rendimiento de Revisores
          </h3>
        </div>

        <div className="flex gap-2 bg-automotive-slate-100 p-1 rounded-lg">
          {(['day', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                period === p
                  ? 'bg-white text-automotive-navy-900 shadow-md'
                  : 'text-automotive-slate-600 hover:text-automotive-navy-900'
              }`}
            >
              {p === 'day' ? 'Hoy' : p === 'week' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      </div>

      {reviewers.length === 0 ? (
        <div className="text-center py-8 text-automotive-slate-600">
          <Award size={48} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No hay datos de revisores en este período</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviewers.map((reviewer, index) => {
            const rankBadge = getRankBadge(index);

            return (
              <div
                key={reviewer.reviewer.id}
                className="relative"
              >
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-automotive-slate-50 to-white border border-automotive-slate-200 hover:shadow-lg transition-all group">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-automotive-navy-600 to-automotive-navy-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        #{index + 1}
                      </div>
                      {rankBadge && (
                        <div className="absolute -top-1 -right-1 text-2xl">
                          {rankBadge.icon}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-automotive-navy-900 truncate mb-1">
                        {reviewer.reviewer.full_name}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-automotive-slate-600">
                        <span className="flex items-center gap-1">
                          <TrendingUp size={12} />
                          {reviewer.reviewsCompleted} completadas
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {reviewer.avgTimeHours}h promedio
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <Star className="text-amber-500" size={16} fill="currentColor" />
                        <span className="text-lg font-bold text-automotive-navy-900">
                          {reviewer.qualityRating}%
                        </span>
                      </div>
                      <div className="w-24 h-2 bg-automotive-slate-200 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${reviewer.qualityRating}%` }}
                          className={`h-full bg-gradient-to-r transition-all ${
                            reviewer.qualityRating >= 90
                              ? 'from-emerald-500 to-emerald-600'
                              : reviewer.qualityRating >= 70
                              ? 'from-amber-500 to-amber-600'
                              : 'from-red-500 to-red-600'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {rankBadge && index < 3 && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${rankBadge.color} opacity-5 rounded-xl pointer-events-none`} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

export const ReviewersPerformance = memo(ReviewersPerformanceComponent);
