import React from 'react';
import { motion } from 'framer-motion';
import { Maximize2, Minimize2 } from 'lucide-react';

interface NoteEditorProps {
    noteText: string;
    handleTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handlePaste: () => void;
    setIsFocused: (focused: boolean) => void;
    textareaRef: React.RefObject<HTMLTextAreaElement>;
    isVisible: boolean;
    isExpanded?: boolean;
    setIsExpanded?: (expanded: boolean) => void;
}

export default function NoteEditor({
    noteText,
    handleTextChange,
    handlePaste,
    setIsFocused,
    textareaRef,
    isVisible,
    isExpanded = false,
    setIsExpanded
}: NoteEditorProps) {
    return (
        <motion.div
            layout
            initial={false}
            animate={{
                height: isExpanded ? '80vh' : 'auto',
                minHeight: isExpanded ? '600px' : '300px'
            }}
            className={`flex-1 flex flex-col relative transition-colors duration-300 ${isVisible ? 'flex' : 'hidden'}`}
        >
            {/* Focus Mode Toggle */}
            <div className="absolute top-4 right-4 z-50">
                {setIsExpanded && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="
                            p-2 rounded-xl
                            text-green-600 bg-green-50 hover:bg-green-100
                            transition-all duration-200 shadow-sm
                        "
                        title={isExpanded ? "Exit Focus Mode" : "Enter Focus Mode"}
                    >
                        {isExpanded ? (
                            <Minimize2 className="w-5 h-5" />
                        ) : (
                            <Maximize2 className="w-5 h-5" />
                        )}
                    </button>
                )}
            </div>

            <label htmlFor="meeting-notes" className="sr-only">
                Meeting notes
            </label>
            <textarea
                ref={textareaRef}
                id="meeting-notes"
                name="meeting_notes_content" // Specific name to avoid username detection
                autoComplete="new-password"  // Prevents credential autofill suggestions
                inputMode="text"             // Hint for keyboard to show text mode
                data-form-type="other"       // Hint for password managers
                data-1p-ignore="true"        // 1Password ignore
                data-lpignore="true"         // LastPass ignore
                value={noteText}
                onChange={handleTextChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onPaste={handlePaste}
                placeholder="Paste your meeting notes here...

Example:
Team standup with Alex and Jordan. Discussed sprint priorities for this week.

Alex will complete the user authentication module by Nov 12th - this is urgent.

Jordan is working on the dashboard redesign, mockups due Nov 15th.

I need to schedule a code review session with the team, probably by end of week."
                className={`
                    w-full p-6 sm:p-8
                    flex-1
                    text-base sm:text-lg leading-relaxed
                    text-gray-900 placeholder:text-gray-400
                    resize-none
                    focus:outline-none
                    font-normal
                    bg-transparent
                    transition-all duration-300
                    ${isExpanded ? 'h-full' : ''}
                `}
                style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif'
                }}
            />

        </motion.div>
    );
}
