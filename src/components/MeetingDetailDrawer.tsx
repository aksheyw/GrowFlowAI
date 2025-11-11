import { X, FileText, Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Note } from '../lib/supabase';

interface MeetingDetailDrawerProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MeetingDetailDrawer({ note, isOpen, onClose }: MeetingDetailDrawerProps) {
  if (!note) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCreatedAt = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        id="meeting-drawer"
        className={`fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-300 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Meeting Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {note.meeting_title && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Meeting Title</h3>
              </div>
              <p className="text-xl font-bold text-gray-900 pl-7">{note.meeting_title}</p>
            </div>
          )}

          <div className="space-y-4">
            {note.meeting_date && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Date</p>
                  <p className="text-gray-900 font-medium">{formatDate(note.meeting_date)}</p>
                </div>
              </div>
            )}

            {note.meeting_location && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Location</p>
                  <p className="text-gray-900 font-medium">{note.meeting_location}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-600">Note Created</p>
                <p className="text-gray-900 font-medium">{formatCreatedAt(note.created_at)}</p>
              </div>
            </div>
          </div>

          {note.meeting_participants && note.meeting_participants.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Participants ({note.meeting_participants.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2 pl-7">
                {note.meeting_participants.map((participant, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {participant}
                  </span>
                ))}
              </div>
            </div>
          )}

          {note.content && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Meeting Notes</h3>
              </div>
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                  {note.content}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
