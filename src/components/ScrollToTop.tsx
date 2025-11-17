import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-24 right-6 lg:bottom-8 lg:right-8 w-12 h-12 bg-white border-2 border-gray-200 hover:border-green-700 text-gray-700 hover:text-green-700 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 z-40 backdrop-blur-sm hover:scale-110 active:scale-95"
      aria-label="Scroll to top"
      style={{
        animation: 'fadeInUp 0.3s ease-out',
      }}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
