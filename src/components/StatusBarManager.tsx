import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useTheme } from '../contexts/ThemeContext';

export default function StatusBarManager() {
    const location = useLocation();
    const { isDark } = useTheme();

    const isAuthPage = ['/login', '/signup', '/reset-password'].includes(location.pathname);

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        const updateStatusBar = async () => {
            try {
                if (isAuthPage) {
                    // Force Light Mode Status Bar for Auth Pages (White BG, Dark Text)
                    // Style.Dark => Dark Text
                    await StatusBar.setStyle({ style: Style.Dark });
                    await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
                } else {
                    // Follow Theme
                    if (isDark) {
                        // Dark Mode: Black BG, Light Text
                        // Style.Light => Light Text
                        await StatusBar.setStyle({ style: Style.Light });
                        await StatusBar.setBackgroundColor({ color: '#000000' });
                    } else {
                        // Light Mode: Gray BG, Dark Text
                        await StatusBar.setStyle({ style: Style.Dark });
                        await StatusBar.setBackgroundColor({ color: '#F2F2F7' }); // iOS System Gray 6
                    }
                }
            } catch (error) {
                console.error('Failed to update status bar:', error);
            }
        };

        updateStatusBar();
    }, [location.pathname, isDark, isAuthPage]);

    return null;
}
