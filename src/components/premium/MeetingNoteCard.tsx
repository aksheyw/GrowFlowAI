import { motion } from 'framer-motion';
import { Calendar, FileText, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Note } from '../../lib/supabase';
import { formatDateShort } from '../../utils/meetingHelpers';

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
            <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 h-full flex flex-col"
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
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {taskCount} Tasks
                    </div>

                    {/* Processed Status */}
                    {note.processed ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                            <FileText className="w-3.5 h-3.5" />
                            Processed
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            Processing
                        </div>
                    )}
                </div>
            </motion.div>
        </Link>
    );
}
