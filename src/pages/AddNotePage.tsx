import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNoteProcessing } from '../hooks/useNoteProcessing';
import NoteEditor from '../components/notes/NoteEditor';
import MediaInput from '../components/notes/MediaInput';
import NoteActionBar from '../components/notes/NoteActionBar';
import NotesTips from '../components/notes/NotesTips';
import ProcessingOverlay from '../components/ProcessingOverlay';
import SuccessOverlay from '../components/SuccessOverlay';
import CompressionProgressModal from '../components/CompressionProgressModal';
import { useNavigate } from 'react-router-dom';

export default function AddNotePage() {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    // State
    noteText,
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
  } = useNoteProcessing();

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-ios-bg-dark h-[100dvh] z-0">

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-white/80 dark:bg-ios-card-dark/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-ios-separator-dark shadow-sm pt-[env(safe-area-inset-top)] transition-all">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="
                flex items-center gap-2
                text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
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
      <main className="
        absolute inset-0 z-0
        overflow-y-auto overscroll-none
        w-full
        pt-[calc(4rem+env(safe-area-inset-top)+1rem)] pb-32
      ">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Overlays - Fixed on top of everything */}
          {isProcessing && !showSuccess && (
            <ProcessingOverlay
              isVisible={true}
              currentStep={currentStep}
              showCancel={showCancel}
              onCancel={handleCancel}
            />
          )}

          {showSuccess && (
            <SuccessOverlay
              isVisible={true}
              taskCount={taskCount}
              countdown={countdown}
              onRedirect={() => navigate('/dashboard')}
            />
          )}

          <CompressionProgressModal
            isVisible={showCompressionModal}
            progress={compressionProgress}
            stage={compressionStage}
            fileName={audioFileName || 'Audio File'}
            originalSize={originalFileSize}
            estimatedSize={estimatedCompressedSize}
          />

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-8"
          >
            <h1 className="
            text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4
            bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300
            bg-clip-text
          ">
              Add Meeting Notes
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 flex items-center gap-2">
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
            bg-white dark:bg-ios-card-dark rounded-3xl overflow-hidden
            border-2 transition-all duration-300
            flex-1 flex flex-col
            ${isFocused && inputMode === 'text'
                ? 'border-[#6FA84C] shadow-xl shadow-green-500/10'
                : 'border-gray-100 dark:border-ios-separator-dark shadow-lg'
              }
          `}
          >
            <MediaInput
              inputMode={inputMode}
              setInputMode={setInputMode}
              fileInputRef={fileInputRef}
              handleAudioUpload={handleAudioUpload}
              handleImageUpload={handleImageUpload}
              isTranscribing={isTranscribing}
              isRecording={isRecording}
              recordingDuration={recordingDuration}
              startRecording={startRecording}
              stopRecording={stopRecording}
            />

            <NoteEditor
              noteText={noteText}
              handleTextChange={handleTextChange}
              handlePaste={handlePaste}
              setIsFocused={setIsFocused}
              textareaRef={textareaRef}
              isVisible={inputMode === 'text'}
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
            />

            <NoteActionBar
              stats={{ characterCount, wordCount, estimatedTasks }}
              loadExample={loadExample}
              processingMode={processingMode}
              setProcessingMode={setProcessingMode}
              handleProcess={handleProcess}
              isValid={isValid}
              isProcessing={isProcessing}
              isTranscribing={isTranscribing}
            />
          </motion.div>

          {/* Tips Section */}
          <NotesTips isVisible={!isFocused && !isExpanded && noteText.length === 0} />
        </div>
      </main>
    </div>
  );
}
