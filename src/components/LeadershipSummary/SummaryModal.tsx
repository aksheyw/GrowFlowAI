import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, RefreshCw, AlertTriangle } from 'lucide-react';
import { Note } from '../../lib/supabase';
import { useSummaryGenerator } from './hooks/useSummaryGenerator';
import FormatSelector from './FormatSelector';
import LoadingState from './LoadingState';
import SummaryPreview from './SummaryPreview';
import { useToast } from '../../contexts/ToastContext';

interface SummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    note: Note;
    userId?: string;
    onSummaryGenerated?: (summary: {
        tldr: string;
        decisions: string[];
        actionItems: string[];
        emailFormat: string;
        chatFormat: string;
        documentFormat: string;
    }) => void;
}

export default function SummaryModal({ isOpen, onClose, note, userId, onSummaryGenerated }: SummaryModalProps) {
    const { showToast } = useToast();
    const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

    const {
        isLoading,
        isRegenerating,
        format,
        summaryData,
        error,
        generateSummary,
        regenerate,
        setState
    } = useSummaryGenerator(note.id, {
        content: note.content,
        title: note.meeting_title || 'Untitled Meeting',
        userId: userId,
        date: note.meeting_date || undefined
    }, note.leadership_summary, onSummaryGenerated);

    useEffect(() => {
        if (isOpen && !summaryData && !isLoading && !error) {
            generateSummary();
        }
    }, [isOpen, summaryData, isLoading, error, generateSummary]);

    const handleCopy = async () => {
        if (!summaryData) return;

        let textToCopy = '';
        switch (format) {
            case 'email':
                textToCopy = summaryData.emailFormat;
                break;
            case 'chat':
                textToCopy = summaryData.chatFormat;
                break;
            case 'document':
                textToCopy = summaryData.documentFormat;
                break;
        }

        try {
            await navigator.clipboard.writeText(textToCopy);
            showToast({
                type: 'success',
                title: 'Copied to clipboard',
                message: 'Summary ready to paste',
                duration: 2000
            });
            if (navigator.vibrate) navigator.vibrate(50);
        } catch (err) {
            console.error('Failed to copy:', err);
            showToast({
                type: 'error',
                title: 'Copy failed',
                message: 'Please try again'
            });
        }
    };

    const handleRegenerateClick = () => {
        setShowRegenerateConfirm(true);
    };

    const confirmRegenerate = () => {
        setShowRegenerateConfirm(false);
        regenerate();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="bg-white dark:bg-ios-card-dark w-full max-w-2xl h-[85vh] sm:h-[800px] sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col relative z-10 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-ios-separator-dark">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-xl">
                                    👔
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Leadership Summary</h2>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
                                            BETA
                                        </span>
                                        {summaryData && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                <Check className="w-3 h-3" />
                                                Saved
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-ios-surface-dark rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-hidden flex flex-col relative">
                            {/* Format Selector */}
                            <div className="p-4 pb-0">
                                <FormatSelector
                                    currentFormat={format}
                                    onFormatChange={(fmt) => setState(prev => ({ ...prev, format: fmt }))}
                                />
                            </div>

                            {/* Main Area */}
                            <div className="flex-1 overflow-y-auto p-4">
                                {isLoading || isRegenerating ? (
                                    <LoadingState />
                                ) : error ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                        <div className="w-12 h-12 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                                            <AlertTriangle className="w-6 h-6 text-red-500 dark:text-red-400" />
                                        </div>
                                        <p className="text-red-600 dark:text-red-400 font-medium mb-2">{error}</p>
                                        <button
                                            onClick={() => regenerate()}
                                            className="text-sm text-gray-500 dark:text-gray-400 underline hover:text-gray-700 dark:hover:text-gray-300"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                ) : summaryData ? (
                                    <SummaryPreview
                                        data={summaryData}
                                        format={format}
                                    />
                                ) : null}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100 dark:border-ios-separator-dark bg-gray-50/50 dark:bg-ios-surface-dark/50 flex items-center justify-between gap-3">
                            <button
                                onClick={handleRegenerateClick}
                                disabled={isLoading || isRegenerating}
                                className="px-4 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-ios-card-dark rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                                Regenerate
                            </button>

                            <button
                                onClick={handleCopy}
                                disabled={isLoading || isRegenerating || !summaryData}
                                className="flex-1 sm:flex-none px-6 py-2.5 bg-[#2D5016] text-white font-medium rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                <Copy className="w-4 h-4" />
                                Copy to Clipboard
                            </button>
                        </div>

                        {/* Confirmation Overlay */}
                        <AnimatePresence>
                            {showRegenerateConfirm && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-20 bg-white/90 dark:bg-ios-card-dark/90 backdrop-blur-sm flex items-center justify-center p-6"
                                >
                                    <div className="text-center max-w-xs">
                                        <div className="w-12 h-12 bg-yellow-50 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Regenerate Summary?</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                            This will overwrite the existing summary with a new AI-generated version.
                                        </p>
                                        <div className="flex gap-3 justify-center">
                                            <button
                                                onClick={() => setShowRegenerateConfirm(false)}
                                                className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-ios-surface-dark rounded-lg"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={confirmRegenerate}
                                                className="px-4 py-2 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 shadow-sm"
                                            >
                                                Yes, Regenerate
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
