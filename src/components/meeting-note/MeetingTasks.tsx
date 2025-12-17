import { CheckSquare, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Task } from '../../lib/supabase';
import { isTaskOverdue, isTaskDueSoon } from '../../utils/meetingHelpers';
import { getPlantEmoji, formatDeadline, getInitials } from '../../utils/premiumHelpers';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

type TaskFilter = 'all' | 'not_started' | 'in_progress' | 'done';

interface MeetingTasksProps {
    tasks: Task[];
    filter: TaskFilter;
    onFilterChange: (filter: TaskFilter) => void;
}

export default function MeetingTasks({ tasks, filter, onFilterChange }: MeetingTasksProps) {
    const navigate = useNavigate();

    return (
        <Card
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="p-6 border-gray-100 shadow-sm"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-[#6FA84C]" />
                    Tasks
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-ios-surface-dark px-2 py-1 rounded-lg">
                    {tasks.length}
                </span>
            </div>

            {/* Task Filters */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                {(['all', 'not_started', 'in_progress', 'done'] as const).map((f) => (
                    <Button
                        key={f}
                        onClick={() => onFilterChange(f)}
                        variant={filter === f ? 'primary' : 'secondary'}
                        size="sm"
                        className="whitespace-nowrap"
                    >
                        {f.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </Button>
                ))}
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <Card
                            key={task.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="
                                p-4 rounded-xl border border-gray-100 dark:border-ios-separator-dark bg-gray-50 dark:bg-ios-surface-dark
                                hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/30 dark:hover:bg-blue-900/20
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
                                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                                        {task.description}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        {task.assignee && (
                                            <div className="flex items-center gap-1">
                                                <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300">
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
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                        No tasks found for this filter
                    </div>
                )}
            </div>
        </Card>
    );
}
