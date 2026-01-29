import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertCircle } from 'lucide-react';
import type { ChecklistItemDefinition } from '../../types/checklist';

interface QuickAccessDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  incompleteItems: ChecklistItemDefinition[];
  onSelectItem: (itemKey: string) => void;
}

export function QuickAccessDrawer({
  isOpen,
  onToggle,
  incompleteItems,
  onSelectItem,
}: QuickAccessDrawerProps) {
  return (
    <motion.div className="fixed bottom-20 left-3 right-3 z-20">
      <motion.button
        onClick={onToggle}
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-xl px-4 py-3 flex items-center justify-between font-semibold shadow-lg"
        whileHover={{ y: -2 }}
      >
        <div className="flex items-center gap-2">
          <AlertCircle size={20} />
          <span className="text-sm">{incompleteItems.length} pendientes</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown size={20} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-white border-2 border-orange-500 rounded-b-xl shadow-xl max-h-48 overflow-y-auto"
          >
            <div className="p-2 space-y-1">
              {incompleteItems.map((item) => (
                <motion.button
                  key={item.key}
                  onClick={() => {
                    onSelectItem(item.key);
                    onToggle();
                  }}
                  whileHover={{ x: 4 }}
                  className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-orange-50 transition border-l-4 border-orange-500 group"
                >
                  <div className="text-xs font-bold text-gray-900 group-hover:text-orange-700 line-clamp-2">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-gray-600 mt-1 group-hover:text-orange-600">
                    Campo obligatorio
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
