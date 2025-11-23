import { motion } from 'framer-motion';
import { Mail, MessageSquare, FileText } from 'lucide-react';

type Format = 'email' | 'chat' | 'document';

interface FormatSelectorProps {
    currentFormat: Format;
    onFormatChange: (format: Format) => void;
}

export default function FormatSelector({ currentFormat, onFormatChange }: FormatSelectorProps) {
    const formats: { id: Format; label: string; icon: any }[] = [
        { id: 'email', label: 'Email', icon: Mail },
        { id: 'chat', label: 'Chat', icon: MessageSquare },
        { id: 'document', label: 'Document', icon: FileText }
    ];

    return (
        <div className="bg-gray-100 p-1 rounded-xl flex items-center relative">
            {formats.map((format) => {
                const isActive = currentFormat === format.id;
                return (
                    <button
                        key={format.id}
                        onClick={() => onFormatChange(format.id)}
                        className={`
                            relative flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-colors z-10
                            ${isActive ? 'text-white' : 'text-gray-600 hover:text-gray-900'}
                        `}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeIndicator"
                                className="absolute inset-0 bg-purple-600 rounded-lg shadow-sm"
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <format.icon className="w-4 h-4" />
                            {format.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
