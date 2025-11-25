import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    ChevronRight,
    AlertTriangle,
    Trash2,
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

    // --- STATE MANAGEMENT ---
    const [note, setNote] = useState<Note | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [taskFilter, setTaskFilter] = useState<TaskFilter>('all');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);

    // Logic State: Synthesis
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [isProcessingTasks, setIsProcessingTasks] = useState(false);

    // --- EFFECTS ---

    // 1. Initialize Synthesizing State (from Add Note Page redirect)
    useEffect(() => {
        if (location.state?.isSynthesizing) {
            setIsSynthesizing(true);
        }
    }, [location.state]);

    // 2. Fetch Data & Subscribe to Realtime
    useEffect(() => {
        if (!noteId) return;

        async function fetchMeetingData() {
            setIsLoading(true);
            try {
                // Fetch Note
                const { data: noteData, error: noteError } = await supabase
                    .from('notes')
                    .select('*, leadership_brief')
                    .eq('id', noteId)
                    .single();

                if (noteError) throw noteError;
                if (!noteData) throw new Error('Note not found');

                setNote(noteData);
                setEditedTitle(noteData.meeting_title || 'Meeting Notes');

                // Logic: If Brief exists, we are NOT synthesizing
                if (noteData.leadership_brief) {
                    setIsSynthesizing(false);
                }

                // Fetch Tasks
                const { data: tasksData, error: tasksError } = await supabase
                    .from('tasks')
                    .select(`*, assignee:assignee_id(id, full_name, email, avatar_url)`)
                    .eq('note_id', noteId)
                    .order('created_at', { ascending: true });

                if (tasksError) throw tasksError;
                setTasks(tasksData || []);

            } catch (error) {
                console.error('Error fetching data:', error);
                showToast({ type: 'error', title: 'Error', message: 'Failed to load meeting data' });
                navigate('/dashboard');
            } finally {
                setIsLoading(false);
            }
        }

        fetchMeetingData();

        // Real-time Subscription
        const channel = supabase
            .channel(`note-updates-${noteId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'notes',
                    filter: `id=eq.${noteId}`
                },
                (payload) => {
                    const updatedNote = payload.new as Note;
                    setNote(prev => prev ? { ...prev, ...updatedNote } : updatedNote);

                    // If brief arrives via Realtime, stop synthesizing immediately
                    if (updatedNote.leadership_brief) {
                        setIsSynthesizing(false);
                    }

                    // If processed status changes, refresh tasks
                    if (updatedNote.processed) {
                        fetchTasksOnly();
                    }
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [noteId, navigate, showToast]);

    // Helper to re-fetch tasks only
    async function fetchTasksOnly() {
        if (!noteId) return;
        const { data } = await supabase
            .from('tasks')
            .select(`*, assignee:assignee_id(id, full_name, email, avatar_url)`)
            .eq('note_id', noteId)
            .order('created_at', { ascending: true });
        if (data) setTasks(data);
    }

    // --- COMPUTED ---
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

    // --- ACTIONS ---
    const handleAnimationComplete = useCallback(() => {
        setIsSynthesizing(false);
    }, []);

    async function handleTitleSave() {
        if (!note || editedTitle === note.meeting_title) {
            setIsEditingTitle(false);
            return;
        }
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
        showToast({ type: 'success', title: 'Copied', message: 'Notes copied to clipboard' });
        setTimeout(() => setCopied(false), 2000);
    }

    async function handleProcessTasks() {
        if (!note || !user) return;
        setIsProcessingTasks(true);
        try {
            const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-ai-notes`;
            const response = await fetch(edgeFunctionUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                },
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
        // Basic export logic
        if (!note) return;
        const blob = new Blob([note.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `notes-${formatDateShort(note.created_at)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async function handleDelete() {
        if (!note) return;
        setIsDeleting(true);
        try {
            await supabase.from('tasks').delete().eq('note_id', note.id);
            await supabase.from('notes').delete().eq('id', note.id);
            showToast({ type: 'success', title: 'Deleted', message: 'Meeting removed' });
            navigate('/dashboard');
        } catch {
            showToast({ type: 'error', title: 'Error', message: 'Failed to delete' });
        } finally {
            setIsDeleting(false);
        }
    }

    function handleSummaryGenerated(summaryData: any) {
        if (note) {
            setNote(prev => prev ? { ...prev, leadership_brief: summaryData } : null);
            setIsSynthesizing(false);
        }
    }

    // --- RENDER ---
    if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    if (!note) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="mb-6">
                    <Button variant="ghost" onClick={() => navigate('/dashboard')} className="pl-0 hover:bg-transparent">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
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

                {/* 2-COLUMN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">

                    {/* LEFT COLUMN: CONTENT */}
                    <div className="lg:col-span-2 space-y-8">
                        <MeetingContent note={note} copied={copied} onCopyNotes={handleCopyNotes} />

                        {/* STRICT TOGGLE LOGIC FOR SUMMARY */}
                        <div id="leadership-section">
                            {isSynthesizing ? (
                                <LeadershipGenerationProgress
                                    onComplete={handleAnimationComplete}
                                    hasData={!!note.leadership_brief}
                                />
                            ) : note.leadership_brief ? (
                                <LeadershipSummaryDisplay summary={note.leadership_brief} />
                            ) : (
                                /* EMPTY STATE */
                                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
                                        <Briefcase className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">No summary available</h3>
                                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                        Generate a concise executive summary, decisions, and action items from this meeting.
                                    </p>
                                    <Button
                                        onClick={() => setShowSummaryModal(true)}
                                        className="px-8 py-3 bg-gradient-to-br from-[#355E1F] to-[#6FA84C] text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                                    >
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        Generate Summary
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: ACTIONS */}
                    <div className="space-y-6">
                        <div className="sticky top-6 space-y-6">

                            <MeetingActions
                                onExport={handleExport}
                                onShare={handleShare}
                                onDelete={() => setShowDeleteModal(true)}
                                onGenerateSummary={() => setShowSummaryModal(true)}
                                hasSummary={!!note.leadership_brief}
                            />

                            {/* Plant Your Seeds Card */}
                            {tasks.length === 0 && note.leadership_brief && (
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 text-center relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
                                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-4">
                                        <Sprout className="w-6 h-6 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Plant Your Seeds</h3>
                                    <p className="text-sm text-gray-500 mb-6">
                                        You have a summary, but no trackable tasks yet. Let AI extract actionable tasks from your notes.
                                    </p>
                                    <Button
                                        onClick={handleProcessTasks}
                                        disabled={isProcessingTasks}
                                        className="w-full justify-center bg-gradient-to-br from-[#355E1F] to-[#6FA84C] hover:shadow-lg hover:shadow-green-900/20 hover:scale-[1.02] text-white font-semibold transition-all duration-300"
                                    >
                                        {isProcessingTasks ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                Growing Tasks...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4 mr-2" />
                                                Process Tasks from Note
                                            </>
                                        )}
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
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative z-10"
                        >
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Meeting?</h3>
                            <p className="text-gray-600 mb-6">This cannot be undone.</p>
                            <div className="flex gap-3 justify-end">
                                <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
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