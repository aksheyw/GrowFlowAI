import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    Loader2,
    Sparkles,
    Check
} from 'lucide-react';

const STEPS = [
    { id: 1, text: "Analyzing Meeting Transcript...", delay: 0 },
    { id: 2, text: "Extracting Key Decisions...", delay: 1000 },
    { id: 3, text: "Identifying Risks & Blockers...", delay: 2500 },
    { id: 4, text: "Formatting for Email & Chat...", delay: 4000 }
];

interface LeadershipGenerationProgressProps {
    onComplete?: () => void;
}

export default function LeadershipGenerationProgress({ onComplete, hasData }: LeadershipGenerationProgressProps & { hasData: boolean }) {
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [isAllComplete, setIsAllComplete] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const runSequence = async () => {
            // Step 1: Start immediately
            setCompletedSteps([1]);
            setCurrentStep(2);

            // Wait for Step 2
            await new Promise(r => setTimeout(r, 1500));
            if (!isMounted) return;
            setCompletedSteps(prev => [...prev, 2]);
            setCurrentStep(3);

            // Wait for Step 3
            await new Promise(r => setTimeout(r, 1500));
            if (!isMounted) return;
            setCompletedSteps(prev => [...prev, 3]);
            setCurrentStep(4);

            // Wait for Step 4 (Formatting)
            await new Promise(r => setTimeout(r, 1500));
            if (!isMounted) return;

            // At this point, we are at Step 4.
            // We DO NOT proceed to completion automatically.
            // We wait for `hasData` to be true.
        };

        runSequence();

        return () => { isMounted = false; };
    }, []); // Run once on mount

    // Effect to handle completion when data arrives
    useEffect(() => {
        let isMounted = true;

        const completeSequence = async () => {
            if (hasData && !isAllComplete) {
                // Fast forward visual completion
                setCompletedSteps([1, 2, 3, 4]);
                setCurrentStep(5); // All done visually
                setIsAllComplete(true);

                // Wait a bit to show the final checkmark state
                await new Promise(r => setTimeout(r, 1000));
                if (!isMounted) return;

                // Signal completion to parent
                onComplete?.();
            }
        };

        completeSequence();

        return () => { isMounted = false; };
    }, [hasData, onComplete, isAllComplete]);

    return (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-2xl mx-auto my-8 min-h-[400px] flex flex-col justify-center">
            <div className="flex flex-col items-center justify-center mb-8 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={isAllComplete ? 'complete' : 'loading'}
                    className={`
                        w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg transition-colors duration-500
                        ${isAllComplete
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/20'
                            : 'bg-gradient-to-br from-slate-800 to-slate-900 shadow-slate-900/20'
                        }
                    `}
                >
                    {isAllComplete ? (
                        <Check className="w-6 h-6" />
                    ) : (
                        <Sparkles className="w-6 h-6 animate-pulse" />
                    )}
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {isAllComplete ? 'Brief Generated!' : 'Synthesizing Leadership Brief...'}
                </h3>
                <p className="text-gray-500">
                    {isAllComplete
                        ? 'Your executive summary is ready for review.'
                        : 'Our AI is processing your meeting notes to generate an executive summary.'
                    }
                </p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
                {STEPS.map((step) => {
                    const isCompleted = completedSteps.includes(step.id);
                    const isCurrent = currentStep === step.id;

                    return (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: step.id * 0.1 }}
                            className={`
                                flex items-center gap-4 p-3 rounded-xl transition-colors duration-300
                                ${isCurrent ? 'bg-slate-50 border border-slate-100' : ''}
                            `}
                        >
                            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                {isCompleted ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    >
                                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                                    </motion.div>
                                ) : isCurrent ? (
                                    <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
                                ) : (
                                    <div className="w-2 h-2 rounded-full bg-gray-200" />
                                )}
                            </div>
                            <span className={`
                                font-medium transition-colors duration-300
                                ${isCompleted ? 'text-gray-900' : isCurrent ? 'text-slate-800' : 'text-gray-400'}
                            `}>
                                {step.text}
                            </span>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
