import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Copy, Check } from 'lucide-react';
import { useSummaryGenerator } from './hooks/useSummaryGenerator';
import FormatSelector from './FormatSelector';
import SummaryPreview from './SummaryPreview';
import LoadingState from './LoadingState';
import { useToast } from '../../contexts/ToastContext';
import { useState } from 'react';

import { Note } from '../../lib/supabase';

interface SummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    note: Note;
    userId?: string;
}

export default function SummaryModal({ isOpen, onClose, note, userId }: SummaryModalProps) {
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
        title: note.meeting_title || 'Meeting Notes',
        userId,
        date: note.meeting_date || undefined
    });

    const { showToast } = useToast();
    const [buttonText, setButtonText] = useState('Copy to Clipboard →');

    // Generate summary when modal opens
    useEffect(() => {
        if (isOpen && !summaryData && !isLoading) {
            generateSummary();
        }
    }, [isOpen, summaryData, isLoading, generateSummary]);

    const handleCopy = async () => {
        // Get the text content from the preview (re-generating it here for simplicity, 
        // ideally we'd extract the logic from SummaryPreview or pass it up)
        // For now, I'll just use a simple selector or ref if I could, but since I can't easily access the child state,
        // I will duplicate the logic or move it to a shared helper. 
        // Actually, let's just grab the text content from the DOM for now as a quick hack, 
        // OR better, move the formatting logic to a helper file.
        // I'll assume the user copies what they see.
        // Wait, I should probably move the formatting logic to a helper to be clean.
        // For this iteration, I will just rely on the user copying manually or implement the helper.
        // Let's implement the helper logic inside handleCopy for now by importing the logic or duplicating it.
        // I'll duplicate the logic for now to save time and avoid creating another file, but I should refactor later.

        // Actually, I can just use the DOM textContent of the preview container if I attach a ref.
        // But that's brittle.
        // Let's just re-calculate it.

        if (!summaryData) return;

        let text = '';
        // ... (Logic from SummaryPreview) ...
        // To avoid code duplication, I should have put it in a helper. 
        // I'll do that in a future refactor. For now, I will just put a placeholder or try to implement it.

        // Let's just re-implement the switch case here quickly.
        const data = summaryData;
        switch (format) {
            case 'email':
                text = `Subject: ${data.subject}\n\nHi [Recipient Name],\n\nHere's the executive summary of our meeting held on [Date]:\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📊 TLDR\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${data.tldr}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🎯 KEY DECISIONS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${data.keyDecisions.map(d => `• ${d}`).join('\n')}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n✅ ACTION ITEMS & OWNERS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${data.actionItems.map(item => `• ${item.task} - Owner: ${item.owner} - Due: ${item.deadline}`).join('\n')}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n💡 DISCUSSION HIGHLIGHTS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${data.highlights.map(h => `• ${h}`).join('\n')}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n➡️ NEXT STEPS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${data.nextSteps.map(s => `• ${s}`).join('\n')}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nView full meeting details: [Link to meeting note page]\n\nBest regards,\n[Your name]`;
                break;
            case 'chat':
                text = `📊 Meeting Summary\n\n**TLDR:** ${data.tldr}\n\n**Key Decisions:**\n${data.keyDecisions.map(d => `✓ ${d}`).join('\n')}\n\n**Action Items:**\n${data.actionItems.map(item => `• ${item.task} → @${item.owner} (Due: ${item.deadline})`).join('\n')}\n\n**Highlights:**\n${data.highlights.map(h => `• ${h}`).join('\n')}\n\n**Next Steps:**\n${data.nextSteps.map(s => `→ ${s}`).join('\n')}\n\n🔗 Full details: [Link]`;
                break;
            case 'document':
                text = `LEADERSHIP SUMMARY\n[Meeting Title]\n[Date] | [Participants count] participants\n\n─────────────────────────────────────\n\nEXECUTIVE SUMMARY\n\n${data.tldr}\n\n─────────────────────────────────────\n\nKEY DECISIONS MADE\n\n${data.keyDecisions.map((d, i) => `${i + 1}. ${d}`).join('\n\n')}\n\n─────────────────────────────────────\n\nACTION ITEMS & OWNERSHIP\n\n${data.actionItems.map(item => `${item.task.padEnd(30)} ${item.owner.padEnd(15)} ${item.deadline.padEnd(12)} ${item.priority}`).join('\n')}\n\n─────────────────────────────────────\n\nDISCUSSION HIGHLIGHTS\n\n${data.highlights.map(h => `• ${h}`).join('\n')}\n\n─────────────────────────────────────\n\nNEXT STEPS & TIMELINE\n\nImmediate (Next 24-48 hours):\n${data.nextSteps.slice(0, 2).map(s => `• ${s}`).join('\n')}\n\nShort-term (This week):\n${data.nextSteps.slice(2).map(s => `• ${s}`).join('\n')}`;
                break;
        }

        try {
            await navigator.clipboard.writeText(text);
            showToast({
                type: 'success',
                title: 'Summary copied!',
                message: 'Ready to paste into your email or chat',
                duration: 3
            });
            if (navigator.vibrate) navigator.vibrate(50);
            setButtonText('Copied ✓');
            setTimeout(() => setButtonText('Copy to Clipboard →'), 2000);
        } catch (err) {
            showToast({
                type: 'error',
                title: 'Copy failed',
                message: 'Please try again',
                duration: 3
            });
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-white z-10">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    Generate Leadership Summary
                                    <span className="text-xs font-normal px-2 py-1 bg-purple-100 text-purple-700 rounded-full border border-purple-200">BETA</span>
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">AI-powered executive summary for leadership team</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                            {isLoading ? (
                                <LoadingState />
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4">
                                        <X className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Failed to generate summary</h3>
                                    <p className="text-gray-500 mb-6 max-w-md">{error}</p>
                                    <button
                                        onClick={() => generateSummary()}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : summaryData ? (
                                <div className="space-y-6">
                                    <div className="max-w-md mx-auto">
                                        <FormatSelector
                                            currentFormat={format}
                                            onFormatChange={(f) => setState(prev => ({ ...prev, format: f }))}
                                        />
                                    </div>

                                    <SummaryPreview data={summaryData} format={format} />
                                </div>
                            ) : null}
                        </div>

                        {/* Footer */}
                        {!isLoading && !error && summaryData && (
                            <div className="p-6 border-t border-gray-100 bg-white flex items-center justify-between gap-4">
                                <button
                                    onClick={regenerate}
                                    disabled={isRegenerating}
                                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                                    {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                                </button>

                                <button
                                    onClick={handleCopy}
                                    className={`
                                        flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white shadow-lg shadow-purple-200 transition-all transform active:scale-95
                                        ${buttonText === 'Copied ✓' ? 'bg-green-600 hover:bg-green-700' : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600'}
                                    `}
                                >
                                    {buttonText === 'Copied ✓' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {buttonText}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
