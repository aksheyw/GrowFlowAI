import { motion } from 'framer-motion';
import { X, Calendar, User, CheckCircle2, CalendarPlus, CalendarCheck, Loader2 } from 'lucide-react';
import { Task } from '../lib/supabase';
import { getPriorityColor, getStatusColor } from '../utils/premiumHelpers';
import { useEffect, useRef, useState } from 'react';
import { syncTaskToCalendar } from '../lib/api';
import { useToast } from '../contexts/ToastContext';

import { Trash2 } from 'lucide-react';

interface TaskDetailModalProps {
    task: Task;
    onClose: () => void;
    onUpdate: (task: Task) => void;
    onDelete: () => void;
}

export default function TaskDetailModal({ task, onClose, onUpdate, onDelete }: TaskDetailModalProps) {
    const contentRef = useRef<HTMLDivElement>(null);
    const { showToast } = useToast();
    const [isSyncing, setIsSyncing] = useState(false);

    // ... (useEffect and handleSync) ...

    const handleDelete = () => {
        const message = task.google_event_id
            ? 'Are you sure you want to delete this task? This will also remove the event from your Google Calendar.'
            : 'Are you sure you want to delete this task? This action cannot be undone.';

        if (window.confirm(message)) {
            onDelete();
        }
    };

    useEffect(() => {
        // Reset scroll on mount
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
        // Also reset window scroll just in case
        window.scrollTo(0, 0);
    }, []);

    const handleSync = async () => {
        if (task.google_event_id || isSyncing) return;

        setIsSyncing(true);
        try {
            await syncTaskToCalendar(task.id, task.user_id);
            showToast({
                type: 'success',
                title: 'Added to Calendar',
                message: 'Task has been synced to your Google Calendar.'
            });
            // Ideally we'd update the task object here to reflect the new google_event_id
            // For now, the toast confirms the action.
        } catch {
            showToast({
                type: 'error',
                title: 'Sync Failed',
                message: 'Could not add task to calendar. Please try again.'
            });
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-start justify-between flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 line-clamp-2">{task.description}</h2>
                        <div className="flex items-center gap-3 mt-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                {task.status}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                {task.priority} Priority
                            </span>
                            {/* Sync Status Badge */}
                            {task.google_event_id && (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 flex items-center gap-1">
                                    <CalendarCheck className="w-3 h-3" /> Synced
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDelete}
                            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                            title="Delete Task"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div ref={contentRef} className="p-6 space-y-6 overflow-y-auto flex-1">
                    {/* Description */}
                    {task.description && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                            <p className="text-gray-700 leading-relaxed">{task.description}</p>
                        </div>
                    )}
                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Deadline */}
                        {task.deadline && (
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                                    <Calendar className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Due Date</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(task.deadline).toLocaleDateString(undefined, {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Assignee */}
                        {task.assignee && (
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Assignee</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {task.assignee.avatar_url && (
                                            <img
                                                src={task.assignee.avatar_url}
                                                alt={task.assignee.full_name}
                                                className="w-5 h-5 rounded-full"
                                            />
                                        )}
                                        <p className="text-sm text-gray-500">{task.assignee.full_name}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    {/* Sync Button */}
                    {!task.google_event_id && (
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSyncing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <CalendarPlus className="w-4 h-4" />
                            )}
                            Add to Calendar
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-gray-600 font-medium hover:bg-gray-200 transition-colors"
                    >
                        Close
                    </button>
                    {task.status !== 'Done' && (
                        <button
                            onClick={() => {
                                onUpdate({ ...task, status: 'Done' });
                                onClose();
                            }}
                            className="px-6 py-2 rounded-xl bg-[#2D5016] text-white font-medium hover:bg-[#1a2f0d] transition-colors flex items-center gap-2"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Mark Complete
                        </button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
