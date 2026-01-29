import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface EnhancedProgressIndicatorProps {
  completedItems: number;
  totalItems: number;
  completedMandatory: number;
  totalMandatory: number;
  currentCategoryLabel: string;
  currentItemIndex: number;
  currentCategoryItemCount: number;
}

export function EnhancedProgressIndicator({
  completedItems,
  totalItems,
  completedMandatory,
  totalMandatory,
  currentCategoryLabel,
  currentItemIndex,
  currentCategoryItemCount,
}: EnhancedProgressIndicatorProps) {
  const progressPercentage = (completedItems / totalItems) * 100;
  const mandatoryPercentage = (completedMandatory / totalMandatory) * 100;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Progreso General
            </div>
            <div className="text-lg font-bold text-gray-900 mt-1">
              {completedItems}/{totalItems} preguntas
            </div>
          </div>
          <motion.div
            key={Math.round(progressPercentage)}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-right"
          >
            <div className="text-2xl font-bold text-[#0029D4]">
              {Math.round(progressPercentage)}%
            </div>
          </motion.div>
        </div>

        <motion.div
          className="w-full bg-gray-200 rounded-full h-3 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-gradient-to-r from-[#0029D4] to-blue-500 h-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-50 rounded-lg p-3 border border-blue-200"
        >
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={16} className="text-blue-600" />
            <span className="text-xs font-semibold text-blue-900">Completadas</span>
          </div>
          <div className="text-lg font-bold text-blue-700">{completedItems}</div>
          <div className="text-xs text-blue-600 mt-1">de {totalItems} total</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-red-50 rounded-lg p-3 border border-red-200"
        >
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={16} className="text-red-600" />
            <span className="text-xs font-semibold text-red-900">Obligatorias</span>
          </div>
          <div className="text-lg font-bold text-red-700">{completedMandatory}/{totalMandatory}</div>
          <motion.div
            className="w-full bg-red-200 rounded-full h-1.5 overflow-hidden mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-red-600 h-full"
              initial={{ width: 0 }}
              animate={{ width: `${mandatoryPercentage}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-3 text-white"
      >
        <div className="text-xs font-semibold text-gray-300 uppercase tracking-wide mb-2">
          Pregunta Actual
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-sm">{currentCategoryLabel}</div>
            <div className="text-xs text-gray-400 mt-1">
              Pregunta {currentItemIndex + 1} de {currentCategoryItemCount}
            </div>
          </div>
          <motion.div
            className="text-2xl font-bold"
            key={currentItemIndex}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {currentItemIndex + 1}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
