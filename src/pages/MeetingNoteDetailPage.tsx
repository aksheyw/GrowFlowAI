import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion'; // Kept for Modal animation
import {
    ArrowLeft,
    AlertTriangle,
    Trash2, // Re-integrated this
    Loader2,
    Briefcase,
    Sparkles,
    Sprout
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Note, Task } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import MeetingHeader from '../components/meeting-note/MeetingHeader';
import MeetingStats from '../components/meeting-note/MeetingStats';
import MeetingContent from '../components/meeting-note/MeetingContent';
import MeetingActions from '../components/meeting-note/MeetingActions';
import MeetingTasks from '../components/meeting-note/MeetingTasks';
import {
    formatDateShort,
    calculateTaskStats,
} from '../utils/meetingHelpers';
import { SummaryModal } from '../components/LeadershipSummary';
import LeadershipSummaryDisplay from '../components/meeting-note/LeadershipSummaryDisplay';
import LeadershipGenerationProgress from '../components/meeting-note/LeadershipGenerationProgress';
import { Button } from '../components/ui/Button';

type TaskFilter = 'all' | 'not_started' | 'in_progress' | 'done';

export default function MeetingNoteDetailPage() {
    const { noteId } = useParams<{ noteId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { showToast } = useToast();
    const titleInputRef = useRef<HTMLInputElement>(null);

    // --- STATE ---
    const [note, setNote] = useState<Note | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Edit / UI State
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [taskFilter, setTaskFilter] = useState<TaskFilter>('all');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);

    // Logic State
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [isProcessingTasks, setIsProcessingTasks] = useState(false);

    // --- INIT ---
    useEffect(() => {
        if (location.state?.isSynthesizing) {
            setIsSynthesizing(true);
        }
    }, [location.state]);

    // --- DATA FETCHING ---
    useEffect(() => {
        if (!noteId) return;

        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                // 1. Fetch Note
                const { data: noteData, error: noteErr } = await supabase
                    .from('notes')
                    .select('*, leadership_brief')
                    .eq('id', noteId)
                    .single();

                if (noteErr) throw noteErr;
                if (!noteData) throw new Error('Note not found');

                setNote(noteData);
                setEditedTitle(noteData.meeting_title || 'Meeting Notes');

                // If brief exists, stop synthesizing
                if (noteData.leadership_brief) {
                    setIsSynthesizing(false);
                }

                // 2. Fetch Tasks
                const { data: tasksData, error: tasksErr } = await supabase
                    .from('tasks')
                    .select(`*, assignee:assignee_id(id, full_name, email, avatar_url)`)
                    .eq('note_id', noteId)
                    .order('created_at', { ascending: true });

                if (tasksErr) console.error('Task fetch error:', tasksErr);
                setTasks(tasksData || []);

            } catch (err: unknown) {
                console.error('Load Error:', err);
                setError(err instanceof Error ? err.message : "Failed to load note");
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();

        // Realtime - Robust (Listen to all, filter locally)
        const channel = supabase
            .channel(`note-${noteId}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notes' },
                (payload) => {
                    const newNote = payload.new as Note;
                    if (newNote.id === noteId) {
                        setNote(prev => prev ? { ...prev, ...newNote } : newNote);

                        if (newNote.leadership_brief) {
                            setIsSynthesizing(false);
                        }
                        if (newNote.processed) {
                            fetchTasksOnly();
                        }
                    }
                })
            .subscribe();

        return () => { channel.unsubscribe(); };
    }, [noteId, navigate]);

    // --- POLLING FALLBACK ---
    useEffect(() => {
        if (!isSynthesizing || !noteId) return;

        const interval = setInterval(async () => {
            const { data, error } = await supabase
                .from('notes')
                .select('leadership_brief')
                .eq('id', noteId)
                .single();

            if (!error && data?.leadership_brief) {
                setNote(prev => prev ? { ...prev, leadership_brief: data.leadership_brief } : null);
                setIsSynthesizing(false);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [isSynthesizing, noteId]);

    async function fetchTasksOnly() {
        if (!noteId) return;
        const { data } = await supabase
            .from('tasks')
            .select(`*, assignee:assignee_id(id, full_name, email, avatar_url)`)
            .eq('note_id', noteId)
            .order('created_at', { ascending: true });
        if (data) setTasks(data as Task[]);
    }

    // --- ACTIONS ---
    const handleAnimationComplete = useCallback(() => {
        setTimeout(() => setIsSynthesizing(false), 500);
    }, []);

    async function handleTitleSave() {
        if (!note || editedTitle === note.meeting_title) { setIsEditingTitle(false); return; }
        try {
            await supabase.from('notes').update({ meeting_title: editedTitle }).eq('id', note.id);
            setNote(prev => prev ? { ...prev, meeting_title: editedTitle } : null);
            showToast({ type: 'success', title: 'Saved', message: 'Title updated' });
        } catch {
            showToast({ type: 'error', title: 'Error', message: 'Failed to save title' });
        } finally {
            setIsEditingTitle(false);
        }
    }

    async function handleCopyNotes() {
        if (!note) return;
        await navigator.clipboard.writeText(note.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        showToast({ type: 'success', title: 'Copied', message: 'Notes copied' });
    }

    async function handleProcessTasks() {
        if (!note || !user) return;
        setIsProcessingTasks(true);
        try {
            const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-ai-notes`;
            const response = await fetch(edgeFunctionUrl, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    note_text: note.content,
                    note_id: note.id,
                    default_priority: 'Medium'
                })
            });
            if (!response.ok) throw new Error('Failed');

            const result = await response.json();
            await fetchTasksOnly();
            showToast({ type: 'success', title: 'Success', message: `Created ${result.created || 0} tasks` });
        } catch {
            showToast({ type: 'error', title: 'Error', message: 'Failed to process tasks' });
        } finally {
            setIsProcessingTasks(false);
        }
    }

    function handleExport() {
        if (!note) return;
        const blob = new Blob([note.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Utilized formatDateShort here to fix unused variable warning
        a.download = `notes-${formatDateShort(note.created_at)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function handleShare() { showToast({ type: 'info', title: 'Info', message: 'Coming soon' }); }

    async function handleDelete() {
        if (!note) return;
        setIsDeleting(true);
        try {
            await supabase.from('tasks').delete().eq('note_id', note.id);
            await supabase.from('notes').delete().eq('id', note.id);
            showToast({ type: 'success', title: 'Deleted', message: 'Meeting removed' });
            navigate('/dashboard');
        } catch {
            setIsDeleting(false);
            showToast({ type: 'error', title: 'Error', message: 'Failed to delete' });
        }
    }

    function handleSummaryGenerated(summaryData: NonNullable<Note['leadership_brief']>) {
        if (note) {
            setNote(prev => prev ? { ...prev, leadership_brief: summaryData } : null);
            setIsSynthesizing(false);
        }
    }

    async function handleRegenerate() {
        if (!note) return;

        // 1. Optimistic Clear: Force the UI to "forget" the old summary immediately
        setNote(prev => prev ? { ...prev, leadership_brief: null } : null);

        // 2. Start Loading State
        setIsSynthesizing(true);

        // 3. Trigger Webhook (Fire & Forget)
        try {
            // Add a toast to confirm action
            showToast({ type: 'info', title: 'Regenerating...', message: 'AI is rewriting the brief.' });

            await fetch('https://n8n.srv1134430.hstgr.cloud/webhook/generate-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ note_id: note.id })
            });
        } catch (err) {
            console.error(err);
            // If fail, revert state (optional, or just show error)
            setIsSynthesizing(false);
            showToast({ type: 'error', title: 'Error', message: 'Failed to trigger regeneration.' });
        }
    }

    // Computed Props
    const stats = useMemo(() => calculateTaskStats(tasks), [tasks]);
    const filteredTasks = useMemo(() => {
        if (taskFilter === 'all') return tasks;
        const statusMap: Record<string, string> = {
            'not_started': 'Not Started',
            'in_progress': 'In Progress',
            'done': 'Done'
        };
        return tasks.filter(task => task.status === statusMap[taskFilter]);
    }, [tasks, taskFilter]);

    // --- RENDER ---
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-ios-bg-dark flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-ios-bg-dark flex items-center justify-center p-4">
                <div className="text-center">
                    {/* Utilized AlertTriangle here to fix unused variable warning */}
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Something went wrong</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
                </div>
            </div>
        );
    }

    if (!note) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-ios-bg-dark dark:to-ios-bg-dark">
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/dashboard?view=notes')}
                        className="
              pl-2 pr-4 py-2 h-auto text-sm font-medium
              text-gray-600 dark:text-gray-300
              hover:text-gray-900 dark:hover:text-white
              hover:bg-white/50 dark:hover:bg-white/10
              backdrop-blur-md
              border border-transparent hover:border-gray-200 dark:hover:border-white/10
              rounded-full
              transition-all duration-200
              active:scale-95
              group
            "
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                        Back to Meeting Notes
                    </Button>
                </div>

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

                {/* 2-COLUMN LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">

                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* 1. Original Notes */}
                        <MeetingContent note={note} copied={copied} onCopyNotes={handleCopyNotes} />

                        {/* 2. Leadership Section (Strict Nested Ternary) */}
                        {isSynthesizing ? (
                            <LeadershipGenerationProgress
                                onComplete={handleAnimationComplete}
                                hasData={!!note.leadership_brief}
                            />
                        ) : note.leadership_brief ? (
                            <LeadershipSummaryDisplay summary={note.leadership_brief} />
                        ) : (
                            /* Empty State */
                            <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-ios-separator-dark text-center">
                                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-6">
                                    <Briefcase className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">No summary available</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                                    Generate a concise executive summary, decisions, and action items from this meeting.
                                </p>
                                <Button
                                    onClick={handleRegenerate}
                                    className="px-8 py-3 bg-gradient-to-br from-[#355E1F] to-[#6FA84C] text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all"
                                >
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Generate Summary
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-6">
                        <div className="sticky top-6 space-y-6">
                            <MeetingActions
                                onExport={handleExport}
                                onShare={handleShare}
                                onDelete={() => setShowDeleteModal(true)}
                                onGenerateSummary={handleRegenerate}
                                hasSummary={!!note.leadership_brief}
                            />

                            {/* Plant Your Seeds (Only if no tasks & has summary) */}
                            {tasks.length === 0 && note.leadership_brief && (
                                <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-6 shadow-sm border border-green-100 dark:border-green-800 text-center relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
                                    <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                                        <Sprout className="w-6 h-6 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Plant Your Seeds</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                        You have a summary, but no trackable tasks yet.
                                    </p>
                                    <Button
                                        onClick={handleProcessTasks}
                                        disabled={isProcessingTasks}
                                        className="w-full justify-center bg-gradient-to-br from-[#355E1F] to-[#6FA84C] text-white shadow-md"
                                    >
                                        {isProcessingTasks ? <Loader2 className="animate-spin w-4 h-4" /> : "Process Tasks from Note"}
                                    </Button>
                                </div>
                            )}

                            {/* Tasks List */}
                            {tasks.length > 0 && (
                                <MeetingTasks
                                    tasks={filteredTasks}
                                    filter={taskFilter}
                                    onFilterChange={setTaskFilter}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals */}
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
                            className="bg-white dark:bg-ios-card-dark rounded-2xl p-6 w-full max-w-md shadow-xl relative z-10"
                        >
                            <div className="flex items-center gap-4 mb-4 text-red-600">
                                <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                                    {/* Utilized Trash2 icon here for the delete modal header */}
                                    <Trash2 className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Meeting?</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Are you sure you want to delete this meeting note? This will also delete all <strong>{tasks.length} associated tasks</strong>. This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                                {/* Utilized isDeleting here for disabled state */}
                                <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>Delete</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {note && (
                <SummaryModal
                    isOpen={showSummaryModal}
                    onClose={() => setShowSummaryModal(false)}
                    note={note}
                    userId={user?.id}
                    onSummaryGenerated={handleSummaryGenerated}
                />
            )}
        </div>
    );
}