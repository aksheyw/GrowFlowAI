import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Task } from '../lib/supabase';
import { LogOut, Plus, Search, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import NotificationBell from '../components/NotificationBell';

type FilterType = 'all' | 'my-tasks' | 'not-started' | 'in-progress' | 'done';
type SortType = 'newest' | 'oldest';
type ViewType = 'card' | 'list';

export default function DashboardPage() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [viewType, setViewType] = useState<ViewType>('card');
  const [showFilters, setShowFilters] = useState(false);
  const [filterByName, setFilterByName] = useState('');
  const [filterByDeadline, setFilterByDeadline] = useState('');
  const [filterByCreatedDate, setFilterByCreatedDate] = useState('');

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
    // Status filter
    if (filter === 'my-tasks' && task.assignee_id !== profile?.id) return false;
    if (filter === 'not-started' && task.status !== 'Not Started') return false;
    if (filter === 'in-progress' && task.status !== 'In Progress') return false;
    if (filter === 'done' && task.status !== 'Done') return false;

    // Keyword search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesDescription = task.description.toLowerCase().includes(query);
      const matchesAssignee = task.assignee?.full_name?.toLowerCase().includes(query);
      if (!matchesDescription && !matchesAssignee) return false;
    }

    // Name filter
    if (filterByName && task.assignee) {
      if (!task.assignee.full_name.toLowerCase().includes(filterByName.toLowerCase())) return false;
    }

    // Deadline filter
    if (filterByDeadline) {
      if (!task.deadline || task.deadline !== filterByDeadline) return false;
    }

    // Created date filter
    if (filterByCreatedDate) {
      const taskDate = new Date(task.created_at).toISOString().split('T')[0];
      if (taskDate !== filterByCreatedDate) return false;
    }

    return true;
  }).sort((a, b) => {
    // Sort by LIFO (newest first) or FIFO (oldest first)
    if (sortBy === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
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
          <p className="mt-4 text-gray-600">Loading notes...</p>
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
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Notes</h2>
              <p className="text-gray-600 mt-1">Personal workspace • Team collaboration • All in one</p>
            </div>

            <button
              onClick={() => navigate('/add-note')}
              className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-lg font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Note
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-green-700 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All Notes
            </button>
            <button
              onClick={() => setFilter('my-tasks')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'my-tasks'
                  ? 'bg-green-700 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              My Notes
            </button>
            <button
              onClick={() => setFilter('not-started')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'not-started'
                  ? 'bg-green-700 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Not Started
            </button>
            <button
              onClick={() => setFilter('in-progress')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'in-progress'
                  ? 'bg-green-700 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilter('done')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'done'
                  ? 'bg-green-700 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Done
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes by keyword..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  showFilters ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>

              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewType('card')}
                  className={`p-2 rounded transition-colors ${
                    viewType === 'card' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                  title="Card view"
                >
                  <LayoutGrid className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={() => setViewType('list')}
                  className={`p-2 rounded transition-colors ${
                    viewType === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                  title="List view"
                >
                  <List className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Name
                </label>
                <input
                  type="text"
                  value={filterByName}
                  onChange={(e) => setFilterByName(e.target.value)}
                  placeholder="Assignee name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Deadline
                </label>
                <input
                  type="date"
                  value={filterByDeadline}
                  onChange={(e) => setFilterByDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Created Date
                </label>
                <input
                  type="date"
                  value={filterByCreatedDate}
                  onChange={(e) => setFilterByCreatedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>

              {(filterByName || filterByDeadline || filterByCreatedDate) && (
                <div className="md:col-span-3">
                  <button
                    onClick={() => {
                      setFilterByName('');
                      setFilterByDeadline('');
                      setFilterByCreatedDate('');
                    }}
                    className="text-sm text-green-700 hover:text-green-800 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>


        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No notes yet</h3>
            <p className="text-gray-600 mb-6">Start by adding your first note</p>
            <button
              onClick={() => navigate('/add-note')}
              className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Your First Note
            </button>
          </div>
        ) : viewType === 'card' ? (
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
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200">
            {filteredTasks.map(task => (
              <div
                key={task.id}
                onClick={() => navigate(`/task/${task.id}`)}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl flex-shrink-0">
                    {task.status === 'Not Started' && '🌱'}
                    {task.status === 'In Progress' && '🌿'}
                    {task.status === 'Done' && '🌳'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <p className="font-medium text-gray-900 line-clamp-2">{task.description}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'High' ? 'bg-red-100 text-red-700' :
                          task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const confirmDelete = window.confirm(
                              'Are you sure you want to delete this task? This action cannot be undone.'
                            );
                            if (confirmDelete) {
                              handleDeleteTask(task.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete task"
                        >
                          <Plus className="w-4 h-4 rotate-45" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {task.assignee && (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-green-700 text-white flex items-center justify-center text-xs font-medium">
                            {task.assignee.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <span>{task.assignee.full_name}</span>
                        </div>
                      )}

                      {task.deadline && (
                        <div className="flex items-center gap-1">
                          <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                      </div>

                      <select
                        value={task.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusChange(task.id, e.target.value as Task['status']);
                        }}
                        className="ml-auto px-3 py-1 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
