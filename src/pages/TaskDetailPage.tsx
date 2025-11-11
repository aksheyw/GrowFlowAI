import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase, Task, Profile, TaskDetail } from '../lib/supabase';
import { ArrowLeft, Clock, User, Loader2, Plus, X, Trash2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export default function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [task, setTask] = useState<Task | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newDetail, setNewDetail] = useState('');
  const [details, setDetails] = useState<TaskDetail[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState('');

  useEffect(() => {
    if (taskId) {
      loadTaskAndProfiles();
    }
  }, [taskId]);

  async function loadTaskAndProfiles() {
    try {
      const [taskResult, profilesResult, detailsResult] = await Promise.all([
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
          .order('full_name'),
        supabase
          .from('task_details')
          .select('*')
          .eq('task_id', taskId)
          .order('order_index')
      ]);

      if (taskResult.error) throw taskResult.error;
      if (profilesResult.error) throw profilesResult.error;
      if (detailsResult.error) throw detailsResult.error;

      setTask(taskResult.data);
      setProfiles(profilesResult.data || []);
      setDetails(detailsResult.data || []);
      setDescriptionValue(taskResult.data?.description || '');
    } catch (error) {
      console.error('Error loading task:', error);
      addToast('Failed to load task details', 'error');
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
      addToast('Task updated successfully', 'success');
    } catch (error) {
      console.error('Error updating task:', error);
      addToast('Failed to update task', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddDetail() {
    if (!newDetail.trim() || !task) return;

    try {
      const { data, error } = await supabase
        .from('task_details')
        .insert({
          task_id: task.id,
          content: newDetail.trim(),
          order_index: details.length
        })
        .select()
        .single();

      if (error) throw error;

      setDetails([...details, data]);
      setNewDetail('');
      addToast('Detail added successfully', 'success');
    } catch (error) {
      console.error('Error adding detail:', error);
      addToast('Failed to add detail', 'error');
    }
  }

  async function handleRemoveDetail(detailId: string) {
    try {
      const { error } = await supabase
        .from('task_details')
        .delete()
        .eq('id', detailId);

      if (error) throw error;

      setDetails(details.filter(d => d.id !== detailId));
      addToast('Detail removed successfully', 'success');
    } catch (error) {
      console.error('Error removing detail:', error);
      addToast('Failed to remove detail', 'error');
    }
  }

  async function handleDeleteTask() {
    if (!task) return;

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this task? This action cannot be undone.'
    );

    if (!confirmDelete) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);

      if (error) throw error;

      addToast('Task deleted successfully', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting task:', error);
      addToast('Failed to delete task', 'error');
      setDeleting(false);
    }
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
                  value={descriptionValue}
                  onChange={(e) => setDescriptionValue(e.target.value)}
                  onBlur={() => {
                    if (descriptionValue !== task.description) {
                      handleUpdate({ description: descriptionValue });
                    }
                  }}
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

            {details.length > 0 ? (
              <ul className="space-y-2">
                {details.map((detail) => (
                  <li key={detail.id} className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-medium flex-shrink-0">
                      ✓
                    </span>
                    <span className="flex-1 text-gray-700">{detail.content}</span>
                    <button
                      onClick={() => handleRemoveDetail(detail.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Remove detail"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No additional details added yet. Use the form above to add sub-tasks or notes.</p>
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
                    {(task as Task & { creator?: Profile }).creator ? (
                      <>
                        <div className="w-6 h-6 rounded-full bg-green-700 text-white flex items-center justify-center text-xs font-medium">
                          {getInitials((task as Task & { creator?: Profile }).creator!.full_name)}
                        </div>
                        <span className="text-gray-900">{(task as Task & { creator?: Profile }).creator!.full_name}</span>
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

          <div className="border-t border-gray-200 pt-6 mt-6">
            <button
              onClick={handleDeleteTask}
              disabled={deleting}
              className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Delete Task
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
