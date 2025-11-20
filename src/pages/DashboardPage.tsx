import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

import confetti from 'canvas-confetti';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Task } from '../lib/supabase';
import { getTimeOfDay, getFirstName } from '../utils/premiumHelpers';
import PremiumTaskCard from '../components/premium/PremiumTaskCard';
import PremiumFilterBar, { PremiumFilterType, SortOption } from '../components/premium/PremiumFilterBar';
import PremiumEmptyState from '../components/premium/PremiumEmptyState';

import { useToast } from '../contexts/ToastContext';

export default function DashboardPage() {
  const { profile } = useAuth();

  const location = useLocation();
  const { addToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<PremiumFilterType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('deadline');

  useEffect(() => {
    loadTasks();
    const cleanup = subscribeToRealtime();
    return cleanup;
  }, []);

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

  async function loadTasks() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:assignee_id(id, full_name, email, avatar_url),
          note:note_id(id, meeting_title, meeting_date, meeting_participants, meeting_location)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      addToast('Failed to fetch your tasks', 'error');
    } finally {
      setLoading(false);
    }
  }

  function subscribeToRealtime() {
    const channel = supabase
      .channel('tasks-premium')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        console.log('Task change:', payload);

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

        loadTasks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

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
      loadTasks();
      addToast('Failed to update task status', 'error');
    }
  }

  const filteredTasks = tasks
    .filter(task => {
      if (activeFilter === 'all') return true;
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
    all: tasks.length,
    'Not Started': tasks.filter(t => t.status === 'Not Started').length,
    'In Progress': tasks.filter(t => t.status === 'In Progress').length,
    'Done': tasks.filter(t => t.status === 'Done').length,
  };

  const filters = [
    { id: 'all' as PremiumFilterType, label: 'All', count: taskCounts.all },
    { id: 'Not Started' as PremiumFilterType, label: 'Not Started', count: taskCounts['Not Started'] },
    { id: 'In Progress' as PremiumFilterType, label: 'In Progress', count: taskCounts['In Progress'] },
    { id: 'Done' as PremiumFilterType, label: 'Done', count: taskCounts['Done'] },
  ];

  const timeOfDay = getTimeOfDay();
  const firstName = getFirstName(profile?.full_name);
  const greeting = `Good ${timeOfDay}, ${firstName}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-8xl mb-4 animate-spin">🌱</div>
          <p className="text-gray-600">Loading your tasks...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 pb-20 md:pb-0">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Greeting Section */}
        <motion.div
          className="mb-4 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">{greeting}</h2>
          <p className="text-gray-600 text-sm sm:text-base">
            You have {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} to manage
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="
          flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4
          sm:grid sm:grid-cols-3 sm:gap-6 sm:pb-0 sm:mx-0 sm:px-0
          mb-8 sm:mb-10
        ">
          {[
            { label: 'Not Started', count: taskCounts['Not Started'], emoji: '🌱', color: 'from-gray-400 to-gray-500' },
            { label: 'In Progress', count: taskCounts['In Progress'], emoji: '🌿', color: 'from-yellow-400 to-orange-500' },
            { label: 'Completed', count: taskCounts['Done'], emoji: '🌳', color: 'from-green-400 to-emerald-500' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="
                min-w-[240px] sm:min-w-0 flex-shrink-0 snap-center
                bg-white rounded-2xl p-5 sm:p-6 
                shadow-sm hover:shadow-xl transition-shadow duration-300 
                border border-gray-200/50
              "
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                <span className="text-3xl sm:text-4xl">{stat.emoji}</span>
              </div>
              <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.count}
              </p>
            </motion.div>
          ))}
        </div>

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
      </main>
    </div>
  );
}
