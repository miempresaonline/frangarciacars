import { memo } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { AdvancedStats } from '../../../lib/dashboardStats';

interface AdvancedStatsCardsProps {
  stats: AdvancedStats;
  loading: boolean;
}

interface StatCardProps {
  icon: any;
  label: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  color: string;
  delay?: number;
}

function StatCard({ icon: Icon, label, value, trend, trendLabel, color, delay = 0 }: StatCardProps) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl shadow-xl shadow-automotive-navy-900/10 border border-automotive-slate-200 p-6 relative overflow-hidden group"
    >
      <motion.div
        className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity`}
      />

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-xl shadow-lg flex items-center justify-center`}>
          <Icon className="text-white" size={24} />
        </div>

        {trend !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
            trend >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <p className="text-4xl font-bold text-automotive-navy-900 mb-2 relative z-10">
        {value}
      </p>

      <p className="text-sm font-semibold text-automotive-slate-600 relative z-10 mb-1">
        {label}
      </p>

      {trendLabel && (
        <p className="text-xs text-automotive-slate-500 relative z-10">
          {trendLabel}
        </p>
      )}
    </motion.div>
  );
}

function AdvancedStatsCardsComponent({ stats, loading }: AdvancedStatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-48 bg-white rounded-2xl shadow-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        icon={CheckCircle}
        label="Total Revisiones"
        value={stats.totalReviews}
        color="from-automotive-electric-500 to-automotive-electric-600"
        delay={0}
      />

      <StatCard
        icon={Users}
        label="Total Usuarios"
        value={stats.totalUsers}
        color="from-cyan-500 to-cyan-600"
        delay={0.1}
      />

      <StatCard
        icon={CheckCircle}
        label="Total Completadas"
        value={stats.totalCompleted}
        color="from-emerald-500 to-emerald-600"
        delay={0.2}
      />

      <StatCard
        icon={Clock}
        label="Total En Progreso"
        value={stats.totalInProgress}
        color="from-amber-500 to-amber-600"
        delay={0.3}
      />
    </div>
  );
}

export const AdvancedStatsCards = memo(AdvancedStatsCardsComponent);
