import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AddNotePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [tasksCreated, setTasksCreated] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [meetingParticipants, setMeetingParticipants] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setLoading(true);
    setSuccess(false);
    setError('');
    setTasksCreated(0);
    setProcessingStatus('Saving your note...');

    try {
      const participantsArray = meetingParticipants
        ? meetingParticipants.split(',').map(p => p.trim()).filter(p => p.length > 0)
        : null;

      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          content: content.trim(),
          processed: false,
          meeting_title: meetingTitle.trim() || null,
          meeting_date: meetingDate || null,
          meeting_location: meetingLocation.trim() || null,
          meeting_participants: participantsArray
        })
        .select()
        .single();

      if (noteError || !noteData) {
        throw new Error(`Failed to save note: ${noteError?.message || 'Unknown error'}`);
      }

      console.log('Note saved:', noteData);
      setProcessingStatus('Sending to AI for processing...');

      const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-ai-notes`;

      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          note_text: content.trim(),
          note_id: noteData.id
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge function error:', errorText);
        throw new Error(`Processing failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Processing result:', result);

      const tasksCreatedCount = result.created || 0;
      setTasksCreated(tasksCreatedCount);

      setSuccess(true);
      setContent('');
      setProcessingStatus(`Successfully created ${tasksCreatedCount} task${tasksCreatedCount !== 1 ? 's' : ''}!`);

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
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

          <form onSubmit={handleSubmit}>
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">Meeting Information (Optional)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="meetingTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Title
                  </label>
                  <input
                    id="meetingTitle"
                    type="text"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    placeholder="e.g., Weekly Team Sync"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="meetingDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Date
                  </label>
                  <input
                    id="meetingDate"
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="meetingLocation" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    id="meetingLocation"
                    type="text"
                    value={meetingLocation}
                    onChange={(e) => setMeetingLocation(e.target.value)}
                    placeholder="e.g., Zoom, Office Room 3A"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="meetingParticipants" className="block text-sm font-medium text-gray-700 mb-1">
                    Participants
                  </label>
                  <input
                    id="meetingParticipants"
                    type="text"
                    value={meetingParticipants}
                    onChange={(e) => setMeetingParticipants(e.target.value)}
                    placeholder="John, Sarah, Mike (comma separated)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Notes *
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