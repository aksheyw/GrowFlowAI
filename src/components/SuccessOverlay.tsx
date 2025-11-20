import { motion, AnimatePresence } from 'framer-motion';

interface SuccessOverlayProps {
    isVisible: boolean;
    taskCount: number;
    countdown: number;
    onRedirect: () => void;
}

const PARTICLE_EMOJIS = ['🌱', '🌿', '🪴', '🌸', '🌺', '✨'];

export default function SuccessOverlay({
    isVisible,
    taskCount,
    countdown,
    onRedirect
}: SuccessOverlayProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="
            fixed inset-0 z-50
            bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50
            flex items-center justify-center
            p-6
          "
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                            delay: 0.1
                        }}
                        className="text-center max-w-lg"
                    >
                        {/* Celebration icon with particles */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 15,
                                delay: 0.2
                            }}
                            className="mb-8 relative inline-block"
                        >
                            {/* Main emoji */}
                            <motion.div
                                animate={{
                                    rotate: [0, -10, 10, -10, 10, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{
                                    duration: 0.8,
                                    ease: "easeInOut"
                                }}
                                className="text-8xl sm:text-9xl"
                            >
                                🌿
                            </motion.div>

                            {/* Floating particles around */}
                            {PARTICLE_EMOJIS.map((emoji, i) => {
                                const angle = i * 60; // 360° / 6 particles = 60° apart
                                const radian = (angle * Math.PI) / 180;
                                const distance = 80;

                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{
                                            scale: [0, 1, 0],
                                            opacity: [0, 1, 0],
                                            x: [0, Math.cos(radian) * distance],
                                            y: [0, Math.sin(radian) * distance]
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            delay: 0.3 + (i * 0.1),
                                            ease: "easeOut"
                                        }}
                                        className="absolute top-1/2 left-1/2 text-3xl sm:text-4xl pointer-events-none"
                                        style={{ transform: 'translate(-50%, -50%)' }}
                                    >
                                        {emoji}
                                    </motion.div>
                                );
                            })}
                        </motion.div>

                        {/* Success message */}
                        <motion.h2
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
                        >
                            Seeds planted! 🎉
                        </motion.h2>

                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-xl sm:text-2xl text-gray-600 mb-3"
                        >
                            {taskCount} {taskCount === 1 ? 'task' : 'tasks'} extracted successfully
                        </motion.p>

                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="text-base text-gray-500 mb-8"
                        >
                            Watch them grow in your garden
                        </motion.p>

                        {/* Redirect button */}
                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onRedirect}
                            className="
                px-8 sm:px-10 py-4 sm:py-5 rounded-2xl
                bg-gradient-to-r from-[#2D5016] to-[#6FA84C]
                text-white text-base sm:text-lg font-semibold
                shadow-2xl shadow-green-900/30
                hover:shadow-green-900/50
                transition-shadow duration-200
              "
                        >
                            View Your Garden
                        </motion.button>

                        {/* Auto-redirect countdown */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="mt-6 text-sm text-gray-500"
                        >
                            Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
