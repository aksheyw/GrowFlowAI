import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Select from '../components/ui/Select';

export default function TestNotificationPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [notificationType, setNotificationType] = useState<'assigned' | 'updated' | 'completed'>(
    'assigned'
  );

  async function handleCreateTestNotification() {
    if (!user || !recipientEmail.trim()) {
      addToast('Please enter recipient email', 'error');
      return;
    }

    setLoading(true);

    try {
      const { data: recipientProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', recipientEmail.toLowerCase())
        .maybeSingle();

      if (profileError) throw profileError;
      if (!recipientProfile) {
        addToast('Recipient not found', 'error');
        setLoading(false);
        return;
      }

      const messages = {
        assigned: `You have been assigned a new task by ${profile?.full_name}`,
        updated: `A task you're working on has been updated by ${profile?.full_name}`,
        completed: `A task you assigned has been completed by ${profile?.full_name}`,
      };

      const { error: notifError } = await supabase.from('notifications').insert([
        {
          recipient_id: recipientProfile.id,
          actor_id: user.id,
          type: notificationType,
          message: messages[notificationType],
          task_id: null,
          read: false,
        },
      ]);

      if (notifError) throw notifError;

      addToast(`Notification sent to ${recipientEmail}`, 'success');
      setRecipientEmail('');
    } catch (error) {
      console.error('Error creating notification:', error);
      addToast('Failed to create notification', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
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

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Test Notifications</h1>
          <p className="text-gray-600 mb-6">
            Send test notifications to simulate the notification flow
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Email
              </label>
              <input
                id="email"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Notification Type
              </label>
              <Select
                value={notificationType}
                onChange={(value) =>
                  setNotificationType(value as 'assigned' | 'updated' | 'completed')
                }
                options={[
                  { value: 'assigned', label: '📋 Task Assigned' },
                  { value: 'updated', label: '✏️ Task Updated' },
                  { value: 'completed', label: '✅ Task Completed' }
                ]}
                className="w-full"
              />
            </div>

            <button
              onClick={handleCreateTestNotification}
              disabled={loading || !recipientEmail.trim()}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Test Notification'
              )}
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">How to test:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Open GrowFlow in two browser windows/tabs</li>
              <li>Log in with different accounts in each window</li>
              <li>In this window, enter the email of the other account</li>
              <li>Click "Send Test Notification"</li>
              <li>In the other window, you'll see the notification bell update</li>
              <li>A toast will appear in the top-right corner</li>
              <li>Click the bell to see the notification in the dropdown</li>
              <li>Click the dot or "Mark all as read" to mark as read</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
