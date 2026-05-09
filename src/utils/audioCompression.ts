import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;
let ffmpegLoaded = false;

// Progress callback type
export type CompressionStage =
    | 'loading'
    | 'preparing'
    | 'compressing'
    | 'finalizing'
    | 'complete'
    | 'uploading'
    | 'transcribing';

type ProgressCallback = (progress: number, stage: CompressionStage) => void;

// Initialize FFmpeg (lazy load)
async function initFFmpeg(onProgress?: ProgressCallback): Promise<FFmpeg> {
    if (ffmpeg && ffmpegLoaded) {
        return ffmpeg;
    }

    ffmpeg = new FFmpeg();

    // Set up progress handler
    ffmpeg.on('progress', ({ progress }) => {
        onProgress?.(Math.round(progress * 100), 'compressing');
    });

    onProgress?.(0, 'loading');

    // Load FFmpeg core from CDN
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

    try {
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        ffmpegLoaded = true;
        onProgress?.(100, 'loading');
        return ffmpeg;
    } catch (error) {
        console.error('Failed to load FFmpeg:', error);
        ffmpeg = null;
        ffmpegLoaded = false;
        throw new Error('Failed to initialize compression engine. Please check your internet connection or try a different browser.');
    }
}

// Compress audio file for transcription
export async function compressAudioForTranscription(
    file: File,
    onProgress?: ProgressCallback
): Promise<File> {
    const ffmpegInstance = await initFFmpeg(onProgress);

    // Get file extension
    const inputExtension = file.name.split('.').pop()?.toLowerCase() || 'mp3';
    const inputFileName = `input.${inputExtension}`;
    const outputFileName = 'output.mp3';

    onProgress?.(0, 'preparing');

    // Write input file to FFmpeg virtual filesystem
    await ffmpegInstance.writeFile(inputFileName, await fetchFile(file));

    onProgress?.(10, 'compressing');

    // Compress: 32kbps mono MP3 at 16kHz (optimized for speech/Whisper)
    await ffmpegInstance.exec([
        '-i', inputFileName,
        '-vn',                    // Remove video (if any)
        '-ac', '1',               // Mono audio
        '-ar', '16000',           // 16kHz sample rate (Whisper optimal)
        '-b:a', '32k',            // 32kbps bitrate (good for speech)
        '-codec:a', 'libmp3lame', // MP3 codec
        '-q:a', '9',              // Quality setting
        outputFileName
    ]);

    onProgress?.(90, 'finalizing');

    // Read the output file
    const data = await ffmpegInstance.readFile(outputFileName);

    // Clean up
    await ffmpegInstance.deleteFile(inputFileName);
    await ffmpegInstance.deleteFile(outputFileName);

    // Create new File object
    const compressedBlob = new Blob([data as BlobPart], { type: 'audio/mpeg' });
    const compressedFile = new File(
        [compressedBlob],
        file.name.replace(/\.[^/.]+$/, '_compressed.mp3'),
        { type: 'audio/mpeg' }
    );

    onProgress?.(100, 'complete');

    return compressedFile;
}

// Check if compression is needed
export function needsCompression(file: File): boolean {
    // Compress if file is larger than 20MB
    return file.size > 20 * 1024 * 1024;
}

// Get human-readable file size
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Estimate compression result
export function estimateCompressedSize(originalSize: number): number {
    // Rough estimate: 32kbps mono is ~75% smaller than typical 128kbps stereo
    return Math.round(originalSize * 0.25);
}
