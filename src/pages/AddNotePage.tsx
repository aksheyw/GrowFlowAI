import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export default function AddNotePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [tasksCreated, setTasksCreated] = useState(0);
  const [success, setSuccess] = useState(false);
  const initialTaskCountRef = useRef<number>(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  async function getTaskCount() {
    try {
      const { count, error } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('assignee_id', user?.id);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting task count:', error);
      return 0;
    }
  }

  async function pollForNewTasks(startCount: number, maxAttempts = 30) {
    let attempts = 0;

    return new Promise<number>((resolve) => {
      pollingIntervalRef.current = setInterval(async () => {
        attempts++;
        const currentCount = await getTaskCount();
        const newTasks = currentCount - startCount;

        if (newTasks > 0) {
          clearInterval(pollingIntervalRef.current);
          resolve(newTasks);
        } else if (attempts >= maxAttempts) {
          clearInterval(pollingIntervalRef.current);
          resolve(0);
        } else {
          setProcessingStatus(`AI is processing your notes... (${attempts}s)`);
        }
      }, 1000);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setLoading(true);
    setSuccess(false);
    setTasksCreated(0);
    setProcessingStatus('Sending notes to AI...');

    const n8nWebhookURL = "https://aksheyw1.app.n8n.cloud/webhook/1d398de3-892a-4d5a-a941-62feab1e0250";

    try {
      initialTaskCountRef.current = await getTaskCount();

      const response = await fetch(n8nWebhookURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          note_text: content.trim(),
          note_id: crypto.randomUUID()
        })
      });

      if (response.ok) {
        setProcessingStatus('AI is analyzing and creating tasks...');

        const newTaskCount = await pollForNewTasks(initialTaskCountRef.current);

        if (newTaskCount > 0) {
          setTasksCreated(newTaskCount);
          setSuccess(true);
          setContent('');
          setProcessingStatus(`Successfully created ${newTaskCount} task${newTaskCount > 1 ? 's' : ''}!`);

          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          setProcessingStatus('Processing complete, but no tasks were created. The AI may not have found actionable items in your notes.');
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        }
      } else {
        throw new Error('Webhook call failed');
      }
    } catch (error) {
      console.error('Error processing note:', error);
      setProcessingStatus('');
      alert('Failed to process note. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Add Meeting Notes</h1>
            <p className="text-gray-600">
              Paste your meeting notes below and we'll process them into actionable tasks
            </p>
          </div>

          {/* This form now correctly calls your new handleSubmit function */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Notes
              </label>
              <textarea
                id="notes"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Paste your meeting notes here...

Example:
- John needs to complete the Q4 report by Friday
- Sarah will review the marketing campaign next week
- Team needs to prepare presentation for client meeting on Dec 15"
                required
              />
            </div>

            {processingStatus && (
              <div className={`mb-6 px-4 py-3 rounded-lg flex items-center gap-3 ${
                success
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-blue-50 border border-blue-200 text-blue-700'
              }`}>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
                ) : success ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                ) : null}
                <div className="flex-1">
                  <p className="font-medium">{processingStatus}</p>
                  {tasksCreated > 0 && (
                    <p className="text-sm mt-1">
                      {tasksCreated} new task{tasksCreated > 1 ? 's' : ''} will appear in your dashboard
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading || !content.trim()}
                className="flex-1 bg-green-700 hover:bg-green-800 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Process with AI'
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Tips for better results:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Include assignee names for each task</li>
            <li>Specify deadlines or timeframes when available</li>
            <li>Use clear action items with specific outcomes</li>
            <li>Mark urgent or high-priority items explicitly</li>
          </ul>
        </div>
      </main>
    </div>
  );
}