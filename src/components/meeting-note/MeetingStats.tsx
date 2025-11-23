import { Card } from '../ui/Card';

interface MeetingStatsProps {
    stats: {
        total: number;
        completed: number;
        inProgress: number;
        completionRate: number;
    };
}

export default function MeetingStats({ stats }: MeetingStatsProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            {/* Total tasks */}
            <Card
                whileHover={{ scale: 1.02 }}
                className="
              p-6
              border-gray-100
              shadow-sm
              text-center
              transition-shadow duration-200
              hover:shadow-md
            "
            >
                <div className="text-4xl font-bold text-gray-900 mb-2">
                    {stats.total}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                    Total Tasks
                </div>
                <div className="text-3xl mt-2">📋</div>
            </Card>

            {/* Completed */}
            <Card
                whileHover={{ scale: 1.02 }}
                className="
              bg-gradient-to-br from-green-50 to-emerald-50
              p-6
              border-green-100
              shadow-sm
              text-center
              transition-shadow duration-200
              hover:shadow-md
            "
            >
                <div className="text-4xl font-bold text-green-700 mb-2">
                    {stats.completed}
                </div>
                <div className="text-sm text-green-700 font-medium">
                    Completed
                </div>
                <div className="text-3xl mt-2">🌳</div>
            </Card>

            {/* In Progress */}
            <Card
                whileHover={{ scale: 1.02 }}
                className="
              bg-gradient-to-br from-yellow-50 to-amber-50
              p-6
              border-yellow-100
              shadow-sm
              text-center
              transition-shadow duration-200
              hover:shadow-md
            "
            >
                <div className="text-4xl font-bold text-yellow-700 mb-2">
                    {stats.inProgress}
                </div>
                <div className="text-sm text-yellow-700 font-medium">
                    In Progress
                </div>
                <div className="text-3xl mt-2">🪴</div>
            </Card>

            {/* Completion rate */}
            <Card
                whileHover={{ scale: 1.02 }}
                className="
              bg-gradient-to-br from-blue-50 to-indigo-50
              p-6
              border-blue-100
              shadow-sm
              text-center
              transition-shadow duration-200
              hover:shadow-md
            "
            >
                <div className="text-4xl font-bold text-blue-700 mb-2">
                    {stats.completionRate}%
                </div>
                <div className="text-sm text-blue-700 font-medium">
                    Completion
                </div>
                <div className="text-3xl mt-2">📊</div>
            </Card>
        </div>
    );
}
