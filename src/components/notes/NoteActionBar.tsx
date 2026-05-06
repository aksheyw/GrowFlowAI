import { motion } from 'framer-motion';
import {
    FileText,
    AlignLeft,
    CheckCircle2,
    Lightbulb,
    Sparkles,
    Briefcase,
    Loader2
} from 'lucide-react';

interface NoteActionBarProps {
    stats: {
        characterCount: number;
        wordCount: number;
        estimatedTasks: number;
    };
    loadExample: () => void;
    processingMode: 'tasks' | 'brief';
    setProcessingMode: (mode: 'tasks' | 'brief') => void;
    handleProcess: () => void;
    isValid: boolean;
    isProcessing: boolean;
    isTranscribing: boolean;
}

export default function NoteActionBar({
    stats,
    loadExample,
    processingMode,
    setProcessingMode,
    handleProcess,
    isValid,
    isProcessing,
    isTranscribing
}: NoteActionBarProps) {
    const { characterCount, wordCount, estimatedTasks } = stats;

    return (
        <div className="
      px-6 sm:px-8 py-5
      bg-white dark:bg-ios-card-dark border-t border-gray-100 dark:border-ios-separator-dark
      flex flex-col lg:flex-row lg:items-center justify-between
      gap-6
    ">
            {/* Left Side: Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 w-full lg:w-auto">
                <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>{characterCount.toLocaleString()} chars</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-300" />
                <div className="flex items-center gap-1.5">
                    <AlignLeft className="w-4 h-4" />
                    <span>{wordCount.toLocaleString()} words</span>
                </div>

                {/* Estimated tasks badge */}
                {characterCount > 50 && estimatedTasks > 0 && (
                    <>
                        <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full font-medium text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>~{estimatedTasks} tasks</span>
                        </div>
                    </>
                )}

                <button
                    onClick={loadExample}
                    className="
            ml-auto lg:ml-6
            text-green-600 hover:text-green-700
            font-medium transition-colors
            flex items-center gap-1.5
            px-3 py-1.5 rounded-lg hover:bg-green-50
          "
                >
                    <Lightbulb className="w-4 h-4" />
                    <span>Try Example</span>
                </button>
            </div>

            {/* Right Side: Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">

                {/* Mode Toggle */}
                <div className="bg-gray-100 dark:bg-ios-surface-dark p-1 rounded-xl grid grid-cols-2 gap-1 sm:w-auto">
                    <button
                        onClick={() => setProcessingMode('tasks')}
                        className={`
              flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${processingMode === 'tasks'
                                ? 'bg-white dark:bg-ios-card-dark text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-white/5'
                            }
            `}
                    >
                        <Sparkles className={`w-4 h-4 ${processingMode === 'tasks' ? 'text-[#6FA84C]' : 'text-gray-400'}`} />
                        <span>Tasks</span>
                    </button>
                    <button
                        onClick={() => setProcessingMode('brief')}
                        className={`
              flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${processingMode === 'brief'
                                ? 'bg-white dark:bg-ios-card-dark text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-white/5'
                            }
            `}
                    >
                        <Briefcase className={`w-4 h-4 ${processingMode === 'brief' ? 'text-[#6FA84C]' : 'text-gray-400'}`} />
                        <span>Brief</span>
                    </button>
                </div>

                {/* Process Button */}
                <motion.button
                    whileHover={{ scale: isValid ? 1.02 : 1 }}
                    whileTap={{ scale: isValid ? 0.98 : 1 }}
                    disabled={!isValid || isProcessing || isTranscribing}
                    onClick={handleProcess}
                    className={`
            px-6 py-3 rounded-xl
            font-semibold text-sm sm:text-base
            transition-all duration-200
            flex items-center justify-center gap-2
            shadow-lg shadow-green-900/5
            ${isValid && !isTranscribing
                            ? 'bg-gradient-to-br from-[#355E1F] to-[#6FA84C] hover:shadow-lg hover:shadow-green-900/20 text-white shadow-md shadow-green-900/10'
                            : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/20 cursor-not-allowed border border-transparent dark:border-white/5'
                        }
          `}
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Processing...</span>
                        </>
                    ) : (
                        <>
                            {processingMode === 'tasks' ? <Sparkles className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                            <span>Process Note & Tasks</span>
                        </>
                    )}
                </motion.button>
            </div>
        </div>
    );
}
