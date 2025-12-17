import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

import confetti from 'canvas-confetti';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Task, Note } from '../lib/supabase';
import { getTimeOfDay, getFirstName } from '../utils/premiumHelpers';
import PremiumTaskCard from '../components/premium/PremiumTaskCard';
import PremiumFilterBar, { PremiumFilterType, SortOption } from '../components/premium/PremiumFilterBar';
import PremiumEmptyState from '../components/premium/PremiumEmptyState';
import MeetingNoteCard from '../components/premium/MeetingNoteCard';
import { Button } from '../components/ui/Button';
import TaskDetailModal from '../components/TaskDetailModal';

import { useToast } from '../contexts/ToastContext';

type DashboardTab = 'tasks' | 'notes';

export default function DashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const location = useLocation();
  const { addToast } = useToast();

  // Read initial tab from URL query parameter
  const urlParams = new URLSearchParams(location.search);
  const initialTab = (urlParams.get('view') === 'notes' ? 'notes' : 'tasks') as DashboardTab;
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);

  // Tasks State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeFilter, setActiveFilter] = useState<PremiumFilterType>('active');
  const [sortBy, setSortBy] = useState<SortOption>('deadline');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Notes State
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteTaskCounts, setNoteTaskCounts] = useState<Record<string, number>>({});

  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Fetch Tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:assignee_id(id, full_name, email, avatar_url),
          note:note_id(id, meeting_title, meeting_date, meeting_participants, meeting_location)
        `)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;
      setTasks(tasksData || []);

      // 2. Fetch Notes
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (notesError) throw notesError;
      setNotes(notesData || []);

      // 3. Calculate task counts per note
      const counts: Record<string, number> = {};
      tasksData?.forEach(task => {
        if (task.note_id) {
          counts[task.note_id] = (counts[task.note_id] || 0) + 1;
        }
      });
      setNoteTaskCounts(counts);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      addToast('Failed to fetch your data', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const subscribeToRealtime = useCallback(() => {
    const channel = supabase
      .channel('dashboard-premium')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        if (payload.eventType === 'UPDATE' && payload.new && (payload.new as Task).status === 'Done') {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          addToast('Task completed!', 'success');
        }

        if (payload.eventType === 'INSERT') {
          addToast('New task added!', 'success');
        }

        loadData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addToast, loadData]);

  useEffect(() => {
    loadData();
    const cleanup = subscribeToRealtime();
    return cleanup;
  }, [loadData, subscribeToRealtime]);

  // Handle deep linking for tasks
  useEffect(() => {
    const taskId = urlParams.get('task_id');
    if (taskId && !loading && tasks.length > 0) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setSelectedTask(task);
        // Clean up URL without refreshing
        const newUrl = window.location.pathname + window.location.search.replace(/[\?&]task_id=[^&]+/, '').replace(/^&/, '?');
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [loading, tasks, location.search]);

  // Handle task highlighting from notifications
  useEffect(() => {
    const highlightTaskId = location.state?.highlightTaskId;
    if (!highlightTaskId || loading) return;

    // Wait for tasks to render
    setTimeout(() => {
      const element = document.querySelector(`[data-task-id="${highlightTaskId}"]`);
      if (element) {
        // Scroll into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Add highlight animation
        element.classList.add('highlight-pulse');
        setTimeout(() => {
          element.classList.remove('highlight-pulse');
        }, 2000);
      }
    }, 300);
  }, [location.state?.highlightTaskId, loading]);



  async function handleStatusChange(taskId: string, newStatus: string) {
    // Optimistic update
    setTasks(prevTasks => prevTasks.map(t =>
      t.id === taskId ? { ...t, status: newStatus as Task['status'] } : t
    ));

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      addToast(`Task status updated to ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error updating task:', error);
      // Revert by reloading from server to ensure consistency
      loadData();
      addToast('Failed to update task status', 'error');
    }
  }

  const filteredTasks = tasks
    .filter(task => {
      if (activeFilter === 'active') return task.status !== 'Done';
      return task.status === activeFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'deadline') {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === 'priority') {
        const priorityOrder = { High: 0, Medium: 1, Low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      // Default to created_at
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const taskCounts = {
    active: tasks.filter(t => t.status !== 'Done').length,
    'Not Started': tasks.filter(t => t.status === 'Not Started').length,
    'In Progress': tasks.filter(t => t.status === 'In Progress').length,
    'Done': tasks.filter(t => t.status === 'Done').length,
  };

  const filters = [
    { id: 'active' as PremiumFilterType, label: 'Active', count: taskCounts.active },
    { id: 'Not Started' as PremiumFilterType, label: 'Not Started', count: taskCounts['Not Started'] },
    { id: 'In Progress' as PremiumFilterType, label: 'In Progress', count: taskCounts['In Progress'] },
    { id: 'Done' as PremiumFilterType, label: 'Done', count: taskCounts['Done'] },
  ];

  const timeOfDay = getTimeOfDay();
  const firstName = getFirstName(profile?.full_name);
  const greeting = `Good ${timeOfDay}, ${firstName}`;

  async function handleDeleteTask(taskId: string) {
    // Optimistic update
    setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
    setSelectedTask(null);

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      addToast('Task deleted', 'success');
    } catch (error) {
      console.error('Error deleting task:', error);
      // Revert
      loadData();
      addToast('Failed to delete task', 'error');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-8xl mb-4 animate-spin">🌱</div>
          <p className="text-gray-600">Loading your garden...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 pb-32 md:pb-0">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-8 sm:mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">{greeting}</h2>
              <p className="text-gray-600 text-sm sm:text-base">
                {activeTab === 'tasks'
                  ? `You have ${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'} to manage`
                  : `You have ${notes.length} meeting ${notes.length === 1 ? 'note' : 'notes'} recorded`
                }
              </p>
            </div>

            {/* Segmented Control */}
            <div className="bg-white/50 backdrop-blur-sm p-1 rounded-xl border border-gray-200/50 flex items-center gap-1 w-full md:w-auto">
              {(['tasks', 'notes'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    relative flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors z-10
                    ${activeTab === tab ? 'text-white' : 'text-gray-600 hover:text-gray-900'}
                  `}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-[#2D5016] rounded-lg -z-10 shadow-sm"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {tab === 'tasks' ? 'My Garden' : 'Meeting Notes'}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'tasks' ? (
            <motion.div
              key="tasks-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Stats Cards Removed as per redesign */}

              {/* Filter Bar */}
              <div className="mb-6 sm:mb-8">
                <PremiumFilterBar
                  filters={filters}
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                />
              </div>

              {/* Tasks Grid */}
              {filteredTasks.length === 0 ? (
                <PremiumEmptyState />
              ) : (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                  layout
                >
                  <AnimatePresence mode="popLayout">
                    {filteredTasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <PremiumTaskCard task={task} onStatusChange={handleStatusChange} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="notes-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="text-6xl mb-6">📝</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No notes yet</h3>
                  <p className="text-gray-500 max-w-md mb-8">
                    Paste your first meeting note to start growing your knowledge base.
                  </p>
                  <Button
                    onClick={() => navigate('/add-note')}
                    className="px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
                    size="lg"
                  >
                    Add First Note
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {notes.map((note, index) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <MeetingNoteCard
                        note={note}
                        taskCount={noteTaskCounts[note.id] || 0}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={(updatedTask) => {
              setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
              setSelectedTask(null);
            }}
            onDelete={() => handleDeleteTask(selectedTask.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
