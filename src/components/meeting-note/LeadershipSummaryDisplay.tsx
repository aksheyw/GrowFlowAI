import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase,
    Mail,
    MessageSquare,
    FileText,
    Copy,
    Check,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface LeadershipSummary {
    tldr: string;
    decisions: string[];
    actionItems: string[]; // Risks/Action Items
    emailFormat: string;
    chatFormat: string;
    documentFormat: string;
}

interface LeadershipSummaryDisplayProps {
    summary: LeadershipSummary;
}

type FormatTab = 'email' | 'chat' | 'document';

export default function LeadershipSummaryDisplay({ summary }: LeadershipSummaryDisplayProps) {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<FormatTab>('email');
    const [copied, setCopied] = useState(false);

    if (!summary) return null; // Safety check

    const handleCopy = async () => {
        let contentToCopy = '';
        switch (activeTab) {
            case 'email':
                contentToCopy = summary.emailFormat;
                break;
            case 'chat':
                contentToCopy = summary.chatFormat;
                break;
            case 'document':
                contentToCopy = summary.documentFormat;
                break;
        }

        if (!contentToCopy) {
            showToast({
                type: 'error',
                title: 'Nothing to copy',
                message: 'This section appears to be empty.',
            });
            return;
        }

        try {
            await navigator.clipboard.writeText(contentToCopy);
            setCopied(true);
            showToast({
                type: 'success',
                title: 'Copied!',
                message: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} format copied.`,
                duration: 2000
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            showToast({
                type: 'error',
                title: 'Copy failed',
                message: 'Please try again.',
            });
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            {/* Header Section */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-slate-50 to-white">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shadow-sm">
                        <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">Leadership Brief</h3>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Executive Summary</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* TLDR */}
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">TL;DR</h4>
                        <p className="text-gray-800 italic leading-relaxed">
                            {summary.tldr || "No summary available."}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Decisions */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-green-600" /> Key Decisions
                            </h4>
                            {summary.decisions && summary.decisions.length > 0 ? (
                                <ul className="space-y-2.5">
                                    {summary.decisions.map((decision, idx) => (
                                        <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-700 leading-snug">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0 shadow-sm" />
                                            {decision}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-400 italic">No key decisions recorded.</p>
                            )}
                        </div>

                        {/* Risks / Action Items */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4 text-amber-500" /> Risks & Actions
                            </h4>
                            {summary.actionItems && summary.actionItems.length > 0 ? (
                                <ul className="space-y-2.5">
                                    {summary.actionItems.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-700 leading-snug">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 shadow-sm" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-400 italic">No major risks or actions.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Formats Section */}
            <div className="bg-gray-50/30">
                {/* Tabs */}
                <div className="flex items-center border-b border-gray-100 px-4 pt-2 gap-2 overflow-x-auto scrollbar-hide">
                    {['email', 'chat', 'document'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as FormatTab)}
                            className={`
                                flex items-center gap-2 px-4 py-3 rounded-t-lg text-sm font-medium transition-all relative
                                ${activeTab === tab
                                    ? 'bg-white text-green-800 shadow-[0_-2px_6px_rgba(0,0,0,0.02)] border-t border-x border-gray-100 z-10'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                                }
                            `}
                        >
                            {tab === 'email' && <Mail className="w-4 h-4" />}
                            {tab === 'chat' && <MessageSquare className="w-4 h-4" />}
                            {tab === 'document' && <FileText className="w-4 h-4" />}
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            {activeTab === tab && <div className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-white" />}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="bg-white min-h-[200px] max-h-[400px] overflow-y-auto p-6 border-b border-gray-100">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'email' && (
                                <div className="font-mono text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-5 rounded-xl border border-gray-100 leading-relaxed">
                                    {summary.emailFormat || "No email format available."}
                                </div>
                            )}
                            {activeTab === 'chat' && (
                                <div className="bg-blue-50/50 p-5 rounded-2xl rounded-tl-none inline-block max-w-full text-sm text-slate-800 whitespace-pre-wrap leading-relaxed border border-blue-100/50">
                                    {summary.chatFormat || "No chat format available."}
                                </div>
                            )}
                            {activeTab === 'document' && (
                                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap p-2">
                                    {summary.documentFormat || "No document format available."}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Copy Button Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={handleCopy}
                        className={`
                            w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                            ${copied
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300 hover:text-green-700 hover:shadow-sm'
                            }
                        `}
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied to Clipboard!' : `Copy ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
                    </button>
                </div>
            </div>
        </div>
    );
}