import { motion } from 'framer-motion';
import { UserPlus, CheckCircle, Clock, User } from 'lucide-react';
import { RecentUser } from '../../../lib/dashboardStats';
import { Badge } from '../../ui/Badge';

interface RecentUsersProps {
  users: RecentUser[];
  loading: boolean;
}

export function RecentUsers({ users, loading }: RecentUsersProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl shadow-automotive-navy-900/10 border border-automotive-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-automotive-electric-500 to-automotive-electric-600 flex items-center justify-center">
            <UserPlus className="text-white" size={20} />
          </div>
          <h3 className="text-lg font-bold text-automotive-navy-900">Usuarios Recientes</h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-automotive-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl shadow-automotive-navy-900/10 border border-automotive-slate-200 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-automotive-electric-500 to-automotive-electric-600 flex items-center justify-center shadow-lg">
          <UserPlus className="text-white" size={20} />
        </div>
        <h3 className="text-lg font-bold text-automotive-navy-900">Usuarios Recientes</h3>
        <Badge variant="primary" className="ml-auto">{users.length}</Badge>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-8 text-automotive-slate-600">
          <User size={48} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No hay usuarios recientes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 4 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-automotive-slate-50 to-white hover:shadow-md transition-all border border-automotive-slate-100"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-automotive-navy-600 to-automotive-navy-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user.full_name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-automotive-navy-900 truncate">
                  {user.full_name}
                </p>
                <p className="text-sm text-automotive-slate-600 truncate">{user.email}</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Badge
                  variant={user.role === 'reviewer' ? 'warning' : 'info'}
                  className="text-xs"
                >
                  {user.role === 'reviewer' ? 'Revisor' : user.role === 'admin' ? 'Admin' : 'Cliente'}
                </Badge>

                <div className="flex items-center gap-1 text-xs text-automotive-slate-600">
                  <Clock size={12} />
                  {formatDate(user.created_at)}
                </div>

                {user.role === 'reviewer' && user.hasCompletedReview !== undefined && (
                  <div className="flex items-center gap-1 text-xs">
                    {user.hasCompletedReview ? (
                      <>
                        <CheckCircle size={12} className="text-emerald-600" />
                        <span className="text-emerald-600 font-medium">Primera revisión completa</span>
                      </>
                    ) : (
                      <>
                        <Clock size={12} className="text-amber-600" />
                        <span className="text-amber-600 font-medium">Sin revisiones</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
