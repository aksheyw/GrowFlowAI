import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import {
    getCharacterCount,
    getWordCount,
    estimateTaskCount,
    isValidNoteText
} from '../utils/textAnalysis';
import {
    compressAudioForTranscription,
    needsCompression,
    formatFileSize,
    estimateCompressedSize
} from '../utils/audioCompression';
import type { CompressionStage } from '../utils/audioCompression';

const EXAMPLE_NOTES = `Team standup meeting - Nov 19  
Attendees: Alex, Jordan, and myself

Key discussion points:
- Sprint planning for next week
- Dashboard redesign progress
- Authentication module status

Action items:
1. Alex will complete the user authentication module by Nov 25th - this is urgent and blocking other work
2. Jordan is working on the dashboard redesign, needs to have mockups ready by Nov 22nd
3. I need to schedule a code review session with the entire team, targeting Nov 21st
4. Alex should also update the API documentation once auth is complete

Next meeting: Nov 26th, same time`;

export const useNoteProcessing = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToast } = useToast();

    // Refs
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // UI State
    const [noteText, setNoteText] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [taskCount, setTaskCount] = useState(0);
    const [countdown, setCountdown] = useState(3);
    const [showCancel, setShowCancel] = useState(false);
    const [processingMode, setProcessingMode] = useState<'tasks' | 'brief'>('tasks');
    const [inputMode, setInputMode] = useState<'text' | 'audio' | 'record' | 'photo'>('text');

    // Audio upload state
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [audioFileName, setAudioFileName] = useState<string | null>(null);
    const [compressionProgress, setCompressionProgress] = useState(0);
    const [compressionStage, setCompressionStage] = useState<CompressionStage>('loading');
    const [showCompressionModal, setShowCompressionModal] = useState(false);
    const [originalFileSize, setOriginalFileSize] = useState('');
    const [estimatedCompressedSize, setEstimatedCompressedSize] = useState('');

    // Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);

    // Computed values
    const characterCount = useMemo(() => getCharacterCount(noteText), [noteText]);
    const wordCount = useMemo(() => getWordCount(noteText), [noteText]);
    const estimatedTasks = useMemo(() => estimateTaskCount(noteText), [noteText]);
    const isValid = useMemo(() => isValidNoteText(noteText) && !isProcessing, [noteText, isProcessing]);

    // Auto-focus textarea on mount
    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    // Step progression during processing
    useEffect(() => {
        if (!isProcessing) {
            setCurrentStep(0);
            return;
        }

        const stepDuration = 1500; // 1.5 seconds per step

        const interval = setInterval(() => {
            setCurrentStep(prev => {
                if (prev < 3) { // 4 steps total (0-3)
                    return prev + 1;
                }
                return prev;
            });
        }, stepDuration);

        return () => clearInterval(interval);
    }, [isProcessing]);

    // Show cancel button after 3 seconds
    useEffect(() => {
        if (!isProcessing) {
            setShowCancel(false);
            return;
        }

        const timer = setTimeout(() => {
            setShowCancel(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, [isProcessing]);

    // Success countdown and redirect
    useEffect(() => {
        if (!showSuccess) return;

        // Trigger confetti
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.5 },
            colors: ['#2D5016', '#6FA84C', '#A4D96C', '#4ADE80']
        });

        // Countdown timer
        let count = 3;
        setCountdown(count);

        const interval = setInterval(() => {
            count--;
            setCountdown(count);

            if (count === 0) {
                clearInterval(interval);
                navigate('/dashboard');
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [showSuccess, navigate]);

    // cleanup recording on unmount or tab switch
    useEffect(() => {
        return () => {
            if (recordingDuration > 0 || isRecording) {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                    mediaRecorderRef.current.stop();
                }
                if (timerRef.current) clearInterval(timerRef.current);
            }
        };
    }, []);

    // Also stop recording if input mode changes
    useEffect(() => {
        if (inputMode !== 'record' && isRecording) {
            stopRecording();
            addToast('Recording stopped due to mode switch', 'info', 3000);
        }
    }, [inputMode]);


    const processAudioFile = useCallback(async (file: File) => {
        // Set up state
        setAudioFileName(file.name);
        setOriginalFileSize(formatFileSize(file.size));
        setIsTranscribing(true);

        let fileToUpload = file;

        try {
            // Check if compression is needed (files > 20MB)
            if (needsCompression(file)) {
                setShowCompressionModal(true);
                setEstimatedCompressedSize(formatFileSize(estimateCompressedSize(file.size)));

                // Compress the file
                fileToUpload = await compressAudioForTranscription(file, (progress, stage) => {
                    setCompressionProgress(progress);
                    setCompressionStage(stage);
                });

                addToast(
                    `Compressed ${formatFileSize(file.size)} → ${formatFileSize(fileToUpload.size)}`,
                    'success',
                    3000
                );
            }

            // Final size check after compression
            const maxSize = 25 * 1024 * 1024;
            if (fileToUpload.size > maxSize) {
                throw new Error('File is still too large after compression. Please try a shorter recording.');
            }

            // Update stage for upload
            setCompressionStage('uploading');
            setCompressionProgress(0);

            // Upload to n8n webhook
            const formData = new FormData();
            formData.append('data', fileToUpload);

            // Show uploading progress (simulated since fetch doesn't give progress)
            const uploadProgressInterval = setInterval(() => {
                setCompressionProgress(prev => Math.min(prev + 10, 90));
            }, 500);

            const response = await fetch('https://n8n.srv1134430.hstgr.cloud/webhook/growflow-transcribe', {
                method: 'POST',
                body: formData,
            });

            clearInterval(uploadProgressInterval);

            // Update to transcribing stage
            setCompressionStage('transcribing');
            setCompressionProgress(95);

            const result = await response.json();

            if (result.success && result.text) {
                setCompressionProgress(100);
                setCompressionStage('complete');

                // Brief delay to show completion
                await new Promise(resolve => setTimeout(resolve, 500));

                // Success - populate textarea
                setNoteText(prevText => {
                    if (prevText.trim()) {
                        return prevText + '\n\n---\n\n' + result.text;
                    }
                    return result.text;
                });

                // Switch back to text mode to show the result
                setInputMode('text');

                addToast(`Audio transcribed successfully! 🎙️`, 'success', 4000);

                // Focus textarea for editing
                setTimeout(() => textareaRef.current?.focus(), 100);
            } else {
                // Handle specific errors
                if (result.error === 'FILE_TOO_LARGE') {
                    throw new Error('Audio file is too large. Please try a shorter recording.');
                } else if (result.error === 'TRANSCRIPTION_FAILED') {
                    throw new Error('Failed to transcribe audio. Please try a different file.');
                } else {
                    throw new Error(result.message || 'Failed to transcribe audio');
                }
            }
        } catch (error) {
            console.error('Audio upload error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to process audio';
            addToast(errorMessage, 'error', 5000);
        } finally {
            setIsTranscribing(false);
            setShowCompressionModal(false);
            setAudioFileName(null);
            setCompressionProgress(0);
        }
    }, [addToast]);

    const handleAudioUpload = useCallback(async (input: React.ChangeEvent<HTMLInputElement> | File) => {
        let file: File | undefined;

        if (input instanceof File) {
            file = input;
        } else if ('target' in input) {
            file = input.target.files?.[0];
            // Reset file input for re-uploads
            input.target.value = '';
        }

        if (!file) return;

        // Validate file type
        const validTypes = ['audio/mpeg', 'audio/mp4', 'audio/m4a', 'audio/wav', 'audio/webm', 'audio/x-m4a', 'video/mp4'];
        const validExtensions = ['.mp3', '.m4a', '.wav', '.webm', '.mp4'];
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

        // Check if type or extension matches
        const isValidType = validTypes.includes(file.type);
        const isValidExtension = validExtensions.includes(fileExtension);

        if (!isValidType && !isValidExtension) {
            addToast('Please upload a valid audio file (mp3, m4a, wav, webm, mp4)', 'error', 4000);
            return;
        }

        // Set transcribing state immediately for better UI feedback
        setIsTranscribing(true);

        await processAudioFile(file);
    }, [processAudioFile, addToast]);

    const handleImageUpload = useCallback(async (input: React.ChangeEvent<HTMLInputElement> | File) => {
        let file: File | undefined;

        if (input instanceof File) {
            file = input;
        } else if ('target' in input) {
            file = input.target.files?.[0];
            input.target.value = '';
        }

        if (!file) return;

        // Validate image
        if (!file.type.startsWith('image/')) {
            addToast('Please upload a valid image file', 'error', 4000);
            return;
        }

        setIsTranscribing(true);
        addToast('Analyzing image...', 'info', 2000);

        try {
            const formData = new FormData();
            formData.append('data', file);

            const response = await fetch('https://n8n.srv1134430.hstgr.cloud/webhook/growflow-vision', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to connect to Vision API');

            const result = await response.json();

            if (result.text) {
                setNoteText(prev => {
                    const separator = prev.trim() ? '\n\n---\n\n' : '';
                    return prev + separator + result.text;
                });
                setInputMode('text');
                addToast('Image transcribed successfully! 📸', 'success', 3000);
                setTimeout(() => textareaRef.current?.focus(), 500);
            } else {
                throw new Error('No text extraction result returned');
            }

        } catch (error) {
            console.error('Vision API error:', error);
            addToast('Failed to analyze image. Please try again.', 'error', 4000);
        } finally {
            setIsTranscribing(false);
        }
    }, [addToast, setInputMode]);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingDuration(0);

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error('Error accessing microphone:', err);
            addToast('Could not access microphone. Please check permissions.', 'error', 4000);
        }
    }, [addToast]);

    const stopRecording = useCallback(() => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;

        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());

        setIsRecording(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        // Wait for final data
        mediaRecorderRef.current.onstop = async () => {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            const file = new File([blob], `recording-${new Date().getTime()}.webm`, { type: 'audio/webm' });

            // Process the recorded file via the unified handler
            await handleAudioUpload(file);
        };
    }, [handleAudioUpload]);

    const handleProcess = useCallback(async () => {
        if (!user || !isValid) return;

        setIsProcessing(true);
        setCurrentStep(0);

        try {
            // First, save the note
            const { data: noteData, error: noteError } = await supabase
                .from('notes')
                .insert({
                    user_id: user.id,
                    content: noteText.trim(),
                    processed: false
                })
                .select()
                .single();
            if (noteError) throw noteError;

            // Call the Edge Function to extract tasks
            const { data: result, error: funcError } = await supabase.functions.invoke('process-ai-notes', {
                body: {
                    user_id: user.id,
                    note_text: noteText.trim(),
                    note_id: noteData.id
                }
            });

            if (funcError) {
                console.error('Edge function error:', funcError);
                throw new Error(`Processing failed: ${funcError.message}`);
            }

            console.log('Processing result:', result);

            const tasksCreatedCount = result?.created || 0;
            setTaskCount(tasksCreatedCount);

            // Show success screen
            setIsProcessing(false);
            setShowSuccess(true);
            setNoteText(''); // Clear the input

        } catch (err) {
            console.error('Error processing note:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';

            setIsProcessing(false);
            addToast(`Failed to process notes: ${errorMessage}`, 'error', 5000);
        }
    }, [user, isValid, noteText, addToast, processingMode, navigate]);

    const handleCancel = useCallback(() => {
        setIsProcessing(false);
        setCurrentStep(0);
        addToast('Processing cancelled', 'info', 2000);
    }, [addToast]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd/Ctrl + Enter to process
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                if (isValid && !isProcessing) {
                    handleProcess();
                }
            }

            // Escape to cancel processing
            if (e.key === 'Escape' && isProcessing && showCancel) {
                handleCancel();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isValid, isProcessing, showCancel, handleProcess, handleCancel]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNoteText(e.target.value);
    };

    const handlePaste = () => {
        // Show brief toast notification after paste
        setTimeout(() => {
            if (noteText.length > 100) {
                addToast('Notes pasted! 📋 Review and click "Process with AI" when ready', 'success', 3000);
            }
        }, 100);
    };

    const loadExample = () => {
        setNoteText(EXAMPLE_NOTES);
        textareaRef.current?.focus();
        addToast('Example notes loaded! Feel free to edit and try processing.', 'info', 3000);
    };

    return {
        // State
        noteText,
        setNoteText,
        isFocused,
        setIsFocused,
        isProcessing,
        showSuccess,
        currentStep,
        taskCount,
        countdown,
        showCancel,
        processingMode,
        setProcessingMode,
        inputMode,
        setInputMode,

        // Audio State
        isTranscribing,
        audioFileName,
        compressionProgress,
        compressionStage,
        showCompressionModal,
        setShowCompressionModal,
        originalFileSize,
        estimatedCompressedSize,

        // Recording
        isRecording,
        recordingDuration,
        startRecording,
        stopRecording,

        // Computed
        characterCount,
        wordCount,
        estimatedTasks,
        isValid,

        // Refs
        textareaRef,
        fileInputRef,

        // Handlers
        handleTextChange,
        handlePaste,
        handleAudioUpload,
        handleImageUpload,
        handleProcess,
        handleCancel,
        loadExample
    };
};
