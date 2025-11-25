import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
    AlignLeft,
    Copy,
    Check,
    FileText
} from 'lucide-react';
import { Note } from '../../lib/supabase';

interface MeetingContentProps {
    note: Note;
    copied: boolean;
    onCopyNotes: () => void;
}

export default function MeetingContent({ note, copied, onCopyNotes }: MeetingContentProps) {
    return (
        <Card
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="p-6 sm:p-8 border-gray-100 shadow-sm"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <AlignLeft className="w-5 h-5 text-[#6FA84C]" />
                    Original Notes
                </h2>

                {/* Copy button */}
                <Button
                    onClick={onCopyNotes}
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                >
                    {copied ? (
                        <>
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-green-600">Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-4 h-4" />
                            <span>Copy</span>
                        </>
                    )}
                </Button>
            </div>

            {/* Notes content */}
            <div className="
                p-6 bg-gray-50 rounded-xl
                border border-gray-200
              ">
                <pre className="
                  font-mono text-sm text-gray-800
                  whitespace-pre-wrap leading-relaxed
                  overflow-x-auto
                ">
                    {note.content}
                </pre>
            </div>

            {/* Character count */}
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {note.content.length.toLocaleString()} characters
                </span>
                <span className="flex items-center gap-1">
                    <AlignLeft className="w-3 h-3" />
                    {note.content.split(/\s+/).length.toLocaleString()} words
                </span>
            </div>
        </Card>
    );
}
