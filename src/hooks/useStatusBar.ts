import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

export function useStatusBar() {
    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            // Set status bar style
            StatusBar.setStyle({ style: Style.Dark });

            // Set status bar background color (Android only)
            if (Capacitor.getPlatform() === 'android') {
                StatusBar.setBackgroundColor({ color: '#F9FAFB' });
            }
        }
    }, []);
}
