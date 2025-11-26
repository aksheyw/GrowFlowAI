import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Music, CheckCircle2, Sparkles } from 'lucide-react';

interface CompressionProgressModalProps {
    isVisible: boolean;
    progress: number;
    stage: 'loading' | 'preparing' | 'compressing' | 'finalizing' | 'complete' | 'uploading' | 'transcribing';
    fileName: string;
    originalSize: string;
    estimatedSize?: string;
}

const stageMessages = {
    loading: 'Loading compression engine...',
    preparing: 'Preparing audio file...',
    compressing: 'Compressing audio...',
    finalizing: 'Finalizing compression...',
    complete: 'Compression complete!',
    uploading: 'Uploading to server...',
    transcribing: 'Transcribing with AI...'
};

const stageIcons = {
    loading: Loader2,
    preparing: Music,
    compressing: Sparkles,
    finalizing: Sparkles,
    complete: CheckCircle2,
    uploading: Loader2,
    transcribing: Sparkles
};

export default function CompressionProgressModal({
    isVisible,
    progress,
    stage,
    fileName,
    originalSize,
    estimatedSize
}: CompressionProgressModalProps) {
    const Icon = stageIcons[stage];
    const isSpinning = stage !== 'complete';

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl"
                    >
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className={`
                w-20 h-20 rounded-full flex items-center justify-center
                ${stage === 'complete'
                                    ? 'bg-green-100'
                                    : 'bg-gradient-to-br from-green-100 to-emerald-100'
                                }
              `}>
                                <Icon
                                    className={`
                    w-10 h-10 
                    ${stage === 'complete' ? 'text-green-600' : 'text-[#6FA84C]'}
                    ${isSpinning ? 'animate-spin' : ''}
                  `}
                                />
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                            {stageMessages[stage]}
                        </h3>

                        {/* File info */}
                        <p className="text-sm text-gray-500 text-center mb-6 truncate">
                            {fileName}
                        </p>

                        {/* Progress bar */}
                        <div className="mb-4">
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-[#6FA84C] to-[#A4D96C] rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                            <div className="flex justify-between mt-2 text-sm text-gray-500">
                                <span>{progress}%</span>
                                {stage === 'compressing' && estimatedSize && (
                                    <span>{originalSize} → ~{estimatedSize}</span>
                                )}
                            </div>
                        </div>

                        {/* Tip */}
                        <p className="text-xs text-gray-400 text-center">
                            {stage === 'loading' && 'First-time setup may take a moment...'}
                            {stage === 'compressing' && 'Optimizing for speech recognition...'}
                            {stage === 'transcribing' && 'Converting speech to text...'}
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
