import { memo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  ComposedChart,
} from 'recharts';
import { TrendDataPoint } from '../../../lib/dashboardStats';

interface TrendsChartProps {
  data: TrendDataPoint[];
  loading: boolean;
}

function TrendsChartComponent({ data, loading }: TrendsChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl shadow-automotive-navy-900/10 border border-automotive-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-automotive-electric-500 to-automotive-electric-600 flex items-center justify-center">
            <TrendingUp className="text-white" size={20} />
          </div>
          <h3 className="text-lg font-bold text-automotive-navy-900">Tendencias (30 días)</h3>
        </div>
        <div className="h-80 bg-automotive-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-lg border border-automotive-slate-200 rounded-xl p-4 shadow-xl">
          <p className="font-bold text-automotive-navy-900 mb-2">{formatDate(label)}</p>
          {payload.map((entry: any) => (
            <p key={entry.name} className="text-sm flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-automotive-slate-600">{entry.name}:</span>
              <span className="font-bold text-automotive-navy-900">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl shadow-automotive-navy-900/10 border border-automotive-slate-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-automotive-electric-500 to-automotive-electric-600 flex items-center justify-center shadow-lg">
            <TrendingUp className="text-white" size={20} />
          </div>
          <h3 className="text-lg font-bold text-automotive-navy-900">
            Tendencias de Revisiones (30 días)
          </h3>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-20 text-automotive-slate-600">
          <TrendingUp size={48} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No hay datos disponibles</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="completadasGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="enProgresoGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="pendienteQCGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#64748b"
              style={{ fontSize: '12px' }}
              interval="preserveStartEnd"
            />
            <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '14px', fontWeight: 600 }}
              iconType="circle"
            />

            <Area
              type="monotone"
              dataKey="completadas"
              fill="url(#completadasGradient)"
              stroke="#10b981"
              strokeWidth={2}
              isAnimationActive={false}
              name="Completadas"
            />

            <Area
              type="monotone"
              dataKey="enProgreso"
              fill="url(#enProgresoGradient)"
              stroke="#f59e0b"
              strokeWidth={2}
              isAnimationActive={false}
              name="En Progreso"
            />

            <Area
              type="monotone"
              dataKey="pendienteQC"
              fill="url(#pendienteQCGradient)"
              stroke="#3b82f6"
              strokeWidth={2}
              isAnimationActive={false}
              name="Pendiente QC"
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}

export const TrendsChart = memo(TrendsChartComponent);
