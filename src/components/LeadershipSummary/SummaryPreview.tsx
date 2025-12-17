import { useMemo } from 'react';
import { SummaryData } from './hooks/useSummaryGenerator';

interface SummaryPreviewProps {
    data: SummaryData;
    format: 'email' | 'chat' | 'document';
}

export default function SummaryPreview({ data, format }: SummaryPreviewProps) {
    const formattedContent = useMemo(() => {
        switch (format) {
            case 'email':
                return data.emailFormat;
            case 'chat':
                return data.chatFormat;
            case 'document':
                return data.documentFormat;
        }
    }, [data, format]);

    return (
        <div className="bg-white dark:bg-ios-surface-dark border border-gray-200 dark:border-ios-separator-dark rounded-xl p-6 h-[400px] overflow-y-auto shadow-sm font-mono text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            {formattedContent}
        </div>
    );
}
