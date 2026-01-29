import { memo } from 'react';
import { motion } from 'framer-motion';
import { Image, Video, HardDrive, TrendingUp, Award } from 'lucide-react';
import { MediaStats as MediaStatsType } from '../../../lib/dashboardStats';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MediaStatsProps {
  stats: MediaStatsType;
  loading: boolean;
}

function MediaStatsComponent({ stats, loading }: MediaStatsProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl shadow-automotive-navy-900/10 border border-automotive-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <Image className="text-white" size={20} />
          </div>
          <h3 className="text-lg font-bold text-automotive-navy-900">Estadísticas de Media</h3>
        </div>
        <div className="h-64 bg-automotive-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl shadow-automotive-navy-900/10 border border-automotive-slate-200 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
          <Image className="text-white" size={20} />
        </div>
        <h3 className="text-lg font-bold text-automotive-navy-900">Estadísticas de Media</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div
          className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200"
        >
          <div className="flex items-center gap-2 mb-2">
            <Image className="text-blue-600" size={18} />
            <p className="text-xs font-semibold text-blue-900">Fotos Hoy</p>
          </div>
          <p className="text-2xl font-bold text-blue-900">{stats.totalPhotosToday}</p>
        </div>

        <div
          className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200"
        >
          <div className="flex items-center gap-2 mb-2">
            <Image className="text-emerald-600" size={18} />
            <p className="text-xs font-semibold text-emerald-900">Fotos Semana</p>
          </div>
          <p className="text-2xl font-bold text-emerald-900">{stats.totalPhotosWeek}</p>
        </div>

        <div
          className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200"
        >
          <div className="flex items-center gap-2 mb-2">
            <Image className="text-cyan-600" size={18} />
            <p className="text-xs font-semibold text-cyan-900">Fotos Mes</p>
          </div>
          <p className="text-2xl font-bold text-cyan-900">{stats.totalPhotosMonth}</p>
        </div>

        <div
          className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200"
        >
          <div className="flex items-center gap-2 mb-2">
            <Video className="text-purple-600" size={18} />
            <p className="text-xs font-semibold text-purple-900">Videos Mes</p>
          </div>
          <p className="text-2xl font-bold text-purple-900">{stats.totalVideosMonth}</p>
        </div>

        <div
          className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-amber-600" size={18} />
            <p className="text-xs font-semibold text-amber-900">Promedio/Revisión</p>
          </div>
          <p className="text-2xl font-bold text-amber-900">{stats.avgPhotosPerReview}</p>
        </div>

        <div
          className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200"
        >
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="text-slate-600" size={18} />
            <p className="text-xs font-semibold text-slate-900">Tamaño Total</p>
          </div>
          <p className="text-xl font-bold text-slate-900">{formatBytes(stats.totalSizeBytes)}</p>
        </div>
      </div>

      {stats.mostMediaReview && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-4 rounded-xl bg-gradient-to-br from-automotive-electric-50 to-automotive-electric-100 border border-automotive-electric-200 mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-automotive-electric-500 flex items-center justify-center">
              <Award className="text-white" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-automotive-electric-900 mb-1">
                Revisión con más media
              </p>
              <p className="text-sm font-bold text-automotive-electric-900">
                {stats.mostMediaReview.vehicleName} - {stats.mostMediaReview.mediaCount} archivos
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {stats.categoryCounts.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-automotive-navy-900 mb-4">Media por categoría</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.categoryCounts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="category"
                stroke="#64748b"
                style={{ fontSize: '11px' }}
              />
              <YAxis stroke="#64748b" style={{ fontSize: '11px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}

export const MediaStats = memo(MediaStatsComponent);
