import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import ApiService from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import CreatePostModal from '../components/CreatePostModal';
import NotificationsDropdown from '../components/NotificationsDropdown';
import NavBar from '../components/NavBar';

const Home = () => {
  const { user, signout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState({});
  const [likeLoading, setLikeLoading] = useState({});
  const [commentLoading, setCommentLoading] = useState({});
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ApiService.getFeed();
      setPosts(data);
    } catch (err) {
      setError('Failed to load feed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    setLikeLoading((prev) => ({ ...prev, [postId]: true }));
    try {
      await ApiService.likePost(postId);
      await fetchFeed();
    } catch (err) {
      // Optionally show error
    } finally {
      setLikeLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleComment = async (postId) => {
    if (!commentText[postId]) return;
    setCommentLoading((prev) => ({ ...prev, [postId]: true }));
    try {
      await ApiService.addComment(postId, commentText[postId]);
      setCommentText((prev) => ({ ...prev, [postId]: '' }));
      await fetchFeed();
    } catch (err) {
      // Optionally show error
    } finally {
      setCommentLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // Add handleSignout to fix undefined error
  const handleSignout = async () => {
    try {
      await signout();
    } catch (error) {
      // Optionally handle error
    }
  };

  // Helper to get full image URL
  const getImageUrl = (url) => {
    if (!url) return undefined;
    if (url.startsWith('/uploads/')) return `http://localhost:5000${url}`;
    return url;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <NavBar />

      <main className="max-w-2xl mx-auto py-8 px-2 sm:px-0">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-blue-700 mb-2 animate-fade-in">Welcome to VibeConnect!</h2>
          <p className="text-gray-600 animate-fade-in">See what your friends are up to.</p>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">{error}</div>
        ) : (
          <AnimatePresence>
            {(!user || posts.length === 0) ? (
              <motion.div
                key="no-posts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="text-center text-gray-500 mt-12"
              >
                No posts to show yet. Start connecting with friends!
              </motion.div>
            ) : (
              posts.map((post) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  layout
                  className="bg-white rounded-xl shadow-lg mb-8 p-6 border border-gray-100 transition-all hover:shadow-2xl"
                >
                  <div className="flex items-center mb-4">
                    <img
                      src={getImageUrl(post.author.avatarUrl) || '/vite.svg'}
                      alt={post.author.displayName || post.author.username}
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-200 mr-3"
                    />
                    <div>
                      <div className="font-semibold text-blue-700">{post.author.displayName || post.author.username}</div>
                      <div className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="mb-3 text-lg text-gray-800 animate-fade-in">
                    {post.content}
                  </div>
                  {post.imageUrl && (
                    <motion.img
                      src={getImageUrl(post.imageUrl)}
                      alt="Post"
                      className="w-full rounded-lg mb-3 max-h-96 object-cover border"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                  <div className="flex items-center space-x-4 mb-2">
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center px-3 py-1 rounded-full text-sm font-semibold transition-all duration-150 ${post.likes?.includes(user?.id || user?._id || '') ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'} hover:bg-blue-200`}
                      disabled={likeLoading[post._id]}
                    >
                      <span className="mr-1">👍</span>
                      {post.likes?.length || 0}
                    </button>
                    <span className="text-gray-400 text-sm">{post.comments?.length || 0} comments</span>
                  </div>
                  <div className="mt-2">
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {post.comments.slice(-3).map((comment, idx) => (
                        <motion.div
                          key={comment._id || idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start space-x-2"
                        >
                          <img
                            src={getImageUrl(comment.author.avatarUrl) || '/vite.svg'}
                            alt={comment.author.displayName || comment.author.username}
                            className="w-7 h-7 rounded-full object-cover border border-blue-100 mt-1"
                          />
                          <div>
                            <div className="text-sm font-semibold text-blue-600">{comment.author.displayName || comment.author.username}</div>
                            <div className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</div>
                            <div className="text-gray-700 text-sm">{comment.text}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <form
                      className="flex items-center mt-3 space-x-2"
                      onSubmit={e => {
                        e.preventDefault();
                        handleComment(post._id);
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        className="flex-1 px-3 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm bg-gray-50"
                        value={commentText[post._id] || ''}
                        onChange={e => setCommentText((prev) => ({ ...prev, [post._id]: e.target.value }))}
                        disabled={commentLoading[post._id]}
                        maxLength={200}
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-all duration-200"
                        disabled={commentLoading[post._id] || !(commentText[post._id] && commentText[post._id].trim())}
                      >
                        {commentLoading[post._id] ? '...' : 'Post'}
                      </button>
                    </form>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        )}
      </main>
      {/* Floating Action Button */}
      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl font-bold transition-all duration-200 z-50 animate-fade-in"
        title="Create Post"
      >
        +
      </button>
      <CreatePostModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onPostCreated={fetchFeed}
      />
      <style>{`
        .loader {
          border-top-color: #3498db;
          animation: spinner 1s linear infinite;
        }
        @keyframes spinner {
          to { transform: rotate(360deg); }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Home;