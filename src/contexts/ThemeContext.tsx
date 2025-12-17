import React, { createContext, useContext, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { supabase } from '../lib/supabase';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isDark: boolean; // Derived functionality for easy checking
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        // 1. Check local storage
        const stored = localStorage.getItem('theme_preference');
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
            return stored;
        }
        return 'system';
    });

    const [isDark, setIsDark] = useState(false);

    // Function to determine if dark mode should be active
    const checkIsDark = (currentTheme: Theme) => {
        if (currentTheme === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return currentTheme === 'dark';
    };

    // 1. Effect to apply class to DOM
    useEffect(() => {
        const root = window.document.documentElement;
        const dark = checkIsDark(theme);
        setIsDark(dark);

        root.classList.remove('light', 'dark');

        if (dark) {
            root.classList.add('dark');
        } else {
            root.classList.add('light');
        }

        // Update Status Bar
        if (Capacitor.isNativePlatform()) {
            if (dark) {
                // Dark Mode: Dark BG, Light Text
                // Note: Capacitor naming can be confusing. 
                // Style.Light usually means Light TEXT (for dark backgrounds).
                // Style.Dark usually means Dark TEXT (for light backgrounds).
                StatusBar.setStyle({ style: Style.Light }).catch(() => { });
                StatusBar.setBackgroundColor({ color: '#000000' }).catch(() => { });
            } else {
                // Light Mode: Light BG, Dark Text
                StatusBar.setStyle({ style: Style.Dark }).catch(() => { });
                StatusBar.setBackgroundColor({ color: '#F2F2F7' }).catch(() => { }); // System Gray 6
            }
        }

    }, [theme]);

    // 2. Listener for System changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                // Trigger re-eval
                const dark = mediaQuery.matches;
                setIsDark(dark);
                const root = window.document.documentElement;
                root.classList.remove('light', 'dark');
                if (dark) root.classList.add('dark');
                else root.classList.add('light');

                // Update Status Bar logic (Duplicated for system event)
                if (Capacitor.isNativePlatform()) {
                    if (dark) {
                        StatusBar.setStyle({ style: Style.Light }).catch(() => { });
                        StatusBar.setBackgroundColor({ color: '#000000' }).catch(() => { });
                    } else {
                        StatusBar.setStyle({ style: Style.Dark }).catch(() => { });
                        StatusBar.setBackgroundColor({ color: '#F2F2F7' }).catch(() => { });
                    }
                }
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        localStorage.setItem('theme_preference', newTheme);
        setThemeState(newTheme);

        // Persist to Supabase if user is logged in
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                supabase.from('profiles')
                    .update({ theme_preference: newTheme })
                    .eq('id', user.id)
                    .then(({ error }) => {
                        if (error) console.error('Failed to save theme preference:', error);
                    });
            }
        });
    };

    // 3. Listen for Auth Changes to fetch persistent theme
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('theme_preference')
                    .eq('id', session.user.id)
                    .single();

                if (!error && data?.theme_preference) {
                    const pref = data.theme_preference as Theme;
                    // Only update if different from local storage to avoid flicker/loops
                    if (pref !== localStorage.getItem('theme_preference')) {
                        setThemeState(pref);
                        localStorage.setItem('theme_preference', pref);
                    }
                }
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
