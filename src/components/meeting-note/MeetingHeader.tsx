import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
    FileText,
    Calendar,
    Users,
    CheckSquare,
    Clock,
    Edit2
} from 'lucide-react';
import { Note } from '../../lib/supabase';
import { formatDateLong, formatTimeAgo } from '../../utils/meetingHelpers';

interface MeetingHeaderProps {
    note: Note;
    taskCount: number;
    isEditingTitle: boolean;
    editedTitle: string;
    setEditedTitle: (title: string) => void;
    setIsEditingTitle: (isEditing: boolean) => void;
    onTitleSave: () => void;
    titleInputRef: React.RefObject<HTMLInputElement>;
}

export default function MeetingHeader({
    note,
    taskCount,
    isEditingTitle,
    editedTitle,
    setEditedTitle,
    setIsEditingTitle,
    onTitleSave,
    titleInputRef
}: MeetingHeaderProps) {
    return (
        <Card
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-8 sm:p-12 shadow-xl relative overflow-hidden border-gray-100"
        >
            {/* Background gradient */}
            <div className="
            absolute inset-0
            bg-gradient-to-br from-blue-50/50 to-indigo-50/50
            pointer-events-none
          " />

            {/* Content */}
            <div className="relative">
                {/* Meeting icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="
                w-20 h-20 mx-auto mb-6
                bg-gradient-to-br from-blue-500 to-indigo-600
                rounded-3xl
                flex items-center justify-center
                shadow-lg shadow-blue-500/30
              "
                >
                    <FileText className="w-10 h-10 text-white" />
                </motion.div>

                {/* Title - Editable */}
                {isEditingTitle ? (
                    <input
                        ref={titleInputRef}
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        onBlur={onTitleSave}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') onTitleSave();
                            if (e.key === 'Escape') {
                                setIsEditingTitle(false);
                                setEditedTitle(note.meeting_title || 'Meeting Notes');
                            }
                        }}
                        className="
                  w-full
                  text-3xl sm:text-4xl font-bold
                  text-gray-900 text-center
                  border-2 border-blue-500
                  rounded-xl px-4 py-2
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20
                  transition-all duration-200
                "
                        autoFocus
                    />
                ) : (
                    <h1
                        onClick={() => setIsEditingTitle(true)}
                        className="
                  text-3xl sm:text-4xl font-bold text-gray-900
                  text-center mb-4
                  cursor-pointer
                  hover:text-blue-600
                  transition-colors duration-200
                  group
                "
                    >
                        {note.meeting_title || 'Meeting Notes'}
                        <Edit2 className="
                  inline-block w-6 h-6 ml-3 
                  text-gray-400 opacity-0 
                  group-hover:opacity-100
                  transition-opacity duration-200
                " />
                    </h1>
                )}

                {/* Metadata row */}
                <div className="
              flex flex-wrap items-center justify-center gap-6
              text-base text-gray-600 mb-6
            ">
                    {/* Date */}
                    {note.meeting_date && (
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <span className="font-medium">
                                {formatDateLong(note.meeting_date)}
                            </span>
                        </div>
                    )}

                    {/* Participants */}
                    {note.meeting_participants && note.meeting_participants.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            <span className="font-medium">
                                {note.meeting_participants.length} {note.meeting_participants.length === 1 ? 'person' : 'people'}
                            </span>
                        </div>
                    )}

                    {/* Task count */}
                    <div className="flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">
                            {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
                        </span>
                    </div>

                    {/* Created timestamp */}
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-500">
                            Created {formatTimeAgo(note.created_at)}
                        </span>
                    </div>
                </div>

                {/* Participants list */}
                {note.meeting_participants && note.meeting_participants.length > 0 && (
                    <div className="
                flex flex-wrap items-center justify-center gap-3
              ">
                        {note.meeting_participants.map((participant, index) => (
                            <Badge
                                key={index}
                                variant="neutral"
                                className="px-4 py-2 bg-white/80 backdrop-blur-sm border-blue-200 gap-2"
                            >
                                <div className="
                      w-8 h-8 rounded-full
                      bg-gradient-to-br from-blue-400 to-indigo-500
                      flex items-center justify-center
                      text-white font-semibold text-sm
                    ">
                                    {participant.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {participant}
                                </span>
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
}
