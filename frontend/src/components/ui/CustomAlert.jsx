// frontend/src/components/ui/CustomAlert.jsx
import { motion, AnimatePresence } from 'framer-motion';

const GlassAlert = ({ isOpen, onClose, onConfirm, title, message, type = 'alert' }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/30 bg-white/10 p-6 shadow-2xl backdrop-blur-md"
                    >
                        <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />

                        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                        <p className="text-white/80 mb-6">{message}</p>

                        <div className="flex gap-3">
                            {type === 'confirm' && (
                                <button
                                    onClick={onClose}
                                    className="flex-1 rounded-xl bg-white/5 py-3 font-semibold text-white/70 transition-colors hover:bg-white/10 border border-white/10"
                                >
                                    Cancelar
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    if (onConfirm) onConfirm();
                                    onClose();
                                }}
                                className={`flex-1 rounded-xl py-3 font-semibold text-white transition-colors active:scale-95 ${
                                    type === 'confirm' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white/20 hover:bg-white/30'
                                }`}
                            >
                                {type === 'confirm' ? 'Confirmar' : 'Entendido'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default GlassAlert;