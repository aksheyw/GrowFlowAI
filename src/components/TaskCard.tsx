import { useNavigate } from 'react-router-dom';
import { Task } from '../lib/supabase';
import { Calendar, Clock, Trash2, CalendarCheck, CalendarPlus, Loader2 } from 'lucide-react';
import { syncTaskToCalendar } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { useState } from 'react';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  onDelete: (taskId: string) => void;
  onMeetingClick?: (noteId: string) => void;
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

export default function TaskCard({ task, onStatusChange, onDelete, onMeetingClick }: TaskCardProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = task.google_event_id
      ? 'Are you sure you want to delete this task? This will also remove the event from your Google Calendar.'
      : 'Are you sure you want to delete this task? This action cannot be undone.';

    const confirmDelete = window.confirm(message);
    if (confirmDelete) {
      onDelete(task.id);
    }
  };

  const handleSync = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSyncing || task.google_event_id) return;

    setIsSyncing(true);
    try {
      await syncTaskToCalendar(task.id, task.user_id);
      showToast({ type: 'success', title: 'Added to Calendar', message: 'Task has been synced to your Google Calendar.' });
      // Note: In a real app, we'd expect the task prop to update via realtime subscription or parent refresh
      // For now, we'll just show the success toast
    } catch (error) {
      showToast({ type: 'error', title: 'Sync Failed', message: 'Could not add task to calendar.' });
    } finally {
      setIsSyncing(false);
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
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 smooth-transition cursor-pointer flex flex-col h-full group hover:-translate-y-1"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl leading-none">{PLANT_STAGES[task.status]}</div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${PRIORITY_COLORS[task.priority]}`}>
            {task.priority}
          </span>

          {/* Calendar Sync Status/Action */}
          {task.google_event_id ? (
            <div className="p-1.5 text-blue-600 bg-blue-50 rounded-lg" title="Synced to Google Calendar">
              <CalendarCheck className="w-4 h-4" />
            </div>
          ) : (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg smooth-transition button-press disabled:opacity-50"
              title="Add to Google Calendar"
            >
              {isSyncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CalendarPlus className="w-4 h-4" />
              )}
            </button>
          )}

          <button
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg smooth-transition button-press"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 mb-4">
        <p className="text-gray-900 font-medium text-[15px] leading-snug line-clamp-3 min-h-[63px]">
          {task.description}
        </p>
      </div>

      <div className="space-y-2.5 mt-auto">
        <div className="flex items-center gap-2 min-h-[24px]">
          {task.assignee ? (
            <>
              <div className="w-6 h-6 rounded-full bg-green-700 text-white flex items-center justify-center text-xs font-medium flex-shrink-0">
                {getInitials(task.assignee.full_name)}
              </div>
              <span className="text-sm text-gray-600 truncate">{task.assignee.full_name}</span>
            </>
          ) : (
            <span className="text-sm text-gray-400 italic">No assignee</span>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 min-h-[20px]">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{formatDate(task.deadline)}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 min-h-[18px]">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">Created: {formatCreatedAt(task.created_at)}</span>
        </div>

        {task.note?.meeting_title && (
          <div className="flex items-center gap-2 text-xs text-gray-700 min-h-[20px]">
            <span>📅</span>
            <span className="text-gray-600">From:</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onMeetingClick && task.note?.id) {
                  onMeetingClick(task.note.id);
                }
              }}
              className="font-medium text-blue-600 hover:text-blue-800 hover:underline smooth-transition"
            >
              {task.note.meeting_title}
            </button>
            {task.note.meeting_date && (
              <span className="text-gray-500">
                - {new Date(task.note.meeting_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
        )}

        <div className="pt-1">
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Status</label>
          <select
            value={task.status}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              onStatusChange(task.id, e.target.value as Task['status']);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white hover:border-green-700 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none smooth-transition cursor-pointer"
          >
            <option value="Not Started" className="text-gray-900 bg-white">🌱 Not Started</option>
            <option value="In Progress" className="text-gray-900 bg-white">🌿 In Progress</option>
            <option value="Done" className="text-gray-900 bg-white">🌳 Done</option>
          </select>
        </div>
      </div>
    </div>
  );
}
