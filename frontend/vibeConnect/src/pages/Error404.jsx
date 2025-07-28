import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Error404 = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.7, type: 'spring' }}
      className="flex flex-col items-center"
    >
      <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="90" cy="90" r="90" fill="#e0f2fe" />
        <ellipse cx="90" cy="120" rx="50" ry="15" fill="#bae6fd" />
        <ellipse cx="65" cy="80" rx="10" ry="18" fill="#fff" />
        <ellipse cx="115" cy="80" rx="10" ry="18" fill="#fff" />
        <ellipse cx="65" cy="80" rx="5" ry="9" fill="#38bdf8" />
        <ellipse cx="115" cy="80" rx="5" ry="9" fill="#38bdf8" />
        <ellipse cx="90" cy="110" rx="18" ry="8" fill="#fff" />
        <ellipse cx="90" cy="110" rx="10" ry="4" fill="#38bdf8" />
      </svg>
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-7xl font-extrabold text-blue-600 mt-8 mb-2 drop-shadow-lg"
      >
        404
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-2xl text-blue-700 mb-6 text-center"
      >
        Oops! Page not found.
      </motion.p>
      <Link
        to="/home"
        className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold text-lg shadow hover:bg-blue-700 transition-all duration-200"
      >
        Go Home
      </Link>
    </motion.div>
  </div>
);

export default Error404; 