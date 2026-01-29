import { memo } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  FileText,
  UserPlus,
  CheckCircle,
  Edit,
  Trash2,
  Upload,
  Send,
  Eye,
} from 'lucide-react';
import { ActivityLogWithProfile } from '../../../lib/dashboardStats';

interface ActivityTimelineProps {
  activities: ActivityLogWithProfile[];
  loading: boolean;
}

const getActivityIcon = (action: string) => {
  if (action.includes('created')) return FileText;
  if (action.includes('user') || action.includes('registered')) return UserPlus;
  if (action.includes('completed') || action.includes('confirmed')) return CheckCircle;
  if (action.includes('updated') || action.includes('edited')) return Edit;
  if (action.includes('deleted')) return Trash2;
  if (action.includes('uploaded') || action.includes('media')) return Upload;
  if (action.includes('sent')) return Send;
  if (action.includes('viewed')) return Eye;
  return Activity;
};

const getActivityColor = (action: string) => {
  if (action.includes('created')) return 'from-blue-500 to-blue-600';
  if (action.includes('user') || action.includes('registered')) return 'from-green-500 to-green-600';
  if (action.includes('completed') || action.includes('confirmed')) return 'from-emerald-500 to-emerald-600';
  if (action.includes('updated') || action.includes('edited')) return 'from-amber-500 to-amber-600';
  if (action.includes('deleted')) return 'from-red-500 to-red-600';
  if (action.includes('uploaded') || action.includes('media')) return 'from-purple-500 to-purple-600';
  if (action.includes('sent')) return 'from-automotive-electric-500 to-automotive-electric-600';
  if (action.includes('viewed')) return 'from-cyan-500 to-cyan-600';
  return 'from-automotive-slate-500 to-automotive-slate-600';
};

function ActivityTimelineComponent({ activities, loading }: ActivityTimelineProps) {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Justo ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  const translateDescription = (description: string) => {
    const statusTranslations: Record<string, string> = {
      'confirmed': 'confirmada',
      'draft': 'borrador',
      'in_progress': 'en progreso',
      'pending_qc': 'pendiente QC',
      'sent_to_client': 'enviada a cliente',
    };

    const actionTranslations: Record<string, string> = {
      'Review status changed to': 'Estado de revisión cambiado a',
      'Review created': 'Revisión creada',
      'Review updated': 'Revisión actualizada',
      'Review deleted': 'Revisión eliminada',
      'User registered': 'Usuario registrado',
      'User created': 'Usuario creado',
      'Media uploaded': 'Media subida',
      'Document uploaded': 'Documento subido',
      'Checklist item completed': 'Item de checklist completado',
      'Checklist item updated': 'Item de checklist actualizado',
      'Review assigned': 'Revisión asignada',
      'Review unassigned': 'Revisión desasignada',
    };

    let translated = description;

    if (translated.includes('Review status changed from')) {
      const match = translated.match(/Review status changed from (\w+) to (\w+)/);
      if (match) {
        const oldStatus = statusTranslations[match[1]] || match[1];
        const newStatus = statusTranslations[match[2]] || match[2];
        translated = `Estado de revisión cambiado de ${oldStatus} a ${newStatus}`;
      }
    } else {
      for (const [key, value] of Object.entries(actionTranslations)) {
        if (translated.includes(key)) {
          translated = translated.replace(key, value);
          break;
        }
      }

      for (const [key, value] of Object.entries(statusTranslations)) {
        translated = translated.replace(new RegExp(`\\b${key}\\b`, 'gi'), value);
      }
    }

    return translated;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl shadow-automotive-navy-900/10 border border-automotive-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-automotive-navy-600 to-automotive-navy-700 flex items-center justify-center">
            <Activity className="text-white" size={20} />
          </div>
          <h3 className="text-lg font-bold text-automotive-navy-900">Actividad Reciente</h3>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-automotive-slate-100 rounded-xl animate-pulse" />
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
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-automotive-navy-600 to-automotive-navy-700 flex items-center justify-center shadow-lg">
          <Activity className="text-white" size={20} />
        </div>
        <h3 className="text-lg font-bold text-automotive-navy-900">Actividad Reciente</h3>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-automotive-slate-600">
          <Activity size={48} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No hay actividad reciente</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {activities.map((activity, index) => {
            const Icon = getActivityIcon(activity.action);
            const colorClass = getActivityColor(activity.action);

            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-automotive-slate-50 to-white hover:shadow-md transition-all border border-automotive-slate-100 group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className="text-white" size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-automotive-navy-900 mb-1">
                    {translateDescription(activity.description || activity.action)}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-automotive-slate-600">
                    {activity.user && (
                      <span className="font-medium">
                        {activity.user.full_name}
                      </span>
                    )}
                    <span>{formatTimeAgo(activity.created_at)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </motion.div>
  );
}

export const ActivityTimeline = memo(ActivityTimelineComponent);
