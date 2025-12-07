import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

const TIPS = [
    "Include names of people mentioned (e.g., \"Alex will complete...\")",
    "Mention deadlines or timeframes explicitly (\"by Nov 15th\", \"this week\")",
    "Use keywords like \"urgent\", \"ASAP\", or \"critical\" for high-priority tasks",
    "Start each task on a new line for better detection",
    "Include meeting context (who was present, what was discussed)"
];

interface NotesTipsProps {
    isVisible: boolean;
}

export default function NotesTips({ isVisible }: NotesTipsProps) {
    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 sm:px-0 mt-8"
        >
            <div className="
                p-6 sm:p-8
                bg-gradient-to-br from-blue-50 to-indigo-50
                rounded-2xl border border-blue-100
                max-w-4xl mx-auto
            ">
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                    <div className="
                        w-10 h-10 rounded-xl
                        bg-gradient-to-br from-blue-500 to-indigo-600
                        flex items-center justify-center
                        flex-shrink-0
                    ">
                        <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            Tips for better results
                        </h3>
                        <p className="text-sm text-gray-600">
                            Help our AI extract tasks more accurately
                        </p>
                    </div>
                </div>

                {/* Tips list */}
                <div className="space-y-3 ml-0 sm:ml-13">
                    {TIPS.map((tip, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 + (index * 0.1) }}
                            className="flex items-start gap-3"
                        >
                            <div className="
                                w-6 h-6 rounded-full
                                bg-white border border-blue-200
                                flex items-center justify-center
                                text-xs font-bold text-blue-600
                                flex-shrink-0 mt-0.5
                                shadow-sm
                            ">
                                {index + 1}
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                {tip}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
