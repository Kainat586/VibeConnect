import { useEffect, useRef, useState } from 'react';
import ApiService from '../services/api';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import NavBar from '../components/NavBar';

const SOCKET_URL = 'http://localhost:5000';

const Chat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  // Track previous messages length for scroll
  const prevMessagesLength = useRef(0);

  // Setup socket only once per user
  useEffect(() => {
    if (!(user?.id || user?._id)) return;
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socket.emit('join', user.id || user._id);
    const handleMessage = (msg) => {
      setMessages((prev) => {
        // Remove optimistic message if present
        let filtered = prev.filter(m => !(m._id && m._id.startsWith('temp-') && m.content === msg.content && m.sender._id === (user.id || user._id)));
        // Only add if not already present
        if (filtered.some(m => m._id === msg._id)) return filtered;
        // Only add if for the selected conversation
        if (
          selected &&
          ((msg.sender._id === selected._id && msg.recipient._id === (user.id || user._id)) ||
            (msg.sender._id === (user.id || user._id) && msg.recipient._id === selected._id))
        ) {
          return [...filtered, msg];
        }
        return filtered;
      });
    };
    socket.on('message', handleMessage);
    socketRef.current = socket;
    return () => {
      socket.off('message', handleMessage);
      socket.disconnect();
    };
  }, [user, selected]);

  // Fetch initial data
  useEffect(() => {
    if (!(user?.id || user?._id)) return;
    
    const fetchInitialData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch both in parallel
        const [conversationsData, friendsData] = await Promise.all([
          ApiService.getConversations().catch(() => []),
          ApiService.getFriends().catch(() => ({ friends: [] }))
        ]);
        
        setConversations(conversationsData || []);
        setFriends(friendsData.friends || []);
        
        // Set selected user from either conversations or friends
        if (conversationsData?.length > 0) {
          setSelected(conversationsData[0].user);
        } else if (friendsData.friends?.length > 0) {
          setSelected(friendsData.friends[0]);
        }
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
        setError('Failed to load conversations and friends.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [user]);

  // Fetch messages when selected changes
  useEffect(() => {
    if (selected) fetchMessages(selected._id);
  }, [selected]);

  // Only scroll when a new message is added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchConversations = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ApiService.getConversations();
      setConversations(data);
      // Only set selected if data is not empty
      if (data.length > 0) setSelected(data[0].user);
    } catch (err) {
      setConversations([]); // fallback to empty
      setError(''); // Don't show error, fallback to friends
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const data = await ApiService.getFriends();
      setFriends(data.friends || []);
    } catch {}
  };

  const fetchMessages = async (userId) => {
    setMsgLoading(true);
    try {
      const data = await ApiService.getMessages(userId);
      setMessages(data);
    } catch (err) {
      setMessages([]);
    } finally {
      setMsgLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selected) return;
    const msg = message;
    setMessage('');
    // Optimistically add message to UI
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      _id: tempId,
      sender: { _id: user.id || user._id },
      recipient: { _id: selected._id },
      content: msg,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    // Send via socket only
    socketRef.current?.emit('sendMessage', {
      sender: user.id || user._id,
      recipient: selected._id,
      content: msg,
    });
  };

  // Merge friends and conversations for sidebar
  const allUsers = [
    ...friends.filter(f => !conversations.some(c => c.user._id === f._id)),
    ...conversations.map(c => c.user)
  ];
  // If conversations is empty, just use friends
  const uniqueUsers = allUsers.length > 0
    ? Array.from(new Map(allUsers.map(u => [u._id, u])).values())
    : friends;
  // Filter by search
  const filteredUsers = uniqueUsers.filter(u =>
    u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  // Helper to get full image URL
  const getImageUrl = (url) => {
    if (!url) return undefined;
    if (url.startsWith('/uploads/')) return `http://localhost:5000${url}`;
    return url;
  };

  if (!user || !(user.id || user._id)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <NavBar />
        <div className="text-xl text-blue-700 font-semibold">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex flex-col">
      <NavBar />
      <div className="flex flex-1 h-[calc(100vh-64px)]"> {/* Adjust height for NavBar */}
        <div className="w-full max-w-xs bg-white border-r border-gray-100 flex flex-col">
          <div className="p-4 font-bold text-blue-700 text-xl border-b">Chats</div>
          <div className="px-4 py-2">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search friends..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">Loading...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-4 text-gray-400">You have no friends yet. Add friends to start chatting!</div>
            ) : (
              filteredUsers.map((u) => (
                <motion.button
                  key={u._id}
                  onClick={() => setSelected(u)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`w-full flex items-center px-4 py-3 border-b hover:bg-blue-50 transition-all text-left ${selected && selected._id === u._id ? 'bg-blue-100' : ''}`}
                >
                  <img
                    src={getImageUrl(u.avatarUrl) || '/vite.svg'}
                    alt={u.displayName || u.username}
                    className="w-10 h-10 rounded-full object-cover border-2 border-blue-200 mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-blue-700">{u.displayName || u.username}</div>
                    <div className="text-xs text-gray-400 truncate max-w-[120px]">
                      {conversations.find(c => c.user._id === u._id)?.lastMessage?.content || 'Start a chat'}
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </div>
        <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-blue-50 via-white to-cyan-50">
          <div className="p-4 border-b bg-white font-semibold text-blue-700 text-lg flex items-center min-h-[64px]">
            {selected ? (
              <>
                <img
                  src={getImageUrl(selected.avatarUrl) || '/vite.svg'}
                  alt={selected.displayName || selected.username}
                  className="w-8 h-8 rounded-full object-cover border-2 border-blue-200 mr-3"
                />
                {selected.displayName || selected.username}
              </>
            ) : (
              'Select a conversation'
            )}
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-2" style={{ minHeight: 0 }}>
            <AnimatePresence>
              {msgLoading ? (
                <div className="flex items-center justify-center h-full w-full text-blue-600 text-lg font-semibold">Loading...</div>
              ) : messages.length === 0 ? (
                <div className="text-gray-400 text-center my-auto">No messages yet.</div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-2 flex ${msg.sender._id === (user.id || user._id) ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs px-4 py-2 rounded-2xl shadow ${msg.sender._id === (user.id || user._id) ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border'} break-words`}>
                      {msg.content}
                      <div className="text-xs text-gray-300 mt-1 text-right">{new Date(msg.createdAt).toLocaleTimeString()}</div>
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </AnimatePresence>
          </div>
          {selected && (
            <form onSubmit={handleSend} className="flex items-center p-4 bg-white border-t sticky bottom-0 z-10">
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Type a message..."
                maxLength={500}
                required
              />
              <button
                type="submit"
                className="ml-3 bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-all duration-200"
                disabled={!message.trim()}
              >
                Send
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat; 