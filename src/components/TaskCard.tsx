import { useNavigate } from 'react-router-dom';
import { Task } from '../lib/supabase';
import { Calendar, Clock, Trash2 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  onDelete: (taskId: string) => void;
}

const PLANT_STAGES = {
  'Not Started': '🌱',
  'In Progress': '🌿',
  'Done': '🌳'
};

const PRIORITY_COLORS = {
  Low: 'bg-blue-100 text-blue-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  High: 'bg-red-100 text-red-700'
};

export default function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  const navigate = useNavigate();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this task? This action cannot be undone.'
    );
    if (confirmDelete) {
      onDelete(task.id);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatCreatedAt = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div
      onClick={() => navigate(`/task/${task.id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-4xl">{PLANT_STAGES[task.status]}</div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
            {task.priority}
          </span>
          <button
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-gray-900 font-medium mb-4 line-clamp-3">
        {task.description}
      </p>

      <div className="space-y-3">
        {task.assignee && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-700 text-white flex items-center justify-center text-xs font-medium">
              {getInitials(task.assignee.full_name)}
            </div>
            <span className="text-sm text-gray-600">{task.assignee.full_name}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(task.deadline)}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-3.5 h-3.5" />
          <span>Created: {formatCreatedAt(task.created_at)}</span>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select
            value={task.status}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              onStatusChange(task.id, e.target.value as Task['status']);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
      </div>
    </div>
  );
}
