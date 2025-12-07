import React from 'react';

interface NoteEditorProps {
    noteText: string;
    handleTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handlePaste: () => void;
    setIsFocused: (focused: boolean) => void;
    textareaRef: React.RefObject<HTMLTextAreaElement>;
    isVisible: boolean;
}

export default function NoteEditor({
    noteText,
    handleTextChange,
    handlePaste,
    setIsFocused,
    textareaRef,
    isVisible
}: NoteEditorProps) {
    return (
        <div className={`flex-1 flex flex-col ${isVisible ? 'block' : 'hidden'}`}>
            <label htmlFor="meeting-notes" className="sr-only">
                Meeting notes
            </label>
            <textarea
                ref={textareaRef}
                id="meeting-notes"
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
                className="
          w-full p-6 sm:p-8
          flex-1
          text-base sm:text-lg leading-relaxed
          text-gray-900 placeholder:text-gray-400
          resize-none
          focus:outline-none
          font-normal
          bg-transparent
        "
                style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif'
                }}
            />

        </div>
    );
}
