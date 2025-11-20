import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    ChevronRight,
    FileText,
    Calendar,
    Users,
    CheckSquare,
    Clock,
    Edit2,
    AlignLeft,
    Copy,
    Check,
    Sparkles,
    MessageSquare,
    Download,
    Share2,
    RefreshCw,
    Trash2,
    Loader2,
    AlertTriangle,
    Sprout,
    LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Note, Task } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import NotificationBell from '../components/NotificationBell';
import {
    formatDateLong,
    formatDateShort,
    formatTimeAgo,
    calculateTaskStats,
    isTaskOverdue,
    isTaskDueSoon
} from '../utils/meetingHelpers';
import { getPlantEmoji, formatDeadline, getInitials } from '../utils/premiumHelpers';

type TaskFilter = 'all' | 'not_started' | 'in_progress' | 'done';

export default function MeetingNoteDetailPage() {
    const { noteId } = useParams<{ noteId: string }>();
    const navigate = useNavigate();
    const { user, profile, signOut } = useAuth();
    const { showToast } = useToast();
    const titleInputRef = useRef<HTMLInputElement>(null);

    // State
    const [note, setNote] = useState<Note | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [taskFilter, setTaskFilter] = useState<TaskFilter>('all');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isReprocessing, setIsReprocessing] = useState(false);
    const [copied, setCopied] = useState(false);

    // Fetch meeting data
    useEffect(() => {
        async function fetchMeetingData() {
            if (!noteId) return;

            setIsLoading(true);

            try {
                // Fetch note
                const { data: noteData, error: noteError } = await supabase
                    .from('notes')
                    .select('*')
                    .eq('id', noteId)
                    .single();

                if (noteError) throw noteError;

                if (!noteData) {
                    throw new Error('Note not found');
                }

                setNote(noteData);
                setEditedTitle(noteData.meeting_title || 'Meeting Notes');

                // Fetch related tasks
                const { data: tasksData, error: tasksError } = await supabase
                    .from('tasks')
                    .select(`
            *,
            assignee:assignee_id(id, full_name, email, avatar_url)
          `)
                    .eq('note_id', noteId)
                    .order('created_at', { ascending: true });

                if (tasksError) throw tasksError;

                setTasks(tasksData || []);

            } catch (error) {
                console.error('Error fetching meeting data:', error);
                showToast({
                    type: 'error',
                    title: 'Failed to load meeting',
                    message: 'Please try again'
                });
                navigate('/dashboard');
            } finally {
                setIsLoading(false);
            }
        }

        fetchMeetingData();
    }, [noteId, navigate, showToast]);

    // Focus title input when editing
    useEffect(() => {
        if (isEditingTitle && titleInputRef.current) {
            titleInputRef.current.focus();
            titleInputRef.current.select();
        }
    }, [isEditingTitle]);

    // Calculated values
    const stats = useMemo(() => calculateTaskStats(tasks), [tasks]);

    const filteredTasks = useMemo(() => {
        if (taskFilter === 'all') return tasks;
        // Map filter values to task status values
        const statusMap: Record<string, string> = {
            'not_started': 'Not Started',
            'in_progress': 'In Progress',
            'done': 'Done'
        };
        return tasks.filter(task => task.status === statusMap[taskFilter]);
    }, [tasks, taskFilter]);

    // Handlers
    async function handleTitleSave() {
        if (!note || editedTitle === note.meeting_title) {
            setIsEditingTitle(false);
            return;
        }

        try {
            const { error } = await supabase
                .from('notes')
                .update({
                    meeting_title: editedTitle,
                    updated_at: new Date().toISOString()
                })
                .eq('id', note.id);

            if (error) throw error;

            setNote(prev => prev ? { ...prev, meeting_title: editedTitle } : null);
            showToast({
                type: 'success',
                title: 'Title updated',
                message: 'Meeting title has been saved',
                duration: 2000
            });

        } catch (error) {
            console.error('Error updating title:', error);
            showToast({
                type: 'error',
                title: 'Failed to update title',
                message: 'Please try again'
            });
            setEditedTitle(note.meeting_title || 'Meeting Notes');
        } finally {
            setIsEditingTitle(false);
        }
    }

    async function handleCopyNotes() {
        if (!note) return;

        try {
            await navigator.clipboard.writeText(note.content);
            setCopied(true);

            showToast({
                type: 'success',
                title: 'Copied to clipboard',
                message: 'Meeting notes copied successfully',
                duration: 3000
            });

            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
            showToast({
                type: 'error',
                title: 'Failed to copy',
                message: 'Please try again'
            });
        }
    }

    function handleExport() {
        if (!note) return;

        const content = `${note.meeting_title || 'Meeting Notes'}
Date: ${formatDateShort(note.meeting_date)}
Participants: ${note.meeting_participants?.join(', ') || 'None listed'}

${note.meeting_summary ? `Summary:\n${note.meeting_summary}\n\n` : ''}Original Notes:
${note.content}

Extracted Tasks (${tasks.length}):
${tasks.map((task, i) => `${i + 1}. ${task.description} - ${task.assignee?.full_name || 'Unassigned'} (${task.status})`).join('\n')}
`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${note.meeting_title || 'meeting-notes'}-${formatDateShort(note.created_at)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast({
            type: 'success',
            title: 'Notes exported',
            message: 'Meeting notes downloaded successfully',
            duration: 3000
        });
    }

    function handleShare() {
        showToast({
            type: 'info',
            title: 'Coming soon',
            message: 'Share functionality will be available in a future update',
            duration: 3000
        });
    }

    async function handleReprocess() {
        if (!note || !user) return;

        setIsReprocessing(true);

        try {
            // This would call your n8n webhook for reprocessing
            // For now, just show a message
            showToast({
                type: 'info',
                title: 'Reprocessing',
                message: 'This feature will trigger AI reprocessing in production',
                duration: 4000
            });

            setTimeout(() => {
                setIsReprocessing(false);
            }, 2000);

        } catch (error) {
            console.error('Error reprocessing:', error);
            showToast({
                type: 'error',
                title: 'Failed to reprocess',
                message: 'Please try again'
            });
            setIsReprocessing(false);
        }
    }

    async function handleDelete() {
        if (!note) return;

        setIsDeleting(true);

        try {
            // Delete all tasks first
            const { error: tasksError } = await supabase
                .from('tasks')
                .delete()
                .eq('note_id', note.id);

            if (tasksError) throw tasksError;

            // Delete the note
            const { error: noteError } = await supabase
                .from('notes')
                .delete()
                .eq('id', note.id);

            if (noteError) throw noteError;

            showToast({
                type: 'success',
                title: 'Meeting deleted',
                message: 'All tasks have been removed',
                duration: 3000
            });

            navigate('/dashboard');

        } catch (error) {
            console.error('Error deleting meeting:', error);
            showToast({
                type: 'error',
                title: 'Failed to delete meeting',
                message: 'Please try again'
            });
        } finally {
            setIsDeleting(false);
        }
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-3xl p-12 border border-gray-100 animate-pulse">
                        <div className="w-20 h-20 bg-gray-200 rounded-3xl mx-auto mb-6" />
                        <div className="space-y-4 max-w-2xl mx-auto">
                            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto" />
                            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!note) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">📋</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Note not found</h2>
                    <p className="text-gray-600 mb-6">This meeting note doesn't exist or you don't have access to it.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-3 bg-[#2D5016] text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
            {/* Premium Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <motion.div
                            className="flex items-center gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <motion.div
                                className="text-3xl"
                                whileHover={{ scale: 1.15, rotate: 5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                🌱
                            </motion.div>
                            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#2D5016] to-[#6FA84C] bg-clip-text text-transparent">
                                GrowFlow
                            </h1>
                        </motion.div>

                        <div className="flex items-center gap-3">
                            <NotificationBell />
                            <motion.button
                                onClick={signOut}
                                className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                title="Sign out"
                            >
                                <LogOut className="w-5 h-5" />
                            </motion.button>
                            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-200">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6FA84C] to-[#A4D96C] flex items-center justify-center text-white font-semibold">
                                    {getInitials(profile?.full_name)}
                                </div>
                                <div className="text-sm">
                                    <p className="font-medium text-gray-900">{profile?.full_name}</p>
                                    <p className="text-gray-500 text-xs">{profile?.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb Navigation */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6 flex items-center gap-2 text-sm"
                >
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="
              flex items-center gap-1.5
              text-gray-600 hover:text-gray-900
              transition-colors duration-200
              group
            "
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span className="font-medium">Dashboard</span>
                    </button>

                    <ChevronRight className="w-4 h-4 text-gray-400" />

                    <span className="text-gray-900 font-medium">Meeting Notes</span>
                </motion.div>

                {/* Meeting Header Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="
            bg-white rounded-3xl p-8 sm:p-12
            border border-gray-100
            shadow-xl
            relative overflow-hidden
          "
                >
                    {/* Background gradient */}
                    <div className="
            absolute inset-0
            bg-gradient-to-br from-blue-50/50 to-indigo-50/50
            pointer-events-none
          " />

                    {/* Content */}
                    <div className="relative">
                        {/* Meeting icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className="
                w-20 h-20 mx-auto mb-6
                bg-gradient-to-br from-blue-500 to-indigo-600
                rounded-3xl
                flex items-center justify-center
                shadow-lg shadow-blue-500/30
              "
                        >
                            <FileText className="w-10 h-10 text-white" />
                        </motion.div>

                        {/* Title - Editable */}
                        {isEditingTitle ? (
                            <input
                                ref={titleInputRef}
                                type="text"
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                onBlur={handleTitleSave}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleTitleSave();
                                    if (e.key === 'Escape') {
                                        setIsEditingTitle(false);
                                        setEditedTitle(note.meeting_title || 'Meeting Notes');
                                    }
                                }}
                                className="
                  w-full
                  text-3xl sm:text-4xl font-bold
                  text-gray-900 text-center
                  border-2 border-blue-500
                  rounded-xl px-4 py-2
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20
                  transition-all duration-200
                "
                                autoFocus
                            />
                        ) : (
                            <h1
                                onClick={() => setIsEditingTitle(true)}
                                className="
                  text-3xl sm:text-4xl font-bold text-gray-900
                  text-center mb-4
                  cursor-pointer
                  hover:text-blue-600
                  transition-colors duration-200
                  group
                "
                            >
                                {note.meeting_title || 'Meeting Notes'}
                                <Edit2 className="
                  inline-block w-6 h-6 ml-3 
                  text-gray-400 opacity-0 
                  group-hover:opacity-100
                  transition-opacity duration-200
                " />
                            </h1>
                        )}

                        {/* Metadata row */}
                        <div className="
              flex flex-wrap items-center justify-center gap-6
              text-base text-gray-600 mb-6
            ">
                            {/* Date */}
                            {note.meeting_date && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    <span className="font-medium">
                                        {formatDateLong(note.meeting_date)}
                                    </span>
                                </div>
                            )}

                            {/* Participants */}
                            {note.meeting_participants && note.meeting_participants.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-600" />
                                    <span className="font-medium">
                                        {note.meeting_participants.length} {note.meeting_participants.length === 1 ? 'person' : 'people'}
                                    </span>
                                </div>
                            )}

                            {/* Task count */}
                            <div className="flex items-center gap-2">
                                <CheckSquare className="w-5 h-5 text-blue-600" />
                                <span className="font-medium">
                                    {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                                </span>
                            </div>

                            {/* Created timestamp */}
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-500">
                                    Created {formatTimeAgo(note.created_at)}
                                </span>
                            </div>
                        </div>

                        {/* Participants list */}
                        {note.meeting_participants && note.meeting_participants.length > 0 && (
                            <div className="
                flex flex-wrap items-center justify-center gap-3
              ">
                                {note.meeting_participants.map((participant, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.1 + (index * 0.05) }}
                                        className="
                      flex items-center gap-2 px-4 py-2
                      bg-white/80 backdrop-blur-sm
                      border border-blue-200
                      rounded-full
                    "
                                    >
                                        <div className="
                      w-8 h-8 rounded-full
                      bg-gradient-to-br from-blue-400 to-indigo-500
                      flex items-center justify-center
                      text-white font-semibold text-sm
                    ">
                                            {participant.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">
                                            {participant}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Stats Section */}
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
                        <div className="text-3xl mt-2">🌺</div>
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

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    {/* Left Column (2/3 width) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Original Notes Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="
                bg-white rounded-2xl p-6 sm:p-8
                border border-gray-100
                shadow-sm
              "
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <AlignLeft className="w-5 h-5 text-[#6FA84C]" />
                                    Original Notes
                                </h2>

                                {/* Copy button */}
                                <button
                                    onClick={handleCopyNotes}
                                    className="
                    flex items-center gap-2 px-4 py-2
                    bg-gray-100 hover:bg-gray-200
                    rounded-xl
                    text-sm font-medium text-gray-700
                    transition-all duration-200
                  "
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4 text-green-600" />
                                            <span className="text-green-600">Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            <span>Copy</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Notes content */}
                            <div className="
                p-6 bg-gray-50 rounded-xl
                border border-gray-200
              ">
                                <pre className="
                  font-mono text-sm text-gray-800
                  whitespace-pre-wrap leading-relaxed
                  overflow-x-auto
                ">
                                    {note.content}
                                </pre>
                            </div>

                            {/* Character count */}
                            <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    {note.content.length.toLocaleString()} characters
                                </span>
                                <span className="flex items-center gap-1">
                                    <AlignLeft className="w-3 h-3" />
                                    {note.content.split(/\s+/).length.toLocaleString()} words
                                </span>
                            </div>
                        </motion.div>

                        {/* Extracted Summary Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            className="
                bg-white rounded-2xl p-6 sm:p-8
                border border-gray-100
                shadow-sm
              "
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-[#6FA84C]" />
                                AI Summary
                            </h2>

                            {note.meeting_summary ? (
                                <div className="
                  p-6 bg-gradient-to-br from-blue-50 to-indigo-50
                  rounded-xl border border-blue-100
                ">
                                    <p className="text-gray-800 leading-relaxed">
                                        {note.meeting_summary}
                                    </p>
                                </div>
                            ) : (
                                <div className="
                  p-6 bg-gray-50 rounded-xl
                  border border-gray-200
                  text-center
                ">
                                    <div className="
                    w-12 h-12 mx-auto mb-3
                    bg-gray-200 rounded-xl
                    flex items-center justify-center
                  ">
                                        <MessageSquare className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-500 italic">
                                        No summary available
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Right Column (1/3 width) */}
                    <div className="space-y-6">
                        {/* Meeting Metadata Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.4 }}
                            className="
                bg-white rounded-2xl p-6
                border border-gray-100
                shadow-sm
              "
                        >
                            <h3 className="text-lg font-bold text-gray-900 mb-6">
                                Meeting Info
                            </h3>

                            <div className="space-y-4">
                                {/* Created */}
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Created</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {formatDateShort(note.created_at)}
                                    </p>
                                </div>

                                {/* Created by */}
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Added by</p>
                                    <div className="flex items-center gap-2">
                                        <div className="
                      w-6 h-6 rounded-full
                      bg-gradient-to-br from-[#6FA84C] to-[#2D5016]
                      flex items-center justify-center
                      text-white font-medium text-xs
                    ">
                                            {user?.email?.charAt(0).toUpperCase() || 'Y'}
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">
                                            You
                                        </p>
                                    </div>
                                </div>

                                {/* Last updated */}
                                {note.updated_at && note.updated_at !== note.created_at && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Last updated</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {formatTimeAgo(note.updated_at)}
                                        </p>
                                    </div>
                                )}

                                {/* Meeting date */}
                                {note.meeting_date && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Meeting date</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {formatDateShort(note.meeting_date)}
                                        </p>
                                    </div>
                                )}

                                {/* Participants */}
                                {note.meeting_participants && note.meeting_participants.length > 0 && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-2">Participants</p>
                                        <div className="flex flex-wrap gap-2">
                                            {note.meeting_participants.map((participant, index) => (
                                                <span
                                                    key={index}
                                                    className="
                            px-3 py-1.5 rounded-lg
                            bg-blue-50 text-blue-700
                            text-xs font-medium
                          "
                                                >
                                                    {participant}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Quick Actions Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.5 }}
                            className="
                bg-white rounded-2xl p-6
                border border-gray-100
                shadow-sm
              "
                        >
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                Quick Actions
                            </h3>

                            <div className="space-y-3">
                                {/* Export notes */}
                                <button
                                    onClick={handleExport}
                                    className="
                    w-full px-4 py-3 rounded-xl
                    bg-gray-100 hover:bg-gray-200
                    text-gray-700 font-medium text-sm
                    transition-all duration-200
                    flex items-center justify-center gap-2
                  "
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Export as Text</span>
                                </button>

                                {/* Share (future feature) */}
                                <button
                                    onClick={handleShare}
                                    className="
                    w-full px-4 py-3 rounded-xl
                    bg-gray-100 hover:bg-gray-200
                    text-gray-700 font-medium text-sm
                    transition-all duration-200
                    flex items-center justify-center gap-2
                  "
                                >
                                    <Share2 className="w-4 h-4" />
                                    <span>Share Meeting</span>
                                </button>

                                {/* Reprocess with AI */}
                                <button
                                    onClick={handleReprocess}
                                    disabled={isReprocessing}
                                    className="
                    w-full px-4 py-3 rounded-xl
                    bg-blue-50 hover:bg-blue-100
                    text-blue-700 font-medium text-sm
                    transition-all duration-200
                    flex items-center justify-center gap-2
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                                >
                                    {isReprocessing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Reprocessing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="w-4 h-4" />
                                            <span>Reprocess with AI</span>
                                        </>
                                    )}
                                </button>

                                <div className="border-t border-gray-200 my-3" />

                                {/* Delete meeting */}
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="
                    w-full px-4 py-3 rounded-xl
                    bg-red-50 hover:bg-red-100
                    text-red-600 font-medium text-sm
                    transition-all duration-200
                    flex items-center justify-center gap-2
                  "
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete Meeting</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* All Tasks Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    className="mt-12"
                >
                    <div className="
            bg-white rounded-2xl p-6 sm:p-8
            border border-gray-100
            shadow-sm
          ">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Sprout className="w-5 h-5 text-[#6FA84C]" />
                                Extracted Tasks ({tasks.length})
                            </span>

                            {/* Filter buttons */}
                            <div className="flex items-center gap-2">
                                {['all', 'not_started', 'in_progress', 'done'].map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setTaskFilter(filter as TaskFilter)}
                                        className={`
                      px-3 py-1.5 rounded-lg text-xs font-medium
                      transition-all duration-200
                      ${taskFilter === filter
                                                ? 'bg-[#2D5016] text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }
                    `}
                                    >
                                        {filter === 'all' ? 'All' :
                                            filter === 'not_started' ? 'Not Started' :
                                                filter === 'in_progress' ? 'In Progress' :
                                                    'Completed'}
                                    </button>
                                ))}
                            </div>
                        </h2>

                        {/* Task grid */}
                        {filteredTasks.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🌱</div>
                                <p className="text-gray-500">
                                    {taskFilter === 'all'
                                        ? 'No tasks extracted from this meeting'
                                        : `No ${taskFilter.replace('_', ' ')} tasks`
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredTasks.map((task, index) => (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.1 + (index * 0.03) }}
                                        layout
                                    >
                                        <button
                                            onClick={() => navigate(`/task/${task.id}`)}
                                            className="
                        w-full p-5 rounded-2xl
                        bg-gray-50 hover:bg-white
                        border-2 border-gray-200 hover:border-[#6FA84C]
                        transition-all duration-200
                        text-left
                        group
                      "
                                        >
                                            <div className="flex items-start gap-4">
                                                {/* Plant emoji */}
                                                <motion.div
                                                    whileHover={{ scale: 1.15, rotate: 5 }}
                                                    transition={{ type: "spring", stiffness: 300 }}
                                                    className="text-5xl flex-shrink-0"
                                                >
                                                    {getPlantEmoji(task.status)}
                                                </motion.div>

                                                {/* Task info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="
                            font-semibold text-gray-900 mb-2
                            line-clamp-2 leading-snug
                            group-hover:text-[#2D5016]
                            transition-colors duration-200
                          ">
                                                        {task.description}
                                                    </p>

                                                    <div className="space-y-2">
                                                        {/* Assignee */}
                                                        <div className="flex items-center gap-2">
                                                            <div className="
                                w-6 h-6 rounded-full
                                bg-gradient-to-br from-[#6FA84C] to-[#2D5016]
                                flex items-center justify-center
                                text-white text-xs font-medium
                              ">
                                                                {task.assignee?.full_name?.charAt(0).toUpperCase() || '?'}
                                                            </div>
                                                            <span className="text-xs text-gray-700 font-medium">
                                                                {task.assignee?.full_name || 'Unassigned'}
                                                            </span>
                                                        </div>

                                                        {/* Metadata row */}
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            {/* Deadline */}
                                                            <span className={`
                                px-2 py-1 rounded-md text-xs font-semibold
                                ${isTaskOverdue(task)
                                                                    ? 'bg-red-100 text-red-700'
                                                                    : isTaskDueSoon(task)
                                                                        ? 'bg-yellow-100 text-yellow-700'
                                                                        : 'bg-gray-100 text-gray-700'
                                                                }
                              `}>
                                                                {formatDeadline(task.deadline).text}
                                                            </span>

                                                            {/* Priority */}
                                                            <span className={`
                                px-2 py-1 rounded-md text-xs font-semibold
                                ${task.priority === 'High'
                                                                    ? 'bg-red-100 text-red-700'
                                                                    : task.priority === 'Medium'
                                                                        ? 'bg-yellow-100 text-yellow-700'
                                                                        : 'bg-green-100 text-green-700'
                                                                }
                              `}>
                                                                {task.priority === 'High' ? '🔥' :
                                                                    task.priority === 'Medium' ? '⚡' : '📌'}
                                                            </span>

                                                            {/* Status */}
                                                            {task.status === 'Done' && (
                                                                <span className="
                                  px-2 py-1 rounded-md text-xs font-semibold
                                  bg-green-100 text-green-700
                                ">
                                                                    ✓ Done
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Arrow icon */}
                                                <ChevronRight className="
                          w-5 h-5 text-gray-400
                          group-hover:text-[#6FA84C]
                          group-hover:translate-x-1
                          transition-all duration-200
                          flex-shrink-0 mt-2
                        " />
                                            </div>
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Delete Confirmation Modal */}
                <AnimatePresence>
                    {showDeleteModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="
                fixed inset-0 z-50
                bg-black/50 backdrop-blur-sm
                flex items-center justify-center
                p-6
              "
                            onClick={() => setShowDeleteModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                onClick={(e) => e.stopPropagation()}
                                className="
                  bg-white rounded-3xl p-8
                  max-w-md w-full
                  shadow-2xl
                "
                            >
                                {/* Warning icon */}
                                <div className="
                  w-16 h-16 mx-auto mb-6
                  bg-red-100 rounded-2xl
                  flex items-center justify-center
                ">
                                    <AlertTriangle className="w-8 h-8 text-red-600" />
                                </div>

                                {/* Title */}
                                <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
                                    Delete this meeting?
                                </h2>

                                {/* Description */}
                                <div className="text-gray-600 text-center mb-6 space-y-2">
                                    <p>
                                        This will permanently delete:
                                    </p>
                                    <ul className="text-sm space-y-1">
                                        <li>• The original meeting notes</li>
                                        <li>• All {tasks.length} extracted {tasks.length === 1 ? 'task' : 'tasks'}</li>
                                        <li>• Task history and activity</li>
                                    </ul>
                                    <p className="font-semibold text-red-600 mt-4">
                                        This action cannot be undone.
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="
                      flex-1 px-6 py-3 rounded-xl
                      bg-gray-100 hover:bg-gray-200
                      text-gray-700 font-semibold
                      transition-all duration-200
                    "
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="
                      flex-1 px-6 py-3 rounded-xl
                      bg-gradient-to-r from-red-500 to-red-600
                      text-white font-semibold
                      hover:shadow-lg
                      transition-all duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center justify-center gap-2
                    "
                                    >
                                        {isDeleting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Deleting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="w-5 h-5" />
                                                <span>Delete</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
