import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  FileText,
  AlignLeft,
  CheckCircle2,
  Check,
  Lightbulb,
  Loader2,
  Briefcase,
  Mic
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import ProcessingOverlay from '../components/ProcessingOverlay';
import SuccessOverlay from '../components/SuccessOverlay';
import CompressionProgressModal from '../components/CompressionProgressModal';
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

const TIPS = [
  "Include names of people mentioned (e.g., \"Alex will complete...\")",
  "Mention deadlines or timeframes explicitly (\"by Nov 15th\", \"this week\")",
  "Use keywords like \"urgent\", \"ASAP\", or \"critical\" for high-priority tasks",
  "Start each task on a new line for better detection",
  "Include meeting context (who was present, what was discussed)"
];

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

export default function AddNotePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Audio upload state
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [compressionStage, setCompressionStage] = useState<
    'loading' | 'preparing' | 'compressing' | 'finalizing' | 'complete' | 'uploading' | 'transcribing'
  >('loading');
  const [showCompressionModal, setShowCompressionModal] = useState(false);
  const [originalFileSize, setOriginalFileSize] = useState('');
  const [estimatedCompressedSize, setEstimatedCompressedSize] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAudioUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input for re-uploads
    e.target.value = '';

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/mp4', 'audio/m4a', 'audio/wav', 'audio/webm', 'audio/x-m4a', 'video/mp4'];
    const validExtensions = ['.mp3', '.m4a', '.wav', '.webm', '.mp4'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      addToast('Please upload a valid audio file (mp3, m4a, wav, webm, mp4)', 'error', 4000);
      return;
    }

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
          setCompressionStage(stage as any);
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

      if (noteError || !noteData) {
        throw new Error(`Failed to save note: ${noteError?.message || 'Unknown error'}`);
      }

      // BRANCHING LOGIC
      if (processingMode === 'brief') {
        // PATH B: Leadership Brief

        // Trigger n8n webhook
        const webhookUrl = 'https://n8n.srv1134430.hstgr.cloud/webhook/generate-summary';

        // We don't await this fetch to keep it non-blocking, or we can await if we want to ensure it started
        // For better UX, we'll fire and forget or await with a short timeout, but here we'll just fire it.
        // Actually, let's await it to catch immediate errors, but we won't wait for the full generation.
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ note_id: noteData.id })
        }).catch(err => console.error('Webhook trigger failed:', err));

        // Redirect immediately
        addToast('Drafting Leadership Brief...', 'success', 3000);
        navigate(`/note/${noteData.id}`, { state: { isSynthesizing: true } });
        return;
      }

      // PATH A: Grow Tasks (Existing Logic)
      // Process with edge function
      const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-ai-notes`;

      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          note_text: noteText.trim(),
          note_id: noteData.id,
          default_priority: 'Medium'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge function error:', errorText);
        throw new Error(`Processing failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Processing result:', result);

      const tasksCreatedCount = result.created || 0;
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

  const handleRedirect = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="
                flex items-center gap-2
                text-gray-600 hover:text-gray-900
                transition-colors duration-200
                group
              "
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </motion.button>


          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="
            text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4
            bg-gradient-to-r from-gray-900 to-gray-700
            bg-clip-text
          ">
            Add Meeting Notes
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-gray-600 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#6FA84C]" />
            Paste your notes below, and our AI will extract tasks for you
          </p>
        </motion.div>

        {/* Note Input Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className={`
            bg-white rounded-3xl overflow-hidden
            border-2 transition-all duration-300
            flex-1 flex flex-col
            ${isFocused
              ? 'border-[#6FA84C] shadow-xl shadow-green-500/10'
              : 'border-gray-100 shadow-lg'
            }
          `}
        >
          {/* Textarea */}
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
              min-h-[200px]
              text-base sm:text-lg leading-relaxed
              text-gray-900 placeholder:text-gray-400
              resize-none
              focus:outline-none
              font-normal
            "
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif'
            }}
            aria-label="Enter your meeting notes"
            aria-describedby="notes-description"
          />

          {/* Hidden file input for audio upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAudioUpload}
            accept=".mp3,.m4a,.wav,.webm,.mp4,audio/*"
            className="hidden"
            aria-label="Upload audio file for transcription"
          />

          <div id="notes-description" className="sr-only">
            Paste your meeting notes here. Include names, deadlines, and action items
            for best results. Minimum 50 characters required.
          </div>

          {/* Footer */}
          <div className="
            px-6 sm:px-8 py-5 sm:py-6
            bg-gradient-to-br from-gray-50 to-green-50/30
            border-t border-gray-100
            flex flex-col lg:flex-row lg:items-center justify-between flex-wrap
            gap-6 h-auto
          ">
            {/* Group A: Metadata */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-600 whitespace-nowrap">
              {/* Character count */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1.5 whitespace-nowrap"
              >
                <FileText className="w-4 h-4" />
                <span className={characterCount === 0 ? 'text-gray-400' : ''}>
                  {characterCount.toLocaleString()} characters
                </span>
              </motion.div>

              {/* Word count */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-1.5 whitespace-nowrap"
              >
                <AlignLeft className="w-4 h-4" />
                <span className={wordCount === 0 ? 'text-gray-400' : ''}>
                  {wordCount.toLocaleString()} words
                </span>
              </motion.div>

              {/* Estimated tasks */}
              {characterCount > 50 && estimatedTasks > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-lg font-medium"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>~{estimatedTasks} tasks detected</span>
                </motion.div>
              )}

              {/* Example button */}
              <button
                onClick={loadExample}
                className="
                  text-sm text-[#6FA84C] hover:text-[#2D5016]
                  font-medium transition-colors
                  flex items-center gap-1
                  whitespace-nowrap
                "
              >
                <Lightbulb className="w-4 h-4" />
                Try an example
              </button>
            </div>

            {/* Group B: Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 w-full lg:w-auto">

              {/* Upload Audio Button - make it more compact */}
              <motion.button
                whileHover={{ scale: isTranscribing ? 1 : 1.02 }}
                whileTap={{ scale: isTranscribing ? 1 : 0.98 }}
                onClick={() => fileInputRef.current?.click()}
                disabled={isTranscribing || isProcessing}
                className={`
                  flex items-center gap-2 px-3 py-2.5 rounded-xl
                  border-2 border-dashed transition-all duration-200
                  whitespace-nowrap text-sm
                  ${isTranscribing
                    ? 'border-[#6FA84C] bg-green-50 text-[#2D5016] cursor-wait'
                    : 'border-gray-300 hover:border-[#6FA84C] hover:bg-green-50/50 text-gray-600 hover:text-[#2D5016]'
                  }
                  ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isTranscribing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#6FA84C]" />
                    <span className="font-medium">Transcribing...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span className="font-medium">Upload Audio</span>
                  </>
                )}
              </motion.button>

              {/* Mode Switcher - reduce min-width */}
              <div className="w-auto min-w-[240px]">
                <div className="bg-gray-100 p-1 rounded-xl grid grid-cols-2 gap-1">
                  <button
                    onClick={() => setProcessingMode('tasks')}
                    className={`
                      flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${processingMode === 'tasks'
                        ? 'bg-[#1A3510] text-white shadow-md'
                        : 'bg-transparent text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    <Sparkles className={`w-4 h-4 ${processingMode === 'tasks' ? 'text-white' : 'text-gray-500'}`} />
                    <span>Tasks</span>
                  </button>
                  <button
                    onClick={() => setProcessingMode('brief')}
                    className={`
                      flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${processingMode === 'brief'
                        ? 'bg-[#1A3510] text-white shadow-md'
                        : 'bg-transparent text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    <Briefcase className={`w-4 h-4 ${processingMode === 'brief' ? 'text-white' : 'text-gray-500'}`} />
                    <span>Brief</span>
                  </button>
                </div>
              </div>

              {/* Process button - slightly more compact */}
              <motion.button
                whileHover={{ scale: isValid ? 1.02 : 1 }}
                whileTap={{ scale: isValid ? 0.98 : 1 }}
                disabled={!isValid || isProcessing || isTranscribing}
                onClick={handleProcess}
                className={`
                  px-5 py-2.5 rounded-xl
                  font-semibold text-sm
                  transition-all duration-200
                  flex items-center gap-2
                  whitespace-nowrap
                  ${isValid && !isTranscribing
                    ? 'bg-gradient-to-br from-[#355E1F] to-[#6FA84C] hover:shadow-lg hover:shadow-green-900/20 text-white'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {processingMode === 'tasks' ? <Sparkles className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                    <span>Process</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Tips Section - Hidden when focused */}
        {!isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-8"
          >
            <div className="
              p-6 sm:p-8
              bg-gradient-to-br from-blue-50 to-indigo-50
              rounded-2xl border border-blue-100
            ">
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="
                  w-10 h-10 rounded-xl
                  bg-gradient-to-br from-blue-500 to-indigo-600
                  flex items-center justify-center
                  flex-shrink-0
                ">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Tips for better results
                  </h3>
                  <p className="text-sm text-gray-600">
                    Help our AI extract tasks more accurately
                  </p>
                </div>
              </div>

              {/* Tips list */}
              <div className="space-y-3 ml-0 sm:ml-13">
                {TIPS.map((tip, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + (index * 0.1) }}
                    className="flex items-start gap-3"
                  >
                    <div className="
                      w-6 h-6 rounded-full
                      bg-gradient-to-br from-green-400 to-emerald-500
                      flex items-center justify-center
                      flex-shrink-0 mt-0.5
                    ">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {tip}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Processing Overlay */}
      <ProcessingOverlay
        isVisible={isProcessing}
        currentStep={currentStep}
        onCancel={handleCancel}
        showCancel={showCancel}
      />

      {/* Success Overlay */}
      <SuccessOverlay
        isVisible={showSuccess}
        taskCount={taskCount}
        countdown={countdown}
        onRedirect={handleRedirect}
      />

      {/* Compression Progress Modal */}
      <CompressionProgressModal
        isVisible={showCompressionModal}
        progress={compressionProgress}
        stage={compressionStage}
        fileName={audioFileName || ''}
        originalSize={originalFileSize}
        estimatedSize={estimatedCompressedSize}
      />
    </div>
  );
}
