import { X, FileText, Calendar, MapPin, Users, Clock, CheckCircle2, Circle, Loader } from 'lucide-react';
import { Note, Task } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface MeetingDetailDrawerProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  currentTaskId?: string;
  relatedTasks?: Task[];
}

export default function MeetingDetailDrawer({ note, isOpen, onClose, currentTaskId, relatedTasks = [] }: MeetingDetailDrawerProps) {
  const navigate = useNavigate();

  if (!note) return null;

  const getTaskIcon = (status: Task['status']) => {
    switch (status) {
      case 'Done':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'In Progress':
        return <Loader className="w-5 h-5 text-blue-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

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
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Meeting Name</h3>
              </div>
              <p className="text-xl font-bold text-gray-900 pl-7">{note.meeting_title}</p>
            </div>
          )}

          <div className="space-y-4">
            {note.meeting_date && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Meeting Date</p>
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

          {note.meeting_summary && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Summary</h3>
              </div>
              <div className="bg-blue-50 rounded-lg border border-blue-100 p-4 pl-7">
                <p className="text-sm text-gray-700 leading-relaxed">{note.meeting_summary}</p>
              </div>
            </div>
          )}

          {relatedTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Tasks from this Meeting ({relatedTasks.length})
                </h3>
              </div>
              <div className="space-y-2 pl-7">
                {relatedTasks.map((task) => {
                  const isCurrentTask = task.id === currentTaskId;
                  return (
                    <div
                      key={task.id}
                      onClick={() => {
                        navigate(`/task/${task.id}`);
                        onClose();
                      }}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        isCurrentTask
                          ? 'bg-green-50 border-green-500 shadow-md'
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {getTaskIcon(task.status)}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${
                            isCurrentTask ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {task.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                              getPriorityColor(task.priority)
                            }`}>
                              {task.priority}
                            </span>
                            <span className="text-xs text-gray-500">{task.status}</span>
                            {task.assignee && (
                              <span className="text-xs text-gray-500">
                                • {task.assignee.full_name}
                              </span>
                            )}
                          </div>
                        </div>
                        {isCurrentTask && (
                          <span className="flex-shrink-0 px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">
                            Current
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {note.content && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Full Meeting Notes</h3>
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
