import { motion } from 'framer-motion';
import {
  Plus,
  UserPlus,
  Zap,
} from 'lucide-react';

interface QuickActionsProps {
  onCreateReview: () => void;
  onCreateUser: () => void;
}

export function QuickActions({
  onCreateReview,
  onCreateUser,
}: QuickActionsProps) {
  const actions = [
    {
      icon: Plus,
      label: 'Nueva Revisión',
      color: 'from-automotive-electric-500 to-automotive-electric-600',
      onClick: onCreateReview,
    },
    {
      icon: UserPlus,
      label: 'Nuevo Usuario',
      color: 'from-emerald-500 to-emerald-600',
      onClick: onCreateUser,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl shadow-automotive-navy-900/10 border border-automotive-slate-200 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-automotive-navy-600 to-automotive-navy-700 flex items-center justify-center shadow-lg">
          <Zap className="text-white" size={20} />
        </div>
        <h3 className="text-lg font-bold text-automotive-navy-900">Acciones Rápidas</h3>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;

          return (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03, x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={action.onClick}
              className={`relative overflow-hidden bg-gradient-to-r ${action.color} rounded-xl p-4 text-white shadow-lg hover:shadow-2xl transition-all group`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform" />

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Icon size={24} />
                  </div>
                  <span className="font-bold text-lg">{action.label}</span>
                </div>

                {action.count !== undefined && action.count > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="bg-white text-automotive-navy-900 px-3 py-1.5 rounded-full font-bold text-sm shadow-lg"
                  >
                    {action.count}
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
