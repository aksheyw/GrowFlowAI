import { motion } from 'framer-motion';
import { CheckSquare, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Task } from '../../lib/supabase';
import { isTaskOverdue, isTaskDueSoon } from '../../utils/meetingHelpers';
import { getPlantEmoji, formatDeadline, getInitials } from '../../utils/premiumHelpers';

type TaskFilter = 'all' | 'not_started' | 'in_progress' | 'done';

interface MeetingTasksProps {
    tasks: Task[];
    filter: TaskFilter;
    onFilterChange: (filter: TaskFilter) => void;
}

export default function MeetingTasks({ tasks, filter, onFilterChange }: MeetingTasksProps) {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-[#6FA84C]" />
                    Tasks
                </h3>
                <span className="text-sm text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-lg">
                    {tasks.length}
                </span>
            </div>

            {/* Task Filters */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                {(['all', 'not_started', 'in_progress', 'done'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => onFilterChange(f)}
                        className={`
                            px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors
                            ${filter === f
                                ? 'bg-[#2D5016] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                        `}
                    >
                        {f.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </button>
                ))}
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <motion.div
                            key={task.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="
                                p-4 rounded-xl border border-gray-100 bg-gray-50
                                hover:border-blue-200 hover:bg-blue-50/30
                                transition-all duration-200
                                cursor-pointer group
                            "
                            onClick={() => navigate(`/task/${task.id}`)}
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    {getPlantEmoji(task.status)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors">
                                        {task.description}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                        {task.assignee && (
                                            <div className="flex items-center gap-1">
                                                <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                                    {getInitials(task.assignee.full_name)}
                                                </div>
                                                <span className="truncate max-w-[80px]">
                                                    {task.assignee.full_name.split(' ')[0]}
                                                </span>
                                            </div>
                                        )}
                                        {task.deadline && (
                                            <div className={`flex items-center gap-1 ${isTaskOverdue(task) ? 'text-red-600 font-medium' :
                                                isTaskDueSoon(task) ? 'text-amber-600' : ''
                                                }`}>
                                                <Clock className="w-3 h-3" />
                                                <span>{formatDeadline(task.deadline).text}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors" />
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        No tasks found for this filter
                    </div>
                )}
            </div>
        </motion.div>
    );
}
