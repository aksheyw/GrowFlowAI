import { motion } from 'framer-motion';
import { Download, Share2, Trash2, ChevronRight } from 'lucide-react';

interface MeetingActionsProps {
    onExport: () => void;
    onShare: () => void;
    onDelete: () => void;
    onGenerateSummary: () => void;
    hasSummary?: boolean;
}

export default function MeetingActions({
    onExport,
    onShare,
    onDelete,
    onGenerateSummary,
    hasSummary = false
}: MeetingActionsProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
                <button
                    onClick={onGenerateSummary}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all group transform hover:scale-[1.02] ${hasSummary
                        ? 'bg-white border-purple-200 hover:border-purple-300 hover:shadow-md'
                        : 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 hover:border-purple-300 hover:shadow-md'
                        }`}
                >
                    <div className="flex flex-col items-start text-left">
                        <span className="flex items-center gap-2 font-bold text-purple-900">
                            <span className="text-xl">👔</span>
                            {hasSummary ? 'Regenerate Summary' : 'Generate Summary'}
                        </span>
                        <span className="text-xs text-purple-700 ml-7">For leadership team</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-purple-400 group-hover:text-purple-600" />
                </button>

                <button
                    onClick={onExport}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors group"
                >
                    <span className="flex items-center gap-3 font-medium">
                        <Download className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
                        Export Notes
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                    onClick={onShare}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors group"
                >
                    <span className="flex items-center gap-3 font-medium">
                        <Share2 className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
                        Share Meeting
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>


                <button
                    onClick={onDelete}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 transition-colors group mt-4"
                >
                    <span className="flex items-center gap-3 font-medium">
                        <Trash2 className="w-5 h-5" />
                        Delete Meeting
                    </span>
                </button>
            </div>
        </motion.div>
    );
}
