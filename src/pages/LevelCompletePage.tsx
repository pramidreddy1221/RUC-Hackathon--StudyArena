import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import { motion } from "framer-motion";
import useWindowSize from "../hooks/useWindowSize";

export default function LevelCompletePage() {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(true);
  const location = useLocation();

  const score = location.state?.score ?? 0;
  const time = location.state?.time ?? "N/A";

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-cyan-100 p-6">

      {showConfetti && (
        <Confetti width={width} height={height} recycle={false} />
      )}

      <motion.div
        className="max-w-3xl bg-white shadow-2xl p-10 rounded-3xl text-center flex flex-col items-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        {/* Title */}
        <motion.h1
          className="text-5xl font-extrabold text-indigo-700 mb-4"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120 }}
        >
          🎉 Congratulations!
        </motion.h1>

        <motion.p
          className="text-lg text-gray-600 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          You successfully completed <strong>Level 3</strong>!
        </motion.p>

        {/* Animated box / placeholder for Lottie */}
        <motion.div
          className="w-52 h-52 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-2xl shadow-inner mb-8 flex items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* Replace with Lottie animation if needed */}
          <span className="text-6xl">🏆</span>
        </motion.div>

        {/* Score Section */}
        <motion.div
          className="flex gap-6 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-lg">
            <div className="text-sm">Score</div>
            <div className="text-2xl font-bold">{score}</div>
          </div>

        </motion.div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <motion.button
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-md font-semibold"
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Home
          </motion.button>

          <motion.button
            className="px-6 py-3 bg-white border rounded-xl shadow-md font-semibold"
            onClick={() => navigate("/level/1")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Play Again
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
