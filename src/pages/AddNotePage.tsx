import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import PlantIcon from '../components/PlantIcon';

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
  const [defaultPriority, setDefaultPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');

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
          note_id: noteData.id,
          default_priority: defaultPriority
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
      <header className="bg-white/80 backdrop-blur-frosted border-b border-gray-200 sticky top-0 z-10 smooth-transition">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 smooth-transition button-press"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </button>
            <div className="flex items-center gap-2">
              <PlantIcon className="w-6 h-6" />
              <span className="font-semibold text-gray-900 hidden sm:block">GrowFlow</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 smooth-transition">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">Add Note</h1>
            <p className="text-gray-600 leading-relaxed">
              Paste your notes below and we'll process them into actionable tasks
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-50/50 border border-blue-200/60 rounded-xl smooth-transition">
              <h3 className="text-sm font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Meeting Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="meetingTitle" className="block text-sm font-semibold text-gray-900 mb-2">
                    Meeting Name
                  </label>
                  <input
                    id="meetingTitle"
                    type="text"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    placeholder="e.g., Weekly Team Sync"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none smooth-transition text-sm bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="meetingDate" className="block text-sm font-semibold text-gray-900 mb-2">
                    Meeting Date
                  </label>
                  <input
                    id="meetingDate"
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none smooth-transition text-sm bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="meetingLocation" className="block text-sm font-semibold text-gray-900 mb-2">
                    Location
                  </label>
                  <input
                    id="meetingLocation"
                    type="text"
                    value={meetingLocation}
                    onChange={(e) => setMeetingLocation(e.target.value)}
                    placeholder="e.g., Zoom, Office Room 3A"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none smooth-transition text-sm bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="meetingParticipants" className="block text-sm font-semibold text-gray-900 mb-2">
                    Participants
                  </label>
                  <input
                    id="meetingParticipants"
                    type="text"
                    value={meetingParticipants}
                    onChange={(e) => setMeetingParticipants(e.target.value)}
                    placeholder="John, Sarah, Mike"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none smooth-transition text-sm bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="defaultPriority" className="block text-sm font-semibold text-gray-900 mb-2">
                    Default Priority
                  </label>
                  <select
                    id="defaultPriority"
                    value={defaultPriority}
                    onChange={(e) => setDefaultPriority(e.target.value as 'Low' | 'Medium' | 'High')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none smooth-transition text-sm bg-white cursor-pointer"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-semibold text-gray-900 mb-2">
                Meeting Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                id="notes"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={14}
                className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none smooth-transition resize-none font-mono text-sm leading-relaxed bg-white"
                placeholder="Paste your meeting notes here...

Example:
- John needs to complete the Q4 report by Friday
- Sarah will review the marketing campaign next week
- Team needs to prepare presentation for client meeting on Dec 15"
                required
              />
              <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Include assignee names and deadlines for better task creation
              </p>
            </div>

            {error && (
              <div className="px-4 py-4 rounded-xl flex items-start gap-3 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 animate-slideDown">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">{error}</p>
                  <p className="text-xs mt-1 text-red-600">Check the browser console for detailed error logs.</p>
                </div>
              </div>
            )}

            {processingStatus && !error && (
              <div className={`px-4 py-4 rounded-xl flex items-start gap-3 animate-slideDown ${
                success
                  ? 'bg-green-50/80 backdrop-blur-sm border border-green-200 text-green-700'
                  : 'bg-blue-50/80 backdrop-blur-sm border border-blue-200 text-blue-700'
              }`}>
                {loading ? (
                  <svg className="w-5 h-5 animate-spin flex-shrink-0 mt-0.5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : success ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : null}
                <div className="flex-1">
                  <p className="font-semibold text-sm">{processingStatus}</p>
                  {tasksCreated > 0 && (
                    <p className="text-xs mt-1">
                      {tasksCreated} new task{tasksCreated > 1 ? 's' : ''} will appear in your dashboard
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={loading || !content.trim()}
                className="flex-1 bg-green-700 hover:bg-green-800 active:bg-green-900 text-white font-semibold py-3.5 px-6 rounded-xl smooth-transition button-press disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-md"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Save & Process Note'
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                disabled={loading}
                className="sm:w-auto px-6 py-3.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 smooth-transition button-press disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-gradient-to-br from-blue-50 to-blue-50/50 border border-blue-200/60 rounded-xl p-5 smooth-transition">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Tips for Better Results
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Include assignee names for each task (e.g., "John needs to...")</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Specify deadlines or timeframes (e.g., "by Friday", "next week")</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Use clear action verbs (complete, review, prepare, schedule)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Mark urgent items explicitly (urgent, high priority, ASAP)</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
