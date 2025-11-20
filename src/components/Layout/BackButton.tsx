import { ArrowLeft } from 'lucide-react';
import { useNavigation } from '../../hooks/useNavigation';

export default function BackButton() {
    const { goBack, canGoBack } = useNavigation();

    if (!canGoBack) return null;

    return (
        <>
            {/* Desktop version */}
            <button
                onClick={goBack}
                className="
          hidden md:flex
          items-center gap-2
          text-gray-600 hover:text-gray-900
          transition-colors duration-200
          group
          -ml-2 px-2 py-1
        "
            >
                <ArrowLeft
                    className="
            w-5 h-5
            group-hover:-translate-x-1
            transition-transform duration-200
          "
                />
                <span className="font-medium text-sm">Back</span>
            </button>

            {/* Mobile version - icon only */}
            <button
                onClick={goBack}
                className="
          md:hidden
          p-2 rounded-lg
          hover:bg-gray-100
          active:bg-gray-200
          transition-colors
        "
            >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
        </>
    );
}
