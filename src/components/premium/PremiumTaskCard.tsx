import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Task } from '../../lib/supabase';
import { formatDeadline, getPlantEmoji, getProgressPercentage, getInitials } from '../../utils/premiumHelpers';
import StatusDropdown from './StatusDropdown';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface PremiumTaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
}

const PRIORITY_STYLES = {
  High: {
    badge: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    bar: 'bg-red-400 group-hover:w-1.5',
    icon: '🔥'
  },
  Medium: {
    badge: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200',
    bar: 'bg-yellow-400 group-hover:w-1.5',
    icon: '⚡'
  },
  Low: {
    badge: 'bg-green-50 text-green-700 ring-1 ring-green-200',
    bar: 'bg-green-400 group-hover:w-1.5',
    icon: '📌'
  }
};

export default function PremiumTaskCard({ task, onStatusChange }: PremiumTaskCardProps) {
  const navigate = useNavigate();
  const deadline = formatDeadline(task.deadline);
  const priorityStyle = PRIORITY_STYLES[task.priority];

  const handleCardClick = () => {
    navigate(`/task/${task.id}`);
  };

  const handleStatusChangeLocal = (newStatus: Task['status']) => {
    onStatusChange(task.id, newStatus);
  };

  const celebratePlant = (e: React.MouseEvent) => {
    e.stopPropagation();
    const element = e.currentTarget as HTMLElement;
    element.animate([
      { transform: 'scale(1) rotate(0deg)' },
      { transform: 'scale(1.3) rotate(10deg)' },
      { transform: 'scale(1.3) rotate(-10deg)' },
      { transform: 'scale(1) rotate(0deg)' }
    ], {
      duration: 600,
      easing: 'ease-out'
    });
  };

  return (
    <Card
      data-task-id={task.id}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={handleCardClick}
      className="
        group relative
        hover:shadow-xl
        transition-all duration-300 ease-out
        p-6 cursor-pointer
        h-full flex flex-col
        border-gray-100 dark:border-ios-separator-dark
      "
    >
      <div
        className={`
          absolute left-0 top-6 bottom-6 w-1 rounded-r-full
          transition-all duration-300
          ${priorityStyle.bar}
        `}
      />

      <div className="flex items-start justify-between mb-4">
        <motion.div
          whileHover={{ scale: 1.15, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={celebratePlant}
          className="text-5xl filter drop-shadow-lg cursor-pointer"
        >
          {getPlantEmoji(task.status)}
        </motion.div>

        <StatusDropdown
          currentStatus={task.status}
          onChange={handleStatusChangeLocal}
        />
      </div>

      <div className="flex-grow mb-4">
        <h3 className="
          text-lg sm:text-xl font-semibold text-gray-900 dark:text-white
          line-clamp-3
          group-hover:text-[#2D5016] dark:group-hover:text-green-400
          transition-colors duration-200
        ">
          {task.description}
        </h3>
      </div>

      <div className="mt-auto">
        <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
          <div className="flex items-center gap-2">
            {task.assignee ? (
              <>
                <div className="
                  w-8 h-8 rounded-full
                  bg-gradient-to-br from-[#6FA84C] to-[#2D5016]
                  flex items-center justify-center
                  text-white font-medium text-xs
                  shadow-sm ring-2 ring-white
                ">
                  {getInitials(task.assignee.full_name)}
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {task.assignee.full_name}
                </span>
              </>
            ) : (
              <>
                <div className="
                  w-8 h-8 rounded-full
                  bg-gray-200 dark:bg-gray-700
                  flex items-center justify-center
                  text-gray-500 font-medium text-xs
                  shadow-sm ring-2 ring-white
                ">
                  ?
                </div>
                <span className="font-medium text-gray-500 dark:text-gray-400 italic">
                  Unassigned
                </span>
              </>
            )}
          </div>

          <div
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg
              ${deadline.isOverdue
                ? 'bg-red-50 dark:bg-rose-500/20 text-red-700 dark:text-rose-300 font-semibold'
                : deadline.isDueSoon
                  ? 'bg-yellow-50 dark:bg-amber-500/20 text-yellow-700 dark:text-amber-300'
                  : 'bg-gray-50 dark:bg-ios-surface-dark text-gray-700 dark:text-gray-300'
              }
            `}
          >
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-medium">
              {deadline.text}
            </span>
          </div>

          <Badge variant={task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'success'}>
            {priorityStyle.icon} {task.priority}
          </Badge>
        </div>

        <div className="h-2 bg-gray-100 dark:bg-ios-surface-dark rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${getProgressPercentage(task.status)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className={`
              h-full rounded-full
              ${task.status === 'Done'
                ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                : 'bg-gradient-to-r from-[#6FA84C] to-[#A4D96C]'
              }
            `}
          />
        </div>
      </div>

      <div className="
        absolute inset-0 rounded-2xl
        bg-gradient-to-br from-green-500/0 to-green-500/0
        group-hover:from-green-500/5 group-hover:to-green-500/10
        transition-all duration-300 pointer-events-none
      " />
    </Card>
  );
}
