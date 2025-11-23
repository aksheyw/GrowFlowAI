import { useState } from 'react';

export interface SummaryData {
    tldr: string;
    decisions: string[];
    actionItems: string[];
    emailFormat: string;
    chatFormat: string;
    documentFormat: string;
}

export interface SummaryState {
    isOpen: boolean;
    isLoading: boolean;
    isRegenerating: boolean;
    format: 'email' | 'chat' | 'document';
    summaryData: SummaryData | null;
    error: string | null;
}

export const useSummaryGenerator = (
    noteId: string,
    contextData?: {
        content: string;
        title: string;
        userId?: string;
        date?: string;
    }
) => {
    const [state, setState] = useState<SummaryState>({
        isOpen: false,
        isLoading: false,
        isRegenerating: false,
        format: 'email',
        summaryData: null,
        error: null
    });

    const generateSummary = async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        console.log('Generating summary for note:', noteId);

        const startTime = Date.now();

        try {
            const response = await fetch('https://n8n.srv1134430.hstgr.cloud/webhook/generate-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    noteId,
                    ...contextData
                })
            });

            if (!response.ok) throw new Error('Failed to generate summary');

            const result = await response.json();

            // Ensure minimum 3s loading time
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime < 3000) {
                await new Promise(resolve => setTimeout(resolve, 3000 - elapsedTime));
            }

            if (result.status === 'success' && result.data) {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    summaryData: result.data
                }));
            } else {
                throw new Error('Invalid response format');
            }

        } catch (error) {
            console.error('Summary generation error:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to generate summary. Please try again.'
            }));
        }
    };

    const regenerate = async () => {
        setState(prev => ({ ...prev, isRegenerating: true }));
        await generateSummary();
        setState(prev => ({ ...prev, isRegenerating: false }));
    };

    return { ...state, generateSummary, regenerate, setState };
};
