import { motion } from 'framer-motion';

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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8"
        >
            {/* Total tasks */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                className="
              bg-white rounded-2xl p-6
              border border-gray-100
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
            </motion.div>

            {/* Completed */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                className="
              bg-gradient-to-br from-green-50 to-emerald-50
              rounded-2xl p-6
              border border-green-100
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
            </motion.div>

            {/* In Progress */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                className="
              bg-gradient-to-br from-yellow-50 to-amber-50
              rounded-2xl p-6
              border border-yellow-100
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
            </motion.div>

            {/* Completion rate */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                className="
              bg-gradient-to-br from-blue-50 to-indigo-50
              rounded-2xl p-6
              border border-blue-100
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
            </motion.div>
        </motion.div>
    );
}
