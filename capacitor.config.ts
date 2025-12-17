import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.growflow.app',
    appName: 'GrowFlow',
    webDir: 'dist',
    server: {
        url: 'https://grow-flow-ai.vercel.app',
        cleartext: true,
        androidScheme: 'https'
    },
    plugins: {
        StatusBar: {
            style: 'dark',
            backgroundColor: '#F9FAFB'
        },
        SplashScreen: {
            launchShowDuration: 2000,
            launchAutoHide: true,
            backgroundColor: '#F9FAFB',
            androidSplashResourceName: 'splash',
            androidScaleType: 'CENTER_CROP',
            showSpinner: false,
            splashFullScreen: true,
            splashImmersive: true
        },
        Keyboard: {
            resize: 'body',
            resizeOnFullScreen: true
        }
    },
    android: {
        allowMixedContent: false,
        captureInput: true,
        webContentsDebuggingEnabled: false // Set true for debugging
    }
};

export default config;