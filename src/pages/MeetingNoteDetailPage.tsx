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

    // State
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

    // Logic Refactor: Explicit Synthesizing State
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [isProcessingTasks, setIsProcessingTasks] = useState(false);

    // Initialize synthesizing state from location if available
    useEffect(() => {
        if (location.state?.isSynthesizing) {
            setIsSynthesizing(true);
        }
    }, [location.state]);

    // Fetch meeting data
    useEffect(() => {
        async function fetchMeetingData() {
            if (!noteId) return;

            setIsLoading(true);

            try {
                // Fetch note with leadership_brief
                const { data: noteData, error: noteError } = await supabase
                    .from('notes')
                    .select('*, leadership_brief')
                    .eq('id', noteId)
                    .single();

                if (noteError) throw noteError;

                if (!noteData) {
                    throw new Error('Note not found');
                }

                setNote(noteData);
                setEditedTitle(noteData.meeting_title || 'Meeting Notes');

                // If note has a brief, we are definitely not synthesizing anymore
                if (noteData.leadership_brief) {
                    setIsSynthesizing(false);
                } else if (location.state?.isSynthesizing) {
                    // Keep it true
                } else {
                    // If no brief and no flag, we are just in "empty" state
                    setIsSynthesizing(false);
                }

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
                navigate('/dashboard?view=notes');
            } finally {
                setIsLoading(false);
            }
        }

        fetchMeetingData();

        // Real-time subscription for note updates
        if (!noteId) return;

        const subscription = supabase
            .channel(`note-${noteId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'notes',
                    filter: `id=eq.${noteId}`
                },
                (payload) => {
                    console.log('Real-time update received:', payload);
                    const updatedNote = payload.new as Note;

                    // Update local state
                    setNote(prev => {
                        if (!prev) return updatedNote;
                        return { ...prev, ...updatedNote };
                    });

                    // Check for leadership brief arrival
                    if (updatedNote.leadership_brief) {
                        setNote(prev => prev ? { ...prev, leadership_brief: updatedNote.leadership_brief } : null);
                        setIsSynthesizing(false);
                    }

                    // Check for task processing completion
                    if (updatedNote.processed && !note?.processed) {
                        fetchTasksOnly();
                    }
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [noteId, navigate, showToast, location.state]);

    async function fetchTasksOnly() {
        if (!noteId) return;
        const { data: tasksData } = await supabase
            .from('tasks')
            .select(`*, assignee:assignee_id(id, full_name, email, avatar_url)`)
            .eq('note_id', noteId)
            .order('created_at', { ascending: true });

        if (tasksData) setTasks(tasksData);
    }

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
        const statusMap: Record<string, string> = {
            'not_started': 'Not Started',
            'in_progress': 'In Progress',
            'done': 'Done'
        };
        return tasks.filter(task => task.status === statusMap[taskFilter]);
    }, [tasks, taskFilter]);

    // Handlers
    const handleAnimationComplete = useCallback(() => {
        setIsSynthesizing(false);
    }, []);

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

    function handleSummaryGenerated(summaryData: {
        tldr: string;
        decisions: string[];
        actionItems: string[];
        emailFormat: string;
        chatFormat: string;
        documentFormat: string;
    }) {
        if (note) {
            setNote(prev => prev ? { ...prev, leadership_brief: summaryData } : null);
            setIsSynthesizing(false);
        }
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

            if (!response.ok) {
                throw new Error(`Processing failed: ${response.status}`);
            }

            const result = await response.json();
            console.log('Task processing result:', result);

            await fetchTasksOnly();

            showToast({
                type: 'success',
                title: 'Tasks Generated',
                message: `Successfully created ${result.created || 0} tasks`,
                duration: 3000
            });

        } catch (error) {
            console.error('Error processing tasks:', error);
            showToast({
                type: 'error',
                title: 'Failed to generate tasks',
                message: 'Please try again'
            });
        } finally {
            setIsProcessingTasks(false);
        }
    }

    async function handleDelete() {
        if (!note) return;

        setIsDeleting(true);

        try {
            const { error: tasksError } = await supabase
                .from('tasks')
                .delete()
                .eq('note_id', note.id);

            if (tasksError) throw tasksError;

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

            navigate('/dashboard?view=notes');

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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/20 pb-20 md:pb-0">
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
                    <Button
                        onClick={() => navigate('/dashboard?view=notes')}
                        className="px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                    >
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6 flex items-center justify-start gap-2 text-sm"
                >
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/dashboard?view=notes')}
                        className="
              flex items-center gap-1.5
              text-gray-600 hover:text-gray-900
              transition-colors duration-200
              group pl-0 hover:bg-transparent
            "
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span className="font-medium">Dashboard</span>
                    </Button>

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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    <MeetingContent
                        note={note}
                        copied={copied}
                        onCopyNotes={handleCopyNotes}
                    />


                    <div className="space-y-8">
                        {/* 1. Leadership Summary Section (Strict Priority Rendering) */}
                        {isSynthesizing ? (
                            <LeadershipGenerationProgress
                                onComplete={handleAnimationComplete}
                                hasData={!!note.leadership_brief}
                            />
                        ) : note.leadership_brief ? (
                            <LeadershipSummaryDisplay summary={note.leadership_brief} />
                        ) : (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                                    <Briefcase className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Leadership Brief</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Generate a concise executive summary, decisions, and action items from this meeting.
                                </p>
                                <Button
                                    onClick={() => {
                                        setShowSummaryModal(true);
                                    }}
                                    className="w-full justify-center bg-gradient-to-br from-[#355E1F] to-[#6FA84C] hover:shadow-lg hover:shadow-green-900/20 hover:scale-[1.02] text-white font-semibold transition-all duration-300"
                                >
                                    Generate Summary
                                </Button>
                            </div>
                        )}

                        <MeetingActions
                            onExport={handleExport}
                            onShare={handleShare}
                            onDelete={() => setShowDeleteModal(true)}
                            onGenerateSummary={() => setShowSummaryModal(true)}
                            hasSummary={!!note.leadership_brief}
                        />

                        {tasks.length > 0 ? (
                            <MeetingTasks
                                tasks={filteredTasks}
                                filter={taskFilter}
                                onFilterChange={setTaskFilter}
                            />
                        ) : note.leadership_brief ? (
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
                        ) : null}
                    </div>
                </div>
            </main>

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
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 font-medium"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    isLoading={isDeleting}
                                    className="px-4 py-2 font-medium flex items-center gap-2"
                                >
                                    {!isDeleting && <Trash2 className="w-4 h-4" />}
                                    Delete Everything
                                </Button>
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
