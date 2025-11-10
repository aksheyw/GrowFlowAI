import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ParsedTask {
  description: string;
  priority?: 'Low' | 'Medium' | 'High';
  deadline?: string;
}

export default function AddNotePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [tasksCreated, setTasksCreated] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function parseNotesToTasks(noteText: string): ParsedTask[] {
    const lines = noteText.split('\n').filter(line => line.trim());
    const tasks: ParsedTask[] = [];

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.length < 5) continue;

      let description = trimmed.replace(/^[-*•]\s*/, '');
      let priority: 'Low' | 'Medium' | 'High' = 'Medium';
      let deadline: string | undefined;

      if (/(urgent|asap|critical|high priority)/i.test(description)) {
        priority = 'High';
      } else if (/(low priority|when possible|eventually)/i.test(description)) {
        priority = 'Low';
      }

      const dateMatch = description.match(/(?:by|before|due|deadline:?)\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i);
      if (dateMatch) {
        try {
          const dateParts = dateMatch[1].split(/[-/]/);
          if (dateParts.length === 3) {
            let year = parseInt(dateParts[2]);
            if (year < 100) year += 2000;
            const month = parseInt(dateParts[0]);
            const day = parseInt(dateParts[1]);
            deadline = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          }
        } catch (e) {
          console.warn('Failed to parse date:', e);
        }
      }

      description = description.replace(/\b(urgent|asap|critical|high priority|low priority|when possible|eventually)\b/gi, '').trim();
      description = description.replace(/(?:by|before|due|deadline:?)\s*\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/gi, '').trim();

      if (description.length > 0) {
        tasks.push({ description, priority, deadline });
      }
    }

    if (tasks.length === 0 && noteText.trim().length > 0) {
      tasks.push({
        description: noteText.trim(),
        priority: 'Medium'
      });
    }

    return tasks;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setLoading(true);
    setSuccess(false);
    setError('');
    setTasksCreated(0);
    setProcessingStatus('Parsing your notes and creating tasks...');

    try {
      console.log('Parsing notes:', content);

      const tasks = parseNotesToTasks(content);
      console.log('Parsed tasks:', tasks);

      if (tasks.length === 0) {
        setError('No tasks found in your notes. Please add some actionable items.');
        setLoading(false);
        return;
      }

      setProcessingStatus(`Creating ${tasks.length} task${tasks.length > 1 ? 's' : ''}...`);

      let created = 0;
      const errors: string[] = [];

      for (const task of tasks) {
        try {
          const { error: insertError } = await supabase
            .from('tasks')
            .insert({
              user_id: user.id,
              assignee_id: user.id,
              description: task.description,
              priority: task.priority || 'Medium',
              status: 'Not Started',
              deadline: task.deadline || null
            });

          if (insertError) {
            console.error('Failed to create task:', insertError);
            errors.push(`${task.description}: ${insertError.message}`);
          } else {
            created++;
          }
        } catch (taskError) {
          console.error('Error creating task:', taskError);
          errors.push(`${task.description}: Unknown error`);
        }
      }

      if (created > 0) {
        setTasksCreated(created);
        setSuccess(true);
        setContent('');
        setProcessingStatus(`Successfully created ${created} task${created > 1 ? 's' : ''}!`);

        if (errors.length > 0) {
          console.warn('Some tasks failed to create:', errors);
        }

        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(`Failed to create tasks: ${errors.join(', ')}`);
        setProcessingStatus('');
      }
    } catch (err) {
      console.error('Error processing note:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to process notes: ${errorMessage}`);
      setProcessingStatus('');
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

            {error && (
              <div className="mb-6 px-4 py-3 rounded-lg flex items-center gap-3 bg-red-50 border border-red-200 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">{error}</p>
                  <p className="text-sm mt-1">Check the browser console for detailed error logs.</p>
                </div>
              </div>
            )}

            {processingStatus && !error && (
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