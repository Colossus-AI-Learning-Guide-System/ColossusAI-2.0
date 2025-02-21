import { motion, AnimatePresence } from "framer-motion";
import { XIcon } from "lucide-react";

interface FeaturePopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function FeaturePopup({
  isOpen,
  onClose,
  title,
  description,
  icon,
}: FeaturePopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            {/* Popup Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-2xl mx-auto px-4"
            >
              <div className="bg-[#1a1a1a] backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl relative">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                  <XIcon className="w-6 h-6" />
                </button>

                {/* Content */}
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 transform transition-transform group-hover:scale-110 duration-300">
                    {icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-4 text-[#e1e1e1]">
                      {title}
                    </h3>
                    <div className="text-gray-400 leading-relaxed whitespace-pre-line space-y-4">
                      {description.split("\n\n").map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
