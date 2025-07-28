import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

const eventLabels = {
  postLiked: 'liked your post',
  postCommented: 'commented on your post',
  incomingFriendRequest: 'sent you a friend request',
  friendRequestAccepted: 'accepted your friend request',
};

const NotificationsDropdown = ({ userId }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socket.emit('join', userId);
    socketRef.current = socket;

    const handleEvent = (type) => (data) => {
      setNotifications((prev) => [
        {
          id: Date.now() + Math.random(),
          type,
          data,
          time: new Date(),
        },
        ...prev,
      ]);
      setUnread((u) => u + 1);
    };

    socket.on('postLiked', handleEvent('postLiked'));
    socket.on('postCommented', handleEvent('postCommented'));
    socket.on('incomingFriendRequest', handleEvent('incomingFriendRequest'));
    socket.on('friendRequestAccepted', handleEvent('friendRequestAccepted'));

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const handleToggle = () => {
    setOpen((o) => !o);
    setUnread(0);
  };

  const handleClear = () => {
    setNotifications([]);
    setUnread(0);
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-full bg-blue-50 hover:bg-blue-100 transition-all"
        title="Notifications"
      >
        <span className="text-2xl text-blue-700">🔔</span>
        {unread > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold animate-pulse">
            {unread}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <span className="font-semibold text-blue-700">Notifications</span>
              <button
                onClick={handleClear}
                className="text-xs text-gray-400 hover:text-red-500 font-bold"
              >
                Clear
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-400">No notifications yet.</div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="px-4 py-3 flex items-start hover:bg-blue-50 transition-all">
                    <span className="mr-2 text-lg">{n.type === 'postLiked' ? '👍' : n.type === 'postCommented' ? '💬' : n.type === 'incomingFriendRequest' ? '👤' : '🤝'}</span>
                    <div className="flex-1">
                      <div className="text-sm text-gray-700">
                        <span className="font-semibold text-blue-700">{n.data?.from?.displayName || n.data?.from?.username || n.data?.user?.displayName || n.data?.user?.username || 'Someone'}</span> {eventLabels[n.type]}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{n.time.toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsDropdown; 