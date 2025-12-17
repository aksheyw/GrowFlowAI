import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, Task, Profile } from '../lib/supabase';
import {
  ArrowLeft,
  Clock,
  User,
  Loader2,
  Plus,
  Trash2,
  FileText,
  Calendar,
  CheckCircle2,
  Copy,
  Share2,
  Edit2,
  AlertTriangle,
  CalendarPlus,
  CalendarCheck
} from 'lucide-react';
import PlantIcon from '../components/PlantIcon';
import { useToast } from '../contexts/ToastContext';
import { getPlantEmoji, formatDeadline, getInitials, cleanSummary } from '../utils/premiumHelpers';
import { formatTimeAgo, formatDateShort } from '../utils/meetingHelpers';
import TaskGrowthProgress from '../components/task-detail/TaskGrowthProgress';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { syncTaskToCalendar } from '../lib/api';
import Select from '../components/ui/Select';
import DatePicker from '../components/ui/DatePicker';

interface TaskWithDetails extends Task {
  creator?: Profile;
}

export default function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  // State
  const [task, setTask] = useState<TaskWithDetails | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [relatedTasks, setRelatedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [highlightDate, setHighlightDate] = useState(false);
  const dateInputRef = useRef<HTMLDivElement>(null);

  // Fetch Data
  const loadTaskAndProfiles = useCallback(async () => {
    try {
      // 1. Fetch Task & Profiles
      const [taskResult, profilesResult] = await Promise.all([
        supabase
          .from('tasks')
          .select(`
            *,
            assignee:assignee_id(id, full_name, email, avatar_url),
            creator:user_id(id, full_name, email, avatar_url),
            note:note_id(id, content, meeting_title, meeting_date, meeting_participants, meeting_location, meeting_summary, created_at)
          `)
          .eq('id', taskId)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('*')
          .order('full_name')
      ]);

      if (taskResult.error) throw taskResult.error;
      if (profilesResult.error) throw profilesResult.error;

      if (!taskResult.data) {
        throw new Error('Task not found');
      }

      setTask(taskResult.data);
      setProfiles(profilesResult.data || []);
      setDescriptionValue(taskResult.data.description || '');

      // 2. Fetch Related Tasks (Siblings) if note exists
      if (taskResult.data.note_id) {
        const { data: siblings, error: siblingsError } = await supabase
          .from('tasks')
          .select('*, assignee:assignee_id(full_name)')
          .eq('note_id', taskResult.data.note_id)
          .neq('id', taskId) // Exclude current task
          .order('created_at');

        if (!siblingsError) {
          setRelatedTasks(siblings || []);
        }
      }

    } catch (error) {
      console.error('Error loading task:', error);
      showToast({ type: 'error', title: 'Failed to load task', message: 'Please try again' });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [taskId, showToast, navigate]);

  useEffect(() => {
    if (taskId) {
      loadTaskAndProfiles();
    }
  }, [taskId, loadTaskAndProfiles]);

  // Handlers
  async function handleUpdate(updates: Partial<Task>) {
    if (!task) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', task.id);

      if (error) throw error;

      setTask({ ...task, ...updates });
      showToast({ type: 'success', title: 'Updated', message: 'Task updated successfully' });
    } catch (error) {
      console.error('Error updating:', error);
      showToast({ type: 'error', title: 'Error', message: 'Failed to update task' });
    }
  }

  async function handleDescriptionSave() {
    if (descriptionValue !== task?.description) {
      await handleUpdate({ description: descriptionValue });
    }
    setIsEditingDescription(false);
  }

  async function handleSync() {
    if (!task || task.google_event_id || isSyncing) return;

    // Check if due date is set
    if (!task.deadline) {
      showToast({
        type: 'info',
        title: 'Date Required',
        message: 'Please set a due date to add to calendar'
      });

      // Scroll to date input
      dateInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Trigger highlight animation
      setHighlightDate(true);
      setTimeout(() => setHighlightDate(false), 2000);
      return;
    }

    setIsSyncing(true);
    try {
      await syncTaskToCalendar(task.id, task.user_id);
      showToast({
        type: 'success',
        title: 'Added to Calendar',
        message: 'Task has been synced to your Google Calendar.'
      });
      // Refresh task data to get the new google_event_id
      loadTaskAndProfiles();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Sync Failed',
        message: 'Could not add task to calendar. Please try again.'
      });
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleDelete() {
    if (!task) return;

    const message = task.google_event_id
      ? 'Are you sure you want to delete this task? This will also remove the event from your Google Calendar.'
      : 'Are you sure you want to delete this task? This action cannot be undone.';

    // We already have a modal, so we might not need window.confirm if the modal text is updated dynamically.
    // However, the current modal has static text. Let's update the modal text instead of using window.confirm here,
    // OR we can just proceed since the modal is the confirmation.
    // Actually, the modal text should be dynamic. 
    // For now, let's just proceed with deletion as the modal is the confirmation step.
    // BUT, the modal text needs to be updated to reflect the sync status.

    setDeleting(true);
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', task.id);
      if (error) throw error;
      showToast({ type: 'success', title: 'Deleted', message: 'Task deleted successfully' });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting:', error);
      showToast({ type: 'error', title: 'Error', message: 'Failed to delete task' });
      setDeleting(false);
    }
  }

  async function handleDuplicate() {
    if (!task) return;
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          description: `Copy of ${task.description}`,
          status: 'Not Started',
          priority: task.priority,
          note_id: task.note_id,
          user_id: task.user_id, // Keep original creator or current user? Using original for now
          assignee_id: task.assignee_id,
          deadline: task.deadline
        })
        .select()
        .single();

      if (error) throw error;

      showToast({ type: 'success', title: 'Duplicated', message: 'Task duplicated successfully' });
      navigate(`/task/${data.id}`);
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to duplicate task' });
    }
  }

  // Render Helpers
  const getGrowthProgress = (status: string) => {
    return <TaskGrowthProgress status={status} />;
  };


  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#2D5016] animate-spin" />
    </div>
  );

  if (!task) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20 md:pb-0">
      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors group pl-0 hover:bg-transparent"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Dashboard
          <span className="text-gray-400">/</span>
          <span className="font-medium text-gray-900">Task Details</span>
        </Button>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Hero Section */}
        <Card
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 sm:p-8 shadow-xl border-gray-100 relative overflow-hidden mb-6 sm:mb-8 group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 pointer-events-none" />

          <div className="relative flex flex-col md:flex-row gap-4 sm:gap-8 items-start">
            {/* Large Emoji - Responsive sizing */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="text-5xl sm:text-8xl md:text-9xl flex-shrink-0 cursor-default select-none"
            >
              {getPlantEmoji(task.status)}
            </motion.div>

            <div className="flex-1 w-full">
              {/* Status Badge (Top Right on Desktop) */}
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className="hidden md:block" /> {/* Spacer */}
                <Badge variant={task.status === 'Done' ? 'success' : task.status === 'In Progress' ? 'warning' : 'neutral'} className="text-sm px-3 py-1.5">
                  {task.status === 'Done' ? '🌳 Done' :
                    task.status === 'In Progress' ? '🌿 In Progress' :
                      '🌱 Not Started'}
                </Badge>
                {task.google_event_id && (
                  <Badge variant="info" className="text-sm px-3 py-1.5 ml-2 flex items-center gap-1">
                    <CalendarCheck className="w-3 h-3" /> Synced
                  </Badge>
                )}
              </div>

              {/* Editable Description */}
              <div className="mb-4 sm:mb-6">
                {isEditingDescription ? (
                  <textarea
                    ref={descriptionRef}
                    value={descriptionValue}
                    onChange={(e) => setDescriptionValue(e.target.value)}
                    onBlur={handleDescriptionSave}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleDescriptionSave();
                      }
                    }}
                    className="w-full text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-[#6FA84C] focus:outline-none resize-none"
                    rows={2}
                    autoFocus
                  />
                ) : (
                  <h1
                    onClick={() => setIsEditingDescription(true)}
                    className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 cursor-pointer hover:text-[#2D5016] transition-colors flex items-start gap-3 group/title"
                  >
                    {task.description}
                    <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 opacity-0 group-hover/title:opacity-100 transition-opacity mt-1" />
                  </h1>
                )}
              </div>

              {/* Metadata Badges */}
              <div className="flex flex-wrap gap-2 sm:gap-4">
                {/* Assignee */}
                <div className="flex items-center gap-2 bg-white/80 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-gray-200">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                  <span className="font-medium text-xs sm:text-sm text-gray-900">
                    {task.assignee?.full_name || 'Unassigned'}
                  </span>
                </div>

                {/* Due Date */}
                <div className="flex items-center gap-2 bg-white/80 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-gray-200">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                  <span className="font-medium text-xs sm:text-sm text-gray-900">
                    {formatDeadline(task.deadline).text}
                  </span>
                </div>

                {/* Priority */}
                <Badge variant={task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'info'} className="px-3 py-1.5 text-sm">
                  {task.priority === 'High' ? '🔥 High Priority' :
                    task.priority === 'Medium' ? '⚡ Medium Priority' :
                      '📌 Low Priority'}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column (Controls & Timeline) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Controls Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#6FA84C]" />
                Task Controls
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                  <Select
                    value={task.status}
                    onChange={(value) => handleUpdate({ status: value as Task['status'] })}
                    options={[
                      { value: 'Not Started', label: 'Not Started', icon: '🌱' },
                      { value: 'In Progress', label: 'In Progress', icon: '🌿' },
                      { value: 'Done', label: 'Done', icon: '🌳' }
                    ]}
                  />
                </div>

                {/* Assignee */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Assignee</label>
                  <Select
                    value={task.assignee_id || ''}
                    onChange={(value) => handleUpdate({ assignee_id: value || null })}
                    options={[
                      { value: '', label: 'Unassigned' },
                      ...profiles.map(p => ({ value: p.id, label: p.full_name }))
                    ]}
                  />
                </div>

                {/* Deadline */}
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 transition-colors ${highlightDate ? 'text-orange-600' : 'text-gray-500'}`}>
                    Due Date
                  </label>
                  <motion.div
                    animate={highlightDate ? { x: [0, -5, 5, -5, 5, 0] } : {}}
                    transition={{ duration: 0.4 }}
                  >
                    <div ref={dateInputRef}>
                      <DatePicker
                        value={task.deadline || null}
                        onChange={(date) => handleUpdate({ deadline: date })}
                        className={highlightDate ? 'ring-2 ring-orange-100 rounded-xl' : ''}
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Priority</label>
                  <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
                    {['Low', 'Medium', 'High'].map((p) => (
                      <button
                        key={p}
                        onClick={() => handleUpdate({ priority: p as Task['priority'] })}
                        className={`
                          flex-1 py-2 rounded-lg text-sm font-medium transition-all
                          ${task.priority === p
                            ? 'bg-white text-gray-900 shadow-sm border border-gray-100'
                            : 'text-gray-500 hover:text-gray-700'}
                        `}
                      >
                        {p === 'High' ? '🔥' : p === 'Medium' ? '⚡' : '📌'} {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <Card>
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#6FA84C]" />
                Activity Timeline
              </h2>

              <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                {/* Created Event */}
                <div className="relative flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 border-2 border-white shadow-sm flex items-center justify-center z-10">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">
                      <span className="font-bold">{task.creator?.full_name || 'Someone'}</span> created this task
                    </p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(task.created_at)}</p>
                  </div>
                </div>

                {/* Last Updated Event (if different) */}
                {task.updated_at !== task.created_at && (
                  <div className="relative flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-50 border-2 border-white shadow-sm flex items-center justify-center z-10">
                      <Edit2 className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">
                        Task was updated
                      </p>
                      <p className="text-xs text-gray-500">{formatTimeAgo(task.updated_at)}</p>
                    </div>
                  </div>
                )}

                {/* Current Status Event */}
                <div className="relative flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-50 border-2 border-white shadow-sm flex items-center justify-center z-10">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">
                      Current status is <span className="font-bold">{task.status}</span>
                    </p>
                    <p className="text-xs text-gray-500">Just now</p>
                  </div>
                </div>
              </div>
            </Card>

          </div>

          {/* Right Column (Progress & Info) */}
          <div className="space-y-6">

            {/* Growth Progress */}
            <Card>
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <PlantIcon className="w-5 h-5 text-[#6FA84C]" />
                Growth Progress
              </h2>
              {getGrowthProgress(task.status)}
            </Card>

            {/* Task Info */}
            <Card className="text-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">ℹ️ Task Info</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-500 mb-1">Created</p>
                  <p className="font-medium text-gray-900">{formatDateShort(task.created_at)}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Created by</p>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">
                      {getInitials(task.creator?.full_name || 'Unknown')}
                    </div>
                    <p className="font-medium text-gray-900">{task.creator?.full_name || 'Unknown'}</p>
                  </div>
                </div>
                {task.note && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-gray-500 mb-2">From meeting note</p>
                    <button
                      onClick={() => navigate(`/note/${task.note_id}`)}
                      className="text-[#2D5016] font-medium hover:underline flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" />
                      View original note →
                    </button>
                  </div>
                )}
              </div>
            </Card>


            {/* Meeting Context Card */}
            {task.note && (
              <Card>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#6FA84C]" />
                  Meeting Context
                </h2>

                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 mb-4">
                  <h3 className="font-bold text-gray-900 mb-1">{task.note.meeting_title || 'Untitled Meeting'}</h3>
                  <p className="text-xs text-gray-500 mb-2">
                    📅 {formatDateShort(task.note.meeting_date || task.note.created_at)} •
                    👥 {task.note.meeting_participants?.length || 0} people
                  </p>
                  {task.note.meeting_summary && (
                    <p className="text-sm text-gray-700 line-clamp-2 italic">
                      "{cleanSummary(task.note.meeting_summary)}"
                    </p>
                  )}
                </div>

                {relatedTasks.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Related Tasks ({relatedTasks.length + 1})</p>

                    {/* Current Task */}
                    <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-100 rounded-lg">
                      <span className="text-lg">{getPlantEmoji(task.status)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{task.description}</p>
                        <p className="text-xs text-gray-500">{task.assignee?.full_name || 'Unassigned'}</p>
                      </div>
                      <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">YOU</span>
                    </div>

                    {/* Siblings */}
                    {relatedTasks.map(sibling => (
                      <button
                        key={sibling.id}
                        onClick={() => navigate(`/task/${sibling.id}`)}
                        className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors text-left group"
                      >
                        <span className="text-lg opacity-50 group-hover:opacity-100 transition-opacity">
                          {getPlantEmoji(sibling.status)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-600 group-hover:text-gray-900 truncate">{sibling.description}</p>
                          <p className="text-xs text-gray-400">{sibling.assignee?.full_name || 'Unassigned'}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => navigate(`/note/${task.note_id}`)}
                  className="w-full mt-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  View Full Meeting Note
                </button>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                ⚡ Quick Actions
              </h2>

              <div className="space-y-2">
                <Button
                  onClick={() => handleUpdate({ status: 'Done' })}
                  className="w-full justify-start gap-3 p-3 h-auto bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-800 border-0"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Mark as Complete
                </Button>

                {!task.google_event_id && (
                  <Button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="w-full justify-start gap-3 p-3 h-auto bg-blue-50 hover:bg-blue-100 text-blue-700 border-0"
                  >
                    {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CalendarPlus className="w-5 h-5" />}
                    Add to Calendar
                  </Button>
                )}

                <Button
                  variant="secondary"
                  onClick={handleDuplicate}
                  className="w-full justify-start gap-3 p-3 h-auto"
                >
                  <Copy className="w-5 h-5" />
                  Duplicate Task
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => showToast({ type: 'info', title: 'Coming Soon', message: 'Sharing will be available soon' })}
                  className="w-full justify-start gap-3 p-3 h-auto"
                >
                  <Share2 className="w-5 h-5" />
                  Share Task
                </Button>

                <div className="h-px bg-gray-100 my-2" />

                <Button
                  variant="danger"
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full justify-start gap-3 p-3 h-auto"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Task
                </Button>
              </div>
            </Card>

          </div>
        </div>
      </main>

      {/* Delete Modal */}
      <AnimatePresence>
        {
          showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6"
              onClick={() => setShowDeleteModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">Delete this task?</h2>
                <p className="text-gray-600 text-center mb-6">
                  {task.google_event_id
                    ? 'This will also remove the event from your Google Calendar. This action cannot be undone.'
                    : 'This action cannot be undone.'}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleDelete}
                    disabled={deleting}
                    isLoading={deleting}
                    className="flex-1 gap-2"
                  >
                    {!deleting && <Trash2 className="w-5 h-5" />}
                    Delete
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )
        }
      </AnimatePresence>
    </div>
  );
}
