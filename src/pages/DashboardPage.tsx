import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Task } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import NotificationBell from '../components/NotificationBell';

type FilterType = 'all' | 'Not Started' | 'In Progress' | 'Done';

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

function getInitials(name: string | undefined) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function DashboardPage() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    loadTasks();
    const cleanup = subscribeToRealtime();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      cleanup();
      window.removeEventListener('scroll', handleScroll);
    };
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
          showToast('Task completed!', 'success');
        }

        loadTasks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async function handleStatusChange(taskId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      showToast(`Task status updated to ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error updating task:', error);
      showToast('Failed to update task status', 'error');
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'all') return true;
    return task.status === activeFilter;
  });

  const taskCounts = {
    all: tasks.length,
    'Not Started': tasks.filter(t => t.status === 'Not Started').length,
    'In Progress': tasks.filter(t => t.status === 'In Progress').length,
    'Done': tasks.filter(t => t.status === 'Done').length,
  };

  const timeOfDay = getTimeOfDay();
  const greeting = `Good ${timeOfDay}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Premium Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg transition-all duration-300 ${
                isScrolled ? 'scale-90' : 'scale-100'
              }`}>
                {getInitials(profile?.full_name)}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{greeting}</h1>
                <p className="text-sm text-gray-500">{profile?.full_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <NotificationBell />
              <button
                onClick={signOut}
                className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-600 transition-all hover:scale-105 active:scale-95"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Bar */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg shadow-black/5 p-2 mb-8">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {(['all', 'Not Started', 'In Progress', 'Done'] as FilterType[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex-shrink-0 px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
                  activeFilter === filter
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{filter}</span>
                <span className="ml-2 text-sm opacity-75">
                  {taskCounts[filter]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tasks Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 mb-6">
              <Plus className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-500 mb-8">Start by adding your first task</p>
            <button
              onClick={() => navigate('/add-note')}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
            >
              Add Task
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => navigate(`/task/${task.id}`)}
                className="group bg-white rounded-3xl p-6 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {task.description}
                  </h3>
                  <select
                    value={task.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      task.status === 'Done'
                        ? 'bg-green-100 text-green-700'
                        : task.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>


                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    {task.assignee?.avatar_url ? (
                      <img
                        src={task.assignee.avatar_url}
                        alt={task.assignee.full_name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-medium">
                        {getInitials(task.assignee?.full_name)}
                      </div>
                    )}
                    <span className="text-sm text-gray-600">{task.assignee?.full_name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate('/add-note')}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl shadow-2xl shadow-blue-500/40 hover:shadow-3xl hover:shadow-blue-500/50 transition-all hover:scale-110 active:scale-95 flex items-center justify-center group"
      >
        <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </div>
  );
}
