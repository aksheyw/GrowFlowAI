/**
 * Text analysis utilities for the Note Input page
 * Provides real-time feedback on user input
 */

/**
 * Get character count (excluding leading/trailing whitespace)
 */
export function getCharacterCount(text: string): number {
    return text.trim().length;
}

/**
 * Get word count
 */
export function getWordCount(text: string): number {
    const trimmed = text.trim();
    if (trimmed.length === 0) return 0;

    // Split on whitespace and filter out empty strings
    const words = trimmed.split(/\s+/).filter(word => word.length > 0);
    return words.length;
}

/**
 * Estimate task count based on action words in the text
 * Uses a heuristic that counts action-oriented keywords
 */
export function estimateTaskCount(text: string): number {
    const characterCount = getCharacterCount(text);

    // Need minimum 50 characters to estimate
    if (characterCount < 50) return 0;

    // Action words that typically indicate tasks
    const actionWords = [
        'will', 'need', 'should', 'must', 'working', 'complete',
        'finish', 'deliver', 'prepare', 'review', 'schedule',
        'create', 'update', 'send', 'discuss'
    ];

    const lowerText = text.toLowerCase();
    let count = 0;

    // Count occurrences of each action word (as whole words)
    actionWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        const matches = lowerText.match(regex);
        if (matches) {
            count += matches.length;
        }
    });

    // Return between 1-10 tasks
    return Math.max(1, Math.min(count, 10));
}

/**
 * Check if note text is valid for processing
 * Requires minimum 50 characters
 */
export function isValidNoteText(text: string): boolean {
    return getCharacterCount(text) >= 50;
}
