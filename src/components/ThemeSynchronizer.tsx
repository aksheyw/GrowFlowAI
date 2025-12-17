import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Bridges AuthContext and ThemeContext to sync saved theme preference on login.
 * Placed in AppContent to have access to both Providers.
 */
export default function ThemeSynchronizer() {
    const { user, profile } = useAuth();
    const { setTheme } = useTheme();

    // Track the last user ID we synced for to prevent overwriting 
    // local changes during the same session.
    const lastSyncedUserRef = useRef<string | null>(null);

    useEffect(() => {
        // Only run if we have a user, a profile with a preference, 
        // and we haven't synced this user yet.
        if (user && profile?.theme_preference && user.id !== lastSyncedUserRef.current) {
            console.log('Syncing theme from profile:', profile.theme_preference);
            setTheme(profile.theme_preference);
            lastSyncedUserRef.current = user.id;
        }
    }, [user, profile, setTheme]);

    return null;
}
