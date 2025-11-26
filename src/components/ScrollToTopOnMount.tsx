import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export default function ScrollToTopOnMount() {
    const { pathname } = useLocation();
    const scrollPositions = useRef<{ [key: string]: number }>({});

    // Pages that should preserve scroll position
    const preserveScrollPaths = ['/dashboard', '/updates', '/profile'];

    useEffect(() => {
        // Save scroll position of the previous page before it changes
        const handleScroll = () => {
            // We only care about saving scroll for specific pages
            if (preserveScrollPaths.includes(pathname)) {
                scrollPositions.current[pathname] = window.scrollY;
            }
        };

        // We need to save the scroll position *before* the route changes.
        // However, React Router doesn't give us a clean "before route change" hook that guarantees
        // we can read the scroll position of the *old* page easily in this component structure
        // without a global listener.
        // A simpler approach for this component:
        // 1. Listen to global scroll and keep updating the ref for the CURRENT path.
        // 2. When pathname changes (useEffect triggers), the ref already has the last scroll pos of the old path.
        // 3. Then we handle the new path.

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [pathname]);

    useEffect(() => {
        if (preserveScrollPaths.includes(pathname)) {
            // If we have a saved position, restore it. Otherwise top.
            const savedPosition = scrollPositions.current[pathname];
            if (savedPosition !== undefined) {
                window.scrollTo(0, savedPosition);
            } else {
                window.scrollTo(0, 0);
            }
        } else {
            // Always scroll to top for other pages
            window.scrollTo(0, 0);
        }
    }, [pathname]);

    return null;
}
