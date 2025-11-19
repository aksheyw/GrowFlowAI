import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Task } from '../lib/supabase';
import { getTimeOfDay, getFirstName, getInitials } from '../utils/premiumHelpers';
import PremiumTaskCard from '../components/premium/PremiumTaskCard';
import PremiumFilterBar, { PremiumFilterType, SortOption } from '../components/premium/PremiumFilterBar';
import PremiumEmptyState from '../components/premium/PremiumEmptyState';
import NotificationBell from '../components/NotificationBell';
import { useToast } from '../contexts/ToastContext';

export default function DashboardPage() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<PremiumFilterType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('deadline');

  useEffect(() => {
    loadTasks();
    const cleanup = subscribeToRealtime();
    return cleanup;
  }, []);

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
      showToast('Failed to fetch your tasks', 'error');
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
          showToast('Task completed!', 'success');
        }

        if (payload.eventType === 'INSERT') {
          showToast('New task added!', 'success');
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

      showToast(`Task status updated to ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error updating task:', error);
      // Revert by reloading from server to ensure consistency
      loadTasks();
      showToast('Failed to update task status', 'error');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30">
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
        {/* Stats Cards */}
        <div className="
          flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4
          sm:grid sm:grid-cols-3 sm:gap-6 sm:pb-0 sm:mx-0 sm:px-0
          mb-6 sm:mb-8
        ">
          {[
            { label: 'Not Started', count: taskCounts['Not Started'], emoji: '🌱', color: 'from-gray-400 to-gray-500' },
            { label: 'In Progress', count: taskCounts['In Progress'], emoji: '🌿', color: 'from-yellow-400 to-orange-500' },
            { label: 'Completed', count: taskCounts['Done'], emoji: '🌳', color: 'from-green-400 to-emerald-500' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="
                min-w-[280px] sm:min-w-0 flex-shrink-0 snap-center
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

      {/* Floating Action Button */}
      <motion.button
        onClick={() => navigate('/add-note')}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-[#6FA84C] to-[#A4D96C] text-white rounded-full shadow-2xl shadow-green-900/40 flex items-center justify-center group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
      </motion.button>
    </div>
  );
}
