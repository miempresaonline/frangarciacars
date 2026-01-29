import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Alert } from '../../../lib/dashboardStats';
import { Badge } from '../../ui/Badge';

interface SmartAlertsProps {
  alerts: Alert[];
  loading: boolean;
}

export function SmartAlerts({ alerts, loading }: SmartAlertsProps) {
  const getAlertConfig = (type: Alert['type']) => {
    switch (type) {
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'from-red-50 to-red-100',
          borderColor: 'border-red-300',
          iconColor: 'text-red-600',
          badgeColor: 'bg-red-600',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'from-orange-50 to-orange-100',
          borderColor: 'border-orange-300',
          iconColor: 'text-orange-600',
          badgeColor: 'bg-orange-600',
        };
      case 'info':
        return {
          icon: Info,
          bgColor: 'from-blue-50 to-blue-100',
          borderColor: 'border-blue-300',
          iconColor: 'text-blue-600',
          badgeColor: 'bg-blue-600',
        };
    }
  };

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="min-w-[320px] h-24 bg-white rounded-xl shadow-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-4">
        <AlertCircle className="text-automotive-navy-900" size={24} />
        <h3 className="text-lg font-bold text-automotive-navy-900">Alertas Inteligentes</h3>
        <Badge variant="danger" className="ml-2">{alerts.length}</Badge>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        <AnimatePresence>
          {alerts.map((alert, index) => {
            const config = getAlertConfig(alert.type);
            const Icon = config.icon;

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`min-w-[320px] bg-gradient-to-br ${config.bgColor} border-2 ${config.borderColor} rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group cursor-pointer`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`w-12 h-12 rounded-xl ${config.iconColor} bg-white/50 backdrop-blur-sm flex items-center justify-center shadow-lg`}
                      >
                        <Icon size={24} />
                      </motion.div>

                      <div>
                        <h4 className="font-bold text-automotive-navy-900 text-base mb-1">
                          {alert.title}
                        </h4>
                        <p className="text-sm text-automotive-navy-700 font-medium">
                          {alert.description}
                        </p>
                      </div>
                    </div>

                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className={`${config.badgeColor} text-white px-3 py-1.5 rounded-full font-bold text-sm shadow-lg`}
                    >
                      {alert.count}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </motion.div>
  );
}
