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

        try {
            await navigator.clipboard.writeText(contentToCopy);
            setCopied(true);
            showToast({
                type: 'success',
                title: 'Copied!',
                message: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} format copied to clipboard.`,
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
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                        <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Leadership Brief</h3>
                        <p className="text-xs text-gray-500">Executive Summary</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* TLDR */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">TL;DR</h4>
                        <p className="text-gray-700 italic border-l-4 border-slate-200 pl-3 py-1">
                            {summary.tldr || "No summary available."}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Decisions */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Key Decisions
                            </h4>
                            {summary.decisions && summary.decisions.length > 0 ? (
                                <ul className="space-y-2">
                                    {summary.decisions.map((decision, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
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
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Risks & Actions
                            </h4>
                            {summary.actionItems && summary.actionItems.length > 0 ? (
                                <ul className="space-y-2">
                                    {summary.actionItems.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
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
            <div>
                {/* Tabs */}
                <div className="flex items-center border-b border-gray-100 bg-gray-50/50 px-4 pt-4 gap-2 overflow-x-auto scrollbar-hide">
                    <button
                        onClick={() => setActiveTab('email')}
                        className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all relative
                            ${activeTab === 'email'
                                ? 'bg-white text-slate-800 shadow-[0_-1px_2px_rgba(0,0,0,0.05)] border-t border-x border-gray-100 z-10'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                            }
                        `}
                    >
                        <Mail className="w-4 h-4" />
                        Email
                        {activeTab === 'email' && <div className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-white" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all relative
                            ${activeTab === 'chat'
                                ? 'bg-white text-slate-800 shadow-[0_-1px_2px_rgba(0,0,0,0.05)] border-t border-x border-gray-100 z-10'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                            }
                        `}
                    >
                        <MessageSquare className="w-4 h-4" />
                        Chat
                        {activeTab === 'chat' && <div className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-white" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('document')}
                        className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all relative
                            ${activeTab === 'document'
                                ? 'bg-white text-slate-800 shadow-[0_-1px_2px_rgba(0,0,0,0.05)] border-t border-x border-gray-100 z-10'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                            }
                        `}
                    >
                        <FileText className="w-4 h-4" />
                        Document
                        {activeTab === 'document' && <div className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-white" />}
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-0 relative group">
                    <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>

                    <div className="bg-white min-h-[200px] max-h-[400px] overflow-y-auto p-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'email' && (
                                    <div className="font-mono text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        {summary.emailFormat || "No email format available."}
                                    </div>
                                )}
                                {activeTab === 'chat' && (
                                    <div className="bg-blue-50 p-4 rounded-2xl rounded-tl-none inline-block max-w-full text-sm text-gray-800 whitespace-pre-wrap">
                                        {summary.chatFormat || "No chat format available."}
                                    </div>
                                )}
                                {activeTab === 'document' && (
                                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                                        {summary.documentFormat || "No document format available."}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
