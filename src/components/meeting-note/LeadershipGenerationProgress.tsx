import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    Loader2,
    Sparkles
} from 'lucide-react';

const STEPS = [
    { id: 1, text: "Analyzing Meeting Transcript...", delay: 0 },
    { id: 2, text: "Extracting Key Decisions...", delay: 2000 },
    { id: 3, text: "Identifying Risks & Blockers...", delay: 5000 },
    { id: 4, text: "Formatting for Email & Chat...", delay: 8000 }
];

export default function LeadershipGenerationProgress() {
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [currentStep, setCurrentStep] = useState<number>(1);

    useEffect(() => {
        // Step 1 is instant
        setCompletedSteps([1]);
        setCurrentStep(2);

        // Schedule other steps
        const timers: NodeJS.Timeout[] = [];

        STEPS.slice(1).forEach((step) => {
            const timer = setTimeout(() => {
                setCompletedSteps(prev => [...prev, step.id]);
                if (step.id < STEPS.length) {
                    setCurrentStep(step.id + 1);
                } else {
                    setCurrentStep(step.id + 1); // All done
                }
            }, step.delay);
            timers.push(timer);
        });

        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-2xl mx-auto my-8">
            <div className="flex flex-col items-center justify-center mb-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white mb-4 shadow-lg shadow-slate-900/20">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Synthesizing Leadership Brief...</h3>
                <p className="text-gray-500">Our AI is processing your meeting notes to generate an executive summary.</p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
                {STEPS.map((step) => {
                    const isCompleted = completedSteps.includes(step.id);
                    const isCurrent = currentStep === step.id;
                    const isPending = !isCompleted && !isCurrent;

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
