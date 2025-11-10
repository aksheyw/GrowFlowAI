import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';

export default function TestEdgeFunctionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  async function testSimpleTask() {
    if (!user) return;

    setLoading(true);
    setTestResult('Testing simple task insertion...');

    const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-ai-notes`;

    try {
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          user_id: user.id,
          tasks: [
            {
              description: 'Test task created at ' + new Date().toLocaleTimeString(),
              priority: 'High',
              status: 'Not Started'
            }
          ]
        })
      });

      const data = await response.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setTestResult('Error: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  }

  async function testNoteProcessing() {
    if (!user) return;

    setLoading(true);
    setTestResult('Testing note processing...');

    const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-ai-notes`;

    try {
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          user_id: user.id,
          note_text: 'Test meeting notes: John needs to complete the report by Friday. Sarah will review it next week.',
          note_id: crypto.randomUUID()
        })
      });

      const data = await response.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setTestResult('Error: ' + (error instanceof Error ? error.message : String(error)));
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edge Function Test Page</h1>

          <div className="space-y-4 mb-6">
            <button
              onClick={testSimpleTask}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              Test 1: Direct Task Insertion
            </button>

            <button
              onClick={testNoteProcessing}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              Test 2: Note Processing (with/without AI)
            </button>
          </div>

          {testResult && (
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>{testResult}</pre>
            </div>
          )}

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-900 mb-2">Test Information:</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li><strong>Test 1:</strong> Sends pre-structured task data directly to Edge Function</li>
              <li><strong>Test 2:</strong> Sends raw note text for AI processing (or simple conversion if no OpenAI key)</li>
              <li><strong>Edge Function URL:</strong> {import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-ai-notes</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
