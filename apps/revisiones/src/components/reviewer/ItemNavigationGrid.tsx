import { motion } from 'framer-motion';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import type { ChecklistItemDefinition, ChecklistCategory } from '../../types/checklist';

interface ItemNavigationGridProps {
  categories: ChecklistCategory[];
  currentCategoryKey: string;
  currentItemKey: string;
  savedItems: Record<string, any>;
  onSelectItem: (categoryKey: string, itemIndex: number) => void;
}

export function ItemNavigationGrid({
  categories,
  currentCategoryKey,
  currentItemKey,
  savedItems,
  onSelectItem,
}: ItemNavigationGridProps) {
  const currentCategory = categories.find((c) => c.key === currentCategoryKey);
  if (!currentCategory) return null;

  const isItemComplete = (item: ChecklistItemDefinition) => {
    const saved = savedItems[item.key];
    if (!saved) return false;

    const hasValue = saved.value && saved.value.toString().trim().length > 0;
    return hasValue;
  };

  const isItemValid = (item: ChecklistItemDefinition) => {
    return isItemComplete(item);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
    >
      <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <h3 className="text-sm font-bold text-gray-900">{currentCategory.label}</h3>
        <p className="text-xs text-gray-600 mt-1">
          {currentCategory.items.filter(isItemComplete).length}/{currentCategory.items.length} completados
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 p-3 max-h-48 overflow-y-auto">
        {currentCategory.items.map((item, index) => {
          const isCurrentItem = item.key === currentItemKey;
          const isComplete = isItemValid(item);
          const isMandatory = item.isMandatory;

          return (
            <motion.button
              key={item.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectItem(currentCategoryKey, index)}
              className={`relative p-2 rounded-lg transition ${
                isCurrentItem
                  ? 'ring-2 ring-[#0029D4] bg-blue-50'
                  : isComplete
                  ? 'bg-green-50 border border-green-200'
                  : isMandatory
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-gray-100 border border-gray-200 hover:bg-gray-150'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <div className="text-[10px] font-bold text-gray-700 line-clamp-2 text-center leading-tight">
                  {item.label}
                </div>
                <div className="flex items-center justify-center">
                  {isComplete ? (
                    <CheckCircle2 size={16} className="text-green-600" />
                  ) : isMandatory ? (
                    <AlertCircle size={16} className="text-red-600" />
                  ) : (
                    <Circle size={16} className="text-gray-400" />
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
