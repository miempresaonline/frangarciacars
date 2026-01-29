import { X, AlertCircle, Camera, Video, FileText, CheckSquare, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { IncompleteItem } from '../../lib/reviews';

interface IncompleteItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  incompleteItems: IncompleteItem[];
}

export function IncompleteItemsModal({ isOpen, onClose, incompleteItems }: IncompleteItemsModalProps) {
  const groupedByCategory = incompleteItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = {
        label: item.categoryLabel,
        items: [],
      };
    }
    acc[item.category].items.push(item);
    return acc;
  }, {} as Record<string, { label: string; items: IncompleteItem[] }>);

  const getValueTypeIcon = (valueType: string) => {
    switch (valueType) {
      case 'text':
        return <FileText size={16} className="text-blue-500" />;
      case 'number':
        return <Hash size={16} className="text-green-500" />;
      case 'select':
        return <CheckSquare size={16} className="text-purple-500" />;
      case 'boolean':
        return <CheckSquare size={16} className="text-yellow-500" />;
      default:
        return <FileText size={16} className="text-gray-500" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[90vh] bg-white rounded-xl shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle size={20} className="text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Revisión Incompleta</h2>
                  <p className="text-sm text-gray-600">
                    Completa todos los items para enviar a QC
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {Object.entries(groupedByCategory).map(([categoryKey, category]) => (
                <div key={categoryKey} className="mb-6 last:mb-0">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">{category.label}</h3>
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                      {category.items.length} pendiente{category.items.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {category.items.map((item, index) => (
                      <div
                        key={`${item.itemKey}-${index}`}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">{getValueTypeIcon(item.valueType)}</div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-2">{item.itemLabel}</h4>
                            <div className="space-y-1.5">
                              {item.missingValue && (
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                  <span>Falta completar el valor</span>
                                </div>
                              )}
                              {item.missingPhotos > 0 && (
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <Camera size={14} className="text-blue-600" />
                                  <span>
                                    Faltan {item.missingPhotos} foto{item.missingPhotos > 1 ? 's' : ''}
                                    {item.currentPhotos > 0 && (
                                      <span className="text-gray-500 ml-1">
                                        ({item.currentPhotos} de {item.requiredPhotos})
                                      </span>
                                    )}
                                  </span>
                                </div>
                              )}
                              {item.missingVideos && (
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <Video size={14} className="text-purple-600" />
                                  <span>Falta video</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Continuar Completando
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
