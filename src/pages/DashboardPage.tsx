import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Task } from '../lib/supabase';
import { LogOut, Plus } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import NotificationBell from '../components/NotificationBell';

type FilterType = 'all' | 'my-tasks' | 'not-started' | 'in-progress' | 'done';

export default function DashboardPage() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:assignee_id(id, full_name, email, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(taskId: string, newStatus: Task['status']) {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  async function handleDeleteTask(taskId: string) {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  async function handleLogout() {
    await signOut();
    navigate('/login');
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'my-tasks') return task.assignee_id === profile?.id;
    if (filter === 'not-started') return task.status === 'Not Started';
    if (filter === 'in-progress') return task.status === 'In Progress';
    if (filter === 'done') return task.status === 'Done';
    return true;
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🌱</div>
              <h1 className="text-xl font-bold text-gray-900">GrowFlow</h1>
            </div>

            <div className="flex items-center gap-4">
              <NotificationBell />

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center text-sm font-medium">
                      {profile ? getInitials(profile.full_name) : 'U'}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {profile?.full_name}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Tasks</h2>
            <p className="text-gray-600 mt-1">Track your progress and grow together</p>
            <button
              onClick={() => navigate('/test-notifications')}
              className="text-xs mt-2 text-gray-500 hover:text-gray-700 underline"
            >
              Test Notifications
            </button>
          </div>

          <button
            onClick={() => navigate('/add-note')}
            className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Note
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-green-700 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Tasks
          </button>
          <button
            onClick={() => setFilter('my-tasks')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'my-tasks'
                ? 'bg-green-700 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            My Tasks
          </button>
          <button
            onClick={() => setFilter('not-started')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'not-started'
                ? 'bg-green-700 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Not Started
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'in-progress'
                ? 'bg-green-700 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('done')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'done'
                ? 'bg-green-700 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Done
          </button>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-600 mb-6">Start by adding meeting notes to generate tasks</p>
            <button
              onClick={() => navigate('/add-note')}
              className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Your First Note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
