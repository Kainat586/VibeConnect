import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const navItems = [
  { label: 'Home', path: '/home', icon: '🏠' },
  { label: 'Profile', path: '/profile', icon: '👤' },
  { label: 'Friends', path: '/friends', icon: '🤝' },
  { label: 'Chat', path: '/chat', icon: '💬' },
  { label: 'Settings', path: '/settings', icon: '⚙️' },
];

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signout } = useAuth();

  const handleSignout = async () => {
    await signout();
    navigate('/signin');
  };

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white shadow flex items-center justify-between px-6 h-16 border-b z-50"
    >
      <div className="flex items-center space-x-2">
        <span className="text-2xl font-bold text-blue-700">VibeConnect</span>
      </div>
      <div className="flex items-center space-x-2 md:space-x-4">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex items-center px-3 py-2 rounded-lg font-semibold text-lg transition-all duration-200 ${location.pathname.startsWith(item.path) ? 'bg-blue-100 text-blue-700 shadow' : 'text-gray-600 hover:bg-blue-50'}`}
          >
            <span className="mr-2 text-xl">{item.icon}</span>
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        ))}
        <button
          onClick={handleSignout}
          className="ml-2 px-3 py-2 rounded-lg bg-red-100 text-red-600 font-semibold text-lg hover:bg-red-200 transition-all duration-200"
        >
          <span className="mr-2 text-xl">🚪</span>
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </motion.nav>
  );
};

export default NavBar; 