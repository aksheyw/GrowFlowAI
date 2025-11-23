import { Calendar, FileText, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Note } from '../../lib/supabase';
import { formatDateShort } from '../../utils/meetingHelpers';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface MeetingNoteCardProps {
    note: Note;
    taskCount?: number;
}

export default function MeetingNoteCard({ note, taskCount = 0 }: MeetingNoteCardProps) {
    // Helper function to clean and parse summary text
    const cleanSummary = (text: string): string => {
        if (!text) return '';

        // Strip markdown code fences
        let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // Try to parse as JSON
        try {
            const parsed = JSON.parse(cleaned);
            // If it's an object, extract summary or tldr
            if (typeof parsed === 'object' && parsed !== null) {
                if (parsed.summary) {
                    cleaned = parsed.summary;
                } else if (parsed.tldr) {
                    cleaned = parsed.tldr;
                }
            }
        } catch {
            // If parsing fails, use the cleaned text as-is
        }

        // Truncate to 120 characters
        if (cleaned.length > 120) {
            return cleaned.substring(0, 120) + '...';
        }

        return cleaned;
    };

    return (
        <Link to={`/note/${note.id}`} className="block h-full">
            <Card
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="p-5 hover:shadow-lg transition-all duration-200 h-full flex flex-col rounded-xl border-gray-100"
            >
                {/* Header: Icon + Date */}
                <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                        {formatDateShort(note.meeting_date || note.created_at)}
                    </span>
                </div>

                {/* Content: Title */}
                <div className="flex-1 mb-4">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors">
                        {note.meeting_title || 'Untitled Meeting'}
                    </h3>
                    {note.meeting_summary && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                            {cleanSummary(note.meeting_summary)}
                        </p>
                    )}
                </div>

                {/* Footer: Badges */}
                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-50">
                    {/* Task Count Badge */}
                    <Badge variant="success" className="rounded-full px-2.5 py-1 text-xs font-medium gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {taskCount} Tasks
                    </Badge>

                    {/* Processed Status */}
                    {note.processed ? (
                        <Badge variant="info" className="rounded-full px-2.5 py-1 text-xs font-medium gap-1.5">
                            <FileText className="w-3.5 h-3.5" />
                            Processed
                        </Badge>
                    ) : (
                        <Badge variant="warning" className="rounded-full px-2.5 py-1 text-xs font-medium gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Processing
                        </Badge>
                    )}
                </div>
            </Card>
        </Link>
    );
}
