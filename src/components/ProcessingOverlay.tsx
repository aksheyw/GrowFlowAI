import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';

interface ProcessingStep {
    label: string;
    description: string;
}

interface ProcessingOverlayProps {
    isVisible: boolean;
    currentStep: number;
    onCancel: () => void;
    showCancel: boolean;
}

const PROCESSING_STEPS: ProcessingStep[] = [
    {
        label: 'Reading your notes',
        description: 'Analyzing meeting content...'
    },
    {
        label: 'Identifying tasks',
        description: 'Finding action items...'
    },
    {
        label: 'Extracting details',
        description: 'Getting assignees, dates, priorities...'
    },
    {
        label: 'Creating your garden',
        description: 'Planting seeds in your dashboard...'
    }
];

export default function ProcessingOverlay({
    isVisible,
    currentStep,
    onCancel,
    showCancel
}: ProcessingOverlayProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="
            fixed inset-0 z-50
            bg-gradient-to-br from-green-900/90 to-emerald-900/90
            backdrop-blur-md
            flex items-center justify-center
            p-6
          "
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="
              bg-white dark:bg-[#1C1C1E] rounded-3xl p-8 sm:p-12
              shadow-2xl dark:shadow-black/50
              max-w-lg w-full
              text-center
              border border-transparent dark:border-[#38383A]
            "
                    >
                        {/* Animated plant growing */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 10, -10, 0],
                                y: [0, -10, 0]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="text-7xl sm:text-8xl mb-6 sm:mb-8 inline-block"
                        >
                            🌱
                        </motion.div>

                        {/* Main headline */}
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                            Planting your seeds...
                        </h2>

                        {/* Subtitle */}
                        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
                            Our AI is extracting tasks from your notes
                        </p>

                        {/* Progress steps */}
                        <div className="space-y-4">
                            {PROCESSING_STEPS.map((step, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{
                                        opacity: currentStep >= index ? 1 : 0.3,
                                        x: 0
                                    }}
                                    transition={{ duration: 0.3, delay: index * 0.2 }}
                                    className="flex items-center gap-4"
                                >
                                    {/* Icon */}
                                    <div className={`
                    w-10 h-10 rounded-xl flex-shrink-0
                    flex items-center justify-center
                    transition-all duration-300
                    ${currentStep > index
                                            ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                                            : currentStep === index
                                                ? 'bg-gradient-to-br from-blue-400 to-indigo-500 animate-pulse'
                                                : 'bg-gray-200 dark:bg-gray-700'
                                        }
                  `}>
                                        {currentStep > index ? (
                                            <Check className="w-5 h-5 text-white" />
                                        ) : currentStep === index ? (
                                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                                        ) : (
                                            <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
                                        )}
                                    </div>

                                    {/* Text */}
                                    <div className="flex-1 text-left">
                                        <p className={`
                      text-sm sm:text-base font-medium
                      transition-colors duration-300
                      ${currentStep >= index ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-500'}
                    `}>
                                            {step.label}
                                        </p>
                                        {currentStep === index && (
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-xs text-gray-500 dark:text-gray-400 mt-0.5"
                                            >
                                                {step.description}
                                            </motion.p>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Cancel button (shown after 3 seconds) */}
                        {showCancel && (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                onClick={onCancel}
                                className="
                  mt-6 sm:mt-8 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300
                  transition-colors duration-200
                  underline underline-offset-2
                "
                            >
                                Cancel processing
                            </motion.button>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
