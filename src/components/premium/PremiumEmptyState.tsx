import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';

export default function PremiumEmptyState() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="
        flex flex-col items-center justify-center
        py-20 px-6 text-center
      "
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          duration: 0.6,
          delay: 0.2
        }}
        className="mb-8"
      >
        <div className="text-8xl mb-4">🌱</div>
        <motion.div
          animate={{
            y: [0, -10, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="flex gap-4 justify-center opacity-30"
        >
          <span className="text-4xl">🌿</span>
          <span className="text-4xl">🪴</span>
          <span className="text-4xl">🌸</span>
        </motion.div>
      </motion.div>

      <h2 className="text-3xl font-bold text-gray-900 mb-3">
        Your garden is empty
      </h2>

      <p className="text-lg text-gray-600 max-w-md mb-8">
        Add meeting notes to plant your first seeds.<br />
        Watch them grow as you complete tasks!
      </p>

      <Button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/add-note')}
        className="
          px-8 py-4 h-auto
          bg-gradient-to-r from-[#2D5016] to-[#6FA84C]
          text-white font-semibold rounded-2xl
          shadow-lg shadow-green-900/20
          hover:shadow-xl hover:shadow-green-900/30
          border-0
        "
        icon={Plus}
      >
        Add Your First Note
      </Button>

      <div className="mt-12 max-w-lg">
        <p className="text-sm text-gray-500 mb-3">Example meeting note:</p>
        <div className="
          bg-gray-50 rounded-xl p-4
          text-left text-sm text-gray-700
          border border-gray-200
        ">
          Team standup with Alex and Jordan.<br />
          Alex will complete user auth by Nov 12th - urgent.<br />
          Jordan working on dashboard redesign, due Nov 15th.
        </div>
      </div>
    </motion.div>
  );
}
