import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Mail, MessageSquare, FileText } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface SummaryDisplayProps {
    summary: {
        tldr: string;
        decisions: string[];
        actionItems: string[];
        emailFormat: string;
        chatFormat: string;
        documentFormat: string;
    } | null;
}

type Format = 'email' | 'chat' | 'document';

export default function SummaryDisplay({ summary }: SummaryDisplayProps) {
    const [activeFormat, setActiveFormat] = useState<Format>('email');
    const [copied, setCopied] = useState(false);
    const { showToast } = useToast();

    if (!summary) {
        return (
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm h-full flex flex-col items-center justify-center text-center min-h-[300px]">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No summary available</h3>
                <p className="text-gray-500 max-w-xs">
                    Generate a leadership summary to see key insights, decisions, and action items here.
                </p>
            </div>
        );
    }

    const handleCopy = async () => {
        let textToCopy = '';
        switch (activeFormat) {
            case 'email':
                textToCopy = summary.emailFormat;
                break;
            case 'chat':
                textToCopy = summary.chatFormat;
                break;
            case 'document':
                textToCopy = summary.documentFormat;
                break;
        }

        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            showToast({
                type: 'success',
                title: 'Copied to clipboard',
                message: 'Summary ready to paste',
                duration: 2000
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            showToast({
                type: 'error',
                title: 'Copy failed',
                message: 'Please try again'
            });
        }
    };

    const formats: { id: Format; label: string; icon: any }[] = [
        { id: 'email', label: 'Email', icon: Mail },
        { id: 'chat', label: 'Chat', icon: MessageSquare },
        { id: 'document', label: 'Document', icon: FileText }
    ];

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <span className="text-xl">👔</span>
                    <h3 className="font-bold text-gray-900">Leadership Summary</h3>
                </div>

                <div className="flex items-center gap-2 bg-gray-200/50 p-1 rounded-xl">
                    {formats.map((format) => {
                        const isActive = activeFormat === format.id;
                        return (
                            <button
                                key={format.id}
                                onClick={() => setActiveFormat(format.id)}
                                className={`
                                    relative px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                                    ${isActive ? 'text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}
                                `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white rounded-lg"
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-1.5">
                                    <format.icon className="w-3.5 h-3.5" />
                                    {format.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto max-h-[500px] bg-white">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeFormat}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap font-medium leading-relaxed"
                    >
                        {activeFormat === 'email' && summary.emailFormat}
                        {activeFormat === 'chat' && summary.chatFormat}
                        {activeFormat === 'document' && summary.documentFormat}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer / Actions */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                <button
                    onClick={handleCopy}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all
                        ${copied
                            ? 'bg-green-100 text-green-700'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                        }
                    `}
                >
                    {copied ? (
                        <>
                            <Check className="w-4 h-4" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Copy className="w-4 h-4" />
                            Copy to Clipboard
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
