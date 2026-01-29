import { motion } from 'framer-motion';
import { Star, TrendingUp, Clock } from 'lucide-react';
import { FeaturedClient } from '../../../lib/dashboardStats';
import { Badge } from '../../ui/Badge';

interface FeaturedClientsProps {
  clients: FeaturedClient[];
  loading: boolean;
}

export function FeaturedClients({ clients, loading }: FeaturedClientsProps) {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl shadow-automotive-navy-900/10 border border-automotive-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
            <Star className="text-white" size={20} />
          </div>
          <h3 className="text-lg font-bold text-automotive-navy-900">Clientes Destacados</h3>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-automotive-slate-100 rounded-xl animate-pulse" />
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
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg">
          <Star className="text-white" size={20} fill="currentColor" />
        </div>
        <h3 className="text-lg font-bold text-automotive-navy-900">Clientes Destacados</h3>
        <Badge variant="info" className="ml-auto">{clients.length}</Badge>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-8 text-automotive-slate-600">
          <Star size={48} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No hay clientes activos este mes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map((client, index) => (
            <motion.div
              key={client.client.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 4 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-automotive-slate-50 to-white hover:shadow-md transition-all border border-automotive-slate-100"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {client.client.full_name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-automotive-navy-900 truncate mb-1">
                  {client.client.full_name}
                </p>
                <p className="text-xs text-automotive-slate-600 truncate">
                  {client.client.email}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-automotive-electric-600" />
                  <span className="font-bold text-automotive-navy-900">
                    {client.reviewCount} revisiones
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-automotive-slate-600">
                  <Clock size={12} />
                  {formatTimeAgo(client.lastActivity)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
