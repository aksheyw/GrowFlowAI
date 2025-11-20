import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    ChevronRight,
    AlertTriangle,
    LogOut,
    Loader2,
    Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Note, Task } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import NotificationBell from '../components/NotificationBell';
import MeetingHeader from '../components/meeting-note/MeetingHeader';
import MeetingStats from '../components/meeting-note/MeetingStats';
import MeetingContent from '../components/meeting-note/MeetingContent';
import MeetingActions from '../components/meeting-note/MeetingActions';
import MeetingTasks from '../components/meeting-note/MeetingTasks';
import {
    formatDateShort,
    calculateTaskStats,
} from '../utils/meetingHelpers';
import { getInitials } from '../utils/premiumHelpers';

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
        console.log('Starting reprocess...', { noteId: note?.id, userId: user?.id });
        if (!note || !user) {
            console.error('Missing note or user', { note, user });
            return;
        }

        setIsReprocessing(true);

        try {
            const response = await fetch('https://n8n.srv1134430.hstgr.cloud/webhook/reprocess-note', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: note.content,
                    note_id: note.id,
                    user_id: user.id
                })
            });

            if (!response.ok) throw new Error('Failed to trigger reprocessing');

            const data = await response.json();

            if (data.success) {
                showToast({
                    type: 'success',
                    title: 'Reprocessing started',
                    message: 'AI is analyzing your notes. The summary will update shortly.',
                    duration: 4000
                });

                // Reload notes to check for updates after a delay
                setTimeout(() => {
                    window.location.reload();
                }, 5000);
            } else {
                throw new Error('Workflow returned failure');
            }

        } catch (error) {
            console.error('Error reprocessing:', error);
            showToast({
                type: 'error',
                title: 'Failed to reprocess',
                message: 'Please try again later'
            });
        } finally {
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

                <MeetingHeader
                    note={note}
                    taskCount={tasks.length}
                    isEditingTitle={isEditingTitle}
                    editedTitle={editedTitle}
                    setEditedTitle={setEditedTitle}
                    setIsEditingTitle={setIsEditingTitle}
                    onTitleSave={handleTitleSave}
                    titleInputRef={titleInputRef}
                />

                <MeetingStats stats={stats} />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    <MeetingContent
                        note={note}
                        copied={copied}
                        onCopyNotes={handleCopyNotes}
                    />

                    {/* Right Column (1/3 width) - Tasks & Actions */}
                    <div className="space-y-8">
                        {/* Quick Actions */}
                        <MeetingActions
                            onExport={handleExport}
                            onShare={handleShare}
                            onReprocess={handleReprocess}
                            onDelete={() => setShowDeleteModal(true)}
                            isReprocessing={isReprocessing}
                        />

                        {/* Tasks List */}
                        <MeetingTasks
                            tasks={filteredTasks}
                            filter={taskFilter}
                            onFilterChange={setTaskFilter}
                        />
                    </div>
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                            onClick={() => setShowDeleteModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative z-10"
                        >
                            <div className="flex items-center gap-4 mb-4 text-red-600">
                                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Delete Meeting?</h3>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this meeting note? This will also delete all <strong>{tasks.length} associated tasks</strong>. This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            Delete Everything
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
