import { motion } from 'framer-motion';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LoadingState() {
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    const steps = [
        "Analyzing meeting notes...",
        "Extracting key decisions...",
        "Identifying action items...",
        "Formatting for leadership..."
    ];

    useEffect(() => {
        const timeouts = steps.map((_, index) => {
            return setTimeout(() => {
                setCompletedSteps(prev => [...prev, index]);
            }, 800 * (index + 1));
        });

        return () => timeouts.forEach(clearTimeout);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-purple-100 rounded-full animate-ping opacity-20" />
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 relative z-10 border border-purple-100">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-6">Generating executive summary...</h3>

            <div className="space-y-3 w-full max-w-xs">
                {steps.map((step, index) => {
                    const isCompleted = completedSteps.includes(index);
                    const isCurrent = !isCompleted && (index === 0 || completedSteps.includes(index - 1));

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.2 }}
                            className={`flex items-center gap-3 text-sm ${isCompleted ? 'text-green-600' : isCurrent ? 'text-purple-600 font-medium' : 'text-gray-400'
                                }`}
                        >
                            <div className="w-5 h-5 flex items-center justify-center">
                                {isCompleted ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                    </motion.div>
                                ) : (
                                    <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-purple-600 animate-pulse' : 'bg-gray-200'}`} />
                                )}
                            </div>
                            {step}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
