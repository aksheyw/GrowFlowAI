import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FloatingActionButton() {
    const navigate = useNavigate();

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/add-note')}
            className="
        hidden md:flex
        fixed bottom-8 right-8
        w-16 h-16 rounded-full
        bg-gradient-to-br from-[#2D5016] to-[#6FA84C]
        shadow-2xl shadow-green-900/40
        items-center justify-center
        text-white
        group
        z-40
        hover:shadow-green-900/50
        transition-shadow duration-200
      "
        >
            <Plus className="w-7 h-7" />

            {/* Tooltip */}
            <div
                className="
          absolute right-full mr-4
          px-4 py-2 rounded-xl
          bg-gray-900 text-white text-sm font-medium
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          whitespace-nowrap
          pointer-events-none
        "
            >
                Add Meeting Notes
            </div>
        </motion.button>
    );
}
