import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Task } from '../lib/supabase';
import { getTimeOfDay, getInitials } from '../utils/premiumHelpers';
import PremiumTaskCard from '../components/premium/PremiumTaskCard';
import PremiumFilterBar, { PremiumFilterType } from '../components/premium/PremiumFilterBar';
import PremiumEmptyState from '../components/premium/PremiumEmptyState';
import NotificationBell from '../components/NotificationBell';
import { useToast } from '../contexts/ToastContext';

export default function DashboardPageNew() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<PremiumFilterType>('all');

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
    const subscription = supabase
      .channel('tasks-changes-premium')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks(prev => [payload.new as Task, ...prev]);
            showToast('A fresh seed has been planted 🌱', 'success');
          }

          if (payload.eventType === 'UPDATE') {
            const updatedTask = payload.new as Task;
            const oldTask = payload.old as Task;

            setTasks(prev => prev.map(task =>
              task.id === updatedTask.id ? updatedTask : task
            ));

            if (updatedTask.status === 'Done' && oldTask.status !== 'Done') {
              showToast('Your plant has fully bloomed! 🌺', 'success');
              celebrateCompletion();
            }
          }

          if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(task => task.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  async function handleStatusChange(taskId: string, newStatus: Task['status']) {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No active session');
      }

      const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-task-status`;

      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_id: taskId,
          new_status: newStatus,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task status');
      }

      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
      showToast('Could not update task status', 'error');
    }
  }

  function celebrateCompletion() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2D5016', '#6FA84C', '#A4D96C']
    });
  }

  async function handleLogout() {
    await signOut();
    navigate('/login');
  }

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'my-tasks' && task.assignee_id !== profile?.id) return false;
    if (activeFilter === 'in-progress' && task.status !== 'In Progress') return false;
    if (activeFilter === 'done' && task.status !== 'Done') return false;
    return true;
  });

  const taskStats = {
    notStarted: tasks.filter(t => t.status === 'Not Started').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Done').length
  };

  const filters = [
    { id: 'all' as PremiumFilterType, label: 'All Tasks', count: tasks.length },
    { id: 'my-tasks' as PremiumFilterType, label: 'My Tasks', count: tasks.filter(t => t.assignee_id === profile?.id).length },
    { id: 'in-progress' as PremiumFilterType, label: 'In Progress', icon: '🪴', count: taskStats.inProgress },
    { id: 'done' as PremiumFilterType, label: 'Completed', icon: '🌺', count: taskStats.completed }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="text-6xl mb-4"
          >
            🌱
          </motion.div>
          <p className="text-lg text-gray-600">Loading your garden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30">
      <header className="
        sticky top-0 z-50
        bg-white/80 backdrop-blur-xl
        border-b border-gray-100
        shadow-sm
        transition-all duration-200
      ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/dashboard')}>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="text-3xl"
            >
              🌱
            </motion.div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#2D5016] to-[#6FA84C] bg-clip-text text-transparent">
              GrowFlow
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />

            <div className="flex items-center gap-2">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-10 h-10 rounded-full ring-2 ring-white hover:ring-green-200 transition-all cursor-pointer"
                />
              ) : (
                <div className="
                  w-10 h-10 rounded-full
                  bg-gradient-to-br from-[#6FA84C] to-[#2D5016]
                  flex items-center justify-center
                  text-white font-medium text-sm
                  hover:ring-2 hover:ring-green-200
                  transition-all cursor-pointer
                ">
                  {profile ? getInitials(profile.full_name) : 'U'}
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {profile?.full_name}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Good {getTimeOfDay()}, {profile?.full_name?.split(' ')[0] || 'there'}! 👋
            </h2>
            <p className="text-lg text-gray-600">
              You have {tasks.length} {tasks.length === 1 ? 'plant' : 'plants'} growing in your garden
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="
                bg-white rounded-2xl p-6
                border border-gray-100
                shadow-sm hover:shadow-md
                transition-shadow duration-200
              "
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Not Started</p>
                  <p className="text-3xl font-bold text-gray-900">{taskStats.notStarted}</p>
                </div>
                <div className="text-4xl">🌱</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="
                bg-white rounded-2xl p-6
                border border-gray-100
                shadow-sm hover:shadow-md
                transition-shadow duration-200
              "
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">In Progress</p>
                  <p className="text-3xl font-bold text-gray-900">{taskStats.inProgress}</p>
                </div>
                <div className="text-4xl">🪴</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="
                bg-white rounded-2xl p-6
                border border-gray-100
                shadow-sm hover:shadow-md
                transition-shadow duration-200
              "
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-gray-900">{taskStats.completed}</p>
                </div>
                <div className="text-4xl">🌺</div>
              </div>
            </motion.div>
          </div>
        </div>

        <PremiumFilterBar
          filters={filters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {filteredTasks.length === 0 ? (
          <PremiumEmptyState />
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task) => (
                <PremiumTaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/add-note')}
        className="
          fixed bottom-8 right-8
          w-16 h-16 rounded-full
          bg-gradient-to-br from-[#2D5016] to-[#6FA84C]
          shadow-2xl shadow-green-900/40
          flex items-center justify-center
          text-white
          group
          z-40
          hover:shadow-green-900/50
          transition-shadow duration-200
        "
      >
        <Plus className="w-7 h-7" />

        <div className="
          absolute right-full mr-4
          px-4 py-2 rounded-xl
          bg-gray-900 text-white text-sm font-medium
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          whitespace-nowrap
          pointer-events-none
        ">
          Add Meeting Notes
        </div>
      </motion.button>
    </div>
  );
}
