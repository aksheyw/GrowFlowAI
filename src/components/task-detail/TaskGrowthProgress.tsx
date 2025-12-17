import { CheckCircle2 } from 'lucide-react';

interface TaskGrowthProgressProps {
    status: string;
}

export default function TaskGrowthProgress({ status }: TaskGrowthProgressProps) {
    const stages = [
        { id: 'seed', label: 'Seed', sub: 'Ready to plant', status: 'Not Started' },
        { id: 'sprout', label: 'Sprout', sub: 'Growing nicely', status: 'In Progress' },
        { id: 'bloom', label: 'Full Bloom', sub: 'Completed!', status: 'Done' }
    ];

    const currentIndex = stages.findIndex(s => s.status === status);
    const progress = status === 'Done' ? 100 : status === 'In Progress' ? 50 : 10;

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {stages.map((stage, idx) => {
                    const isCompleted = idx <= currentIndex;
                    const isCurrent = idx === currentIndex;

                    return (
                        <div key={stage.id} className={`flex items-start gap-3 ${isCompleted ? 'opacity-100' : 'opacity-50'}`}>
                            <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center border-2 flex-shrink-0
                  ${isCompleted
                                    ? 'bg-[#2D5016] border-[#2D5016] text-white'
                                    : 'border-gray-300 dark:border-gray-600 text-transparent'}
                `}>
                                {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                            </div>
                            <div>
                                <div className={`font-medium ${isCurrent ? 'text-[#2D5016] dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                                    {stage.label}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{stage.sub}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="h-2 bg-gray-100 dark:bg-ios-surface-dark rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-[#2D5016] to-[#6FA84C] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
