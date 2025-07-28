import { useEffect, useState } from 'react';
import ApiService from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
  { key: 'friends', label: 'Friends' },
  { key: 'requests', label: 'Requests' },
  { key: 'suggestions', label: 'Suggestions' },
];

// Helper to get full image URL
const getImageUrl = (url) => {
  if (!url) return undefined;
  if (url.startsWith('/uploads/')) return `http://localhost:5000${url}`;
  return url;
};

const Friends = () => {
  const [tab, setTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [f, s, r, t] = await Promise.all([
        ApiService.getFriends(),
        ApiService.getFriendSuggestions(),
        ApiService.getReceivedRequests(),
        ApiService.getSentRequests(),
      ]);
      setFriends(f.friends || []);
      setSuggestions(s.suggestions || []);
      setReceived(r.requests || []);
      setSent(t.requests || []);
    } catch (err) {
      setError('Failed to load friends data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (type, userId) => {
    setActionLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      if (type === 'add') await ApiService.sendFriendRequest(userId);
      if (type === 'accept') await ApiService.acceptFriendRequest(userId);
      if (type === 'reject') await ApiService.rejectFriendRequest(userId);
      if (type === 'cancel') await ApiService.cancelFriendRequest(userId);
      if (type === 'unfriend') await ApiService.unfriend(userId);
      await fetchAll();
    } catch (err) {
      // Optionally show error
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const renderUserCard = (user, actions = []) => (
    <motion.div
      key={user._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white rounded-xl shadow p-5 mb-4 flex items-center border border-gray-100"
    >
      <img
        src={getImageUrl(user.avatarUrl) || '/vite.svg'}
        alt={user.displayName || user.username}
        className="w-14 h-14 rounded-full object-cover border-2 border-blue-200 mr-4"
      />
      <div className="flex-1">
        <div className="font-bold text-blue-700 text-lg">{user.displayName || user.username}</div>
        <div className="text-gray-500 text-sm">@{user.username}</div>
        <div className="text-gray-700 text-sm mt-1 max-w-xs truncate">{user.bio}</div>
      </div>
      <div className="flex space-x-2">
        {actions.map(({ label, type, color }) => (
          <button
            key={type}
            onClick={() => handleAction(type, user._id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow ${color} disabled:opacity-60`}
            disabled={actionLoading[user._id]}
          >
            {actionLoading[user._id] ? '...' : label}
          </button>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8 px-2 sm:px-0">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center mb-8">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-6 py-2 rounded-t-lg font-semibold text-lg transition-all duration-200 mx-1 ${tab === t.key ? 'bg-white text-blue-700 shadow border-b-2 border-blue-600' : 'bg-blue-100 text-blue-500'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">{error}</div>
        ) : (
          <AnimatePresence>
            {tab === 'friends' && (
              <motion.div key="friends" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {friends.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">You have no friends yet.</div>
                ) : (
                  friends.map((user) =>
                    renderUserCard(user, [
                      { label: 'Unfriend', type: 'unfriend', color: 'bg-red-100 text-red-600 hover:bg-red-200' },
                    ])
                  )
                )}
              </motion.div>
            )}
            {tab === 'requests' && (
              <motion.div key="requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="mb-6">
                  <div className="font-semibold text-blue-700 mb-2">Received Requests</div>
                  {received.length === 0 ? (
                    <div className="text-gray-500 text-sm mb-4">No received requests.</div>
                  ) : (
                    received.map((user) =>
                      renderUserCard(user, [
                        { label: 'Accept', type: 'accept', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
                        { label: 'Reject', type: 'reject', color: 'bg-red-100 text-red-600 hover:bg-red-200' },
                      ])
                    )
                  )}
                </div>
                <div>
                  <div className="font-semibold text-blue-700 mb-2">Sent Requests</div>
                  {sent.length === 0 ? (
                    <div className="text-gray-500 text-sm">No sent requests.</div>
                  ) : (
                    sent.map((user) =>
                      renderUserCard(user, [
                        { label: 'Cancel', type: 'cancel', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
                      ])
                    )
                  )}
                </div>
              </motion.div>
            )}
            {tab === 'suggestions' && (
              <motion.div key="suggestions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {suggestions.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">No suggestions at the moment.</div>
                ) : (
                  suggestions.map((user) =>
                    renderUserCard(user, [
                      { label: 'Add Friend', type: 'add', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
                    ])
                  )
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
      <style>{`
        .loader {
          border-top-color: #3498db;
          animation: spinner 1s linear infinite;
        }
        @keyframes spinner {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Friends; 