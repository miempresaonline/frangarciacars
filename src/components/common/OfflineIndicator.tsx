import { WifiOff } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { motion, AnimatePresence } from 'framer-motion';

export function OfflineIndicator() {
    const isOnline = useNetworkStatus();

    return (
        <AnimatePresence>
            {!isOnline && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-yellow-500 text-white overflow-hidden"
                >
                    <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium">
                        <WifiOff size={16} />
                        <span>Modo sin conexión - Los cambios se guardarán en tu dispositivo</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
