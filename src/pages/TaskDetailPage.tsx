import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Task, Profile } from '../lib/supabase';
import { ArrowLeft, Calendar, Clock, User, Loader2, Plus, X } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export default function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [task, setTask] = useState<Task | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newDetail, setNewDetail] = useState('');
  const [details, setDetails] = useState<string[]>([]);

  useEffect(() => {
    if (taskId) {
      loadTaskAndProfiles();
    }
  }, [taskId]);

  async function loadTaskAndProfiles() {
    try {
      const [taskResult, profilesResult] = await Promise.all([
        supabase
          .from('tasks')
          .select(`
            *,
            assignee:assignee_id(id, full_name, email, avatar_url),
            creator:user_id(id, full_name, email, avatar_url)
          `)
          .eq('id', taskId)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('*')
          .order('full_name')
      ]);

      if (taskResult.error) throw taskResult.error;
      if (profilesResult.error) throw profilesResult.error;

      setTask(taskResult.data);
      setProfiles(profilesResult.data || []);
    } catch (error) {
      console.error('Error loading task:', error);
      showToast('Failed to load task details', 'error');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(updates: Partial<Task>) {
    if (!task) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', task.id);

      if (error) throw error;

      setTask({ ...task, ...updates });
      showToast('Task updated successfully', 'success');
    } catch (error) {
      console.error('Error updating task:', error);
      showToast('Failed to update task', 'error');
    } finally {
      setSaving(false);
    }
  }

  function handleAddDetail() {
    if (newDetail.trim()) {
      setDetails([...details, newDetail.trim()]);
      setNewDetail('');
    }
  }

  function handleRemoveDetail(index: number) {
    setDetails(details.filter((_, i) => i !== index));
  }

  const formatCreatedAt = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

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
          <p className="mt-4 text-gray-600">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Task not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-green-700 hover:text-green-800 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Task Details</h1>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={task.description}
                  onChange={(e) => handleUpdate({ description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
                  disabled={saving}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={task.status}
                    onChange={(e) => handleUpdate({ status: e.target.value as Task['status'] })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    disabled={saving}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={task.priority}
                    onChange={(e) => handleUpdate({ priority: e.target.value as Task['priority'] })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    disabled={saving}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign To
                  </label>
                  <select
                    value={task.assignee_id || ''}
                    onChange={(e) => handleUpdate({ assignee_id: e.target.value || null })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    disabled={saving}
                  >
                    <option value="">Unassigned</option>
                    {profiles.map(profile => (
                      <option key={profile.id} value={profile.id}>
                        {profile.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={task.deadline || ''}
                    onChange={(e) => handleUpdate({ deadline: e.target.value || null })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    disabled={saving}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h2>

            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDetail}
                  onChange={(e) => setNewDetail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddDetail()}
                  placeholder="Add a detail or sub-task..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                />
                <button
                  onClick={handleAddDetail}
                  className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>

            {details.length > 0 && (
              <ul className="space-y-2">
                {details.map((detail, index) => (
                  <li key={index} className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                    <span className="flex-1 text-gray-700">{detail}</span>
                    <button
                      onClick={() => handleRemoveDetail(index)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Information</h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Created by</p>
                  <div className="flex items-center gap-2 mt-1">
                    {(task as any).creator ? (
                      <>
                        <div className="w-6 h-6 rounded-full bg-green-700 text-white flex items-center justify-center text-xs font-medium">
                          {getInitials((task as any).creator.full_name)}
                        </div>
                        <span className="text-gray-900">{(task as any).creator.full_name}</span>
                      </>
                    ) : (
                      <span className="text-gray-500">Unknown</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Created on</p>
                  <p className="text-gray-900 mt-1">{formatCreatedAt(task.created_at)}</p>
                </div>
              </div>

              {task.assignee && (
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Assigned to</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-6 h-6 rounded-full bg-green-700 text-white flex items-center justify-center text-xs font-medium">
                        {getInitials(task.assignee.full_name)}
                      </div>
                      <span className="text-gray-900">{task.assignee.full_name}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {saving && (
            <div className="mt-6 flex items-center justify-center gap-2 text-green-700">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Saving changes...</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
