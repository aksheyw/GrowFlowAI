import { motion } from 'framer-motion';
import { Download, Share2, RefreshCw, Trash2, Loader2, ChevronRight } from 'lucide-react';

interface MeetingActionsProps {
    onExport: () => void;
    onShare: () => void;
    onReprocess: () => void;
    onDelete: () => void;
    isReprocessing: boolean;
}

export default function MeetingActions({
    onExport,
    onShare,
    onReprocess,
    onDelete,
    isReprocessing
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
                    onClick={onReprocess}
                    disabled={isReprocessing}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="flex items-center gap-3 font-medium">
                        {isReprocessing ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <RefreshCw className="w-5 h-5" />
                        )}
                        Reprocess AI
                    </span>
                    {!isReprocessing && <ChevronRight className="w-4 h-4 text-blue-400" />}
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
