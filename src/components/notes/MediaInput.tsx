import React from 'react';
import { Type, UploadCloud, Mic, Camera, Loader2, Square } from 'lucide-react';

interface MediaInputProps {
    inputMode: 'text' | 'audio' | 'record' | 'photo';
    setInputMode: (mode: 'text' | 'audio' | 'record' | 'photo') => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleAudioUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
    handleImageUpload,
    isTranscribing,
    isRecording = false,
    recordingDuration = 0,
    startRecording,
    stopRecording
}: MediaInputProps) {
    const photoInputRef = React.useRef<HTMLInputElement>(null);
    const cameraInputRef = React.useRef<HTMLInputElement>(null);

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

            {/* Photo Mode */}
            {inputMode === 'photo' && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/30">
                    <div className={`
                        w-full max-w-md aspect-video rounded-3xl
                        border-3 border-dashed border-gray-200
                        flex flex-col items-center justify-center gap-6
                        transition-all duration-300
                        ${isTranscribing ? 'bg-green-50/50 border-[#6FA84C]' : 'bg-transparent'}
                    `}>
                        {isTranscribing ? (
                            <>
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-[#6FA84C] animate-spin" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-[#2D5016]">Analyzing Image...</h3>
                                    <p className="text-sm text-gray-500 mt-1">Extracting text from your photo</p>
                                </div>
                            </>
                        ) : (
                            <div className="flex gap-4">
                                {/* Take Photo Button */}
                                <div
                                    onClick={() => cameraInputRef.current?.click()}
                                    className="
                                        flex flex-col items-center justify-center gap-3
                                        w-32 h-32 rounded-2xl bg-white shadow-sm border border-gray-100
                                        cursor-pointer hover:border-[#6FA84C] hover:shadow-md transition-all
                                        group
                                    "
                                >
                                    <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-green-50 flex items-center justify-center transition-colors">
                                        <Camera className="w-6 h-6 text-gray-600 group-hover:text-[#6FA84C]" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#2D5016]">Take Photo</span>
                                </div>

                                {/* Upload Image Button */}
                                <div
                                    onClick={() => photoInputRef.current?.click()}
                                    className="
                                        flex flex-col items-center justify-center gap-3
                                        w-32 h-32 rounded-2xl bg-white shadow-sm border border-gray-100
                                        cursor-pointer hover:border-[#6FA84C] hover:shadow-md transition-all
                                        group
                                    "
                                >
                                    <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-green-50 flex items-center justify-center transition-colors">
                                        <UploadCloud className="w-6 h-6 text-gray-600 group-hover:text-[#6FA84C]" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#2D5016]">Upload Image</span>
                                </div>
                            </div>
                        )}

                        {!isTranscribing && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Capture Text</h3>
                                <p className="text-sm text-gray-500 mt-1">Take a photo or upload an image</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Hidden Photo Inputs */}
            <input
                type="file"
                ref={cameraInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                capture="environment"
                className="hidden"
            />
            <input
                type="file"
                ref={photoInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
            />

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
