import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export function useNavigation() {
    const location = useLocation();
    const navigate = useNavigate();
    const [previousPath, setPreviousPath] = useState<string | null>(null);

    useEffect(() => {
        setPreviousPath(location.pathname);
    }, [location.pathname]);

    const navigateWithTransition = (path: string) => {
        navigate(path);
    };

    const canGoBack = () => {
        return previousPath !== null && window.history.length > 1;
    };

    const goBack = () => {
        if (canGoBack()) {
            navigate(-1);
        } else {
            navigate('/dashboard');
        }
    };

    return {
        currentPath: location.pathname,
        navigate: navigateWithTransition,
        goBack,
        canGoBack: canGoBack(),
    };
}
