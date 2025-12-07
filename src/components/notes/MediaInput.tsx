import React from 'react';
import { Type, UploadCloud, Mic, Camera, Loader2, Square } from 'lucide-react';

interface MediaInputProps {
    inputMode: 'text' | 'audio' | 'record' | 'photo';
    setInputMode: (mode: 'text' | 'audio' | 'record' | 'photo') => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleAudioUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isTranscribing: boolean;
    // Recording
    isRecording?: boolean;
    recordingDuration?: number;
    startRecording?: () => void;
    stopRecording?: () => void;
}

const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function MediaInput({
    inputMode,
    setInputMode,
    fileInputRef,
    handleAudioUpload,
    isTranscribing,
    isRecording = false,
    recordingDuration = 0,
    startRecording,
    stopRecording
}: MediaInputProps) {
    return (
        <>
            {/* Input Method Toolbar */}
            <div className="
        flex items-center gap-1 p-2
        border-b border-gray-100
        bg-gray-50/50
        overflow-x-auto no-scrollbar
      ">
                {[
                    { id: 'text', icon: Type, label: 'Text' },
                    { id: 'audio', icon: UploadCloud, label: 'Upload Audio' },
                    { id: 'record', icon: Mic, label: 'Record' },
                    { id: 'photo', icon: Camera, label: 'Photo' }
                ].map((mode) => (
                    <button
                        key={mode.id}
                        onClick={() => setInputMode(mode.id as any)}
                        className={`
              flex items-center gap-2 px-4 py-2 rounded-xl
              text-sm font-medium whitespace-nowrap
              transition-all duration-200
              ${inputMode === mode.id
                                ? 'bg-white text-[#2D5016] shadow-sm ring-1 ring-black/5'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }
            `}
                    >
                        <mode.icon className="w-4 h-4" />
                        {mode.label}
                    </button>
                ))}
            </div>

            {/* Audio Upload Mode */}
            {inputMode === 'audio' && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/30">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`
              w-full max-w-md aspect-video rounded-3xl
              border-3 border-dashed
              flex flex-col items-center justify-center gap-4
              cursor-pointer transition-all duration-300
              group
              ${isTranscribing
                                ? 'border-[#6FA84C] bg-green-50/50'
                                : 'border-gray-200 hover:border-[#6FA84C] hover:bg-white'
                            }
            `}
                    >
                        {isTranscribing ? (
                            <>
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-[#6FA84C] animate-spin" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-[#2D5016]">Transcribing Audio...</h3>
                                    <p className="text-sm text-gray-500 mt-1">This may take a moment</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="
                  w-16 h-16 rounded-full bg-white shadow-sm 
                  flex items-center justify-center
                  group-hover:scale-110 transition-transform duration-300
                ">
                                    <UploadCloud className="w-8 h-8 text-[#6FA84C]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Click to Upload Audio</h3>
                                    <p className="text-sm text-gray-500 mt-1">MP3, M4A, WAV (up to 2 hours)</p>
                                </div>
                                <button className="
                  mt-2 px-4 py-2 rounded-full
                  bg-[#6FA84C] text-white text-sm font-medium
                  opacity-0 group-hover:opacity-100 transition-opacity duration-200
                  translate-y-2 group-hover:translate-y-0
                ">
                                    Select File
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Recording Mode */}
            {inputMode === 'record' && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/30 relative overflow-hidden">
                    {/* Background pulsing ring when recording */}
                    {isRecording && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-64 h-64 rounded-full bg-red-500/10 animate-ping opacity-75" />
                        </div>
                    )}

                    <div className="relative z-10 flex flex-col items-center justify-center gap-6">
                        {/* Timer Display */}
                        {isRecording && (
                            <div className="text-4xl font-mono font-bold text-gray-900 tabular-nums">
                                {formatDuration(recordingDuration)}
                            </div>
                        )}

                        {/* Action Button */}
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`
                                w-24 h-24 rounded-full flex items-center justify-center
                                transition-all duration-300 shadow-xl
                                ${isRecording
                                    ? 'bg-white border-4 border-red-500 hover:bg-red-50'
                                    : 'bg-red-500 hover:bg-red-600 hover:scale-105'
                                }
                            `}
                        >
                            {isRecording ? (
                                <Square className="w-8 h-8 text-red-500 fill-current rounded-sm" />
                            ) : (
                                <Mic className="w-10 h-10 text-white" />
                            )}
                        </button>

                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {isRecording ? 'Listening...' : 'Tap to Record'}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {isRecording
                                    ? 'Speak clearly, we are capturing your thoughts'
                                    : 'We will transcribe your voice into text'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Photo Mode (Still Coming Soon) */}
            {inputMode === 'photo' && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/30">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                        <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Coming Soon</h3>
                    <p className="text-gray-500 max-w-xs mx-auto mt-2">
                        Photo capture and OCR will be available in the next update.
                    </p>
                </div>
            )}

            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleAudioUpload}
                accept=".mp3,.m4a,.wav,.webm,.mp4,audio/*"
                className="hidden"
            />
        </>
    );
}
