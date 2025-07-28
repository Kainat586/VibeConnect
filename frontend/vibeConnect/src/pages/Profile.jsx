import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: '', bio: '', avatar: null });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ApiService.getMe();
      setProfile(data);
      setEditForm({ displayName: data.displayName || '', bio: data.bio || '', avatar: null });
      const userPosts = await ApiService.getPostsByUser(data._id || data.id);
      setPosts(userPosts);
    } catch (err) {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'avatar') {
      setEditForm((prev) => ({ ...prev, avatar: files[0] }));
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    try {
      const formData = new FormData();
      formData.append('displayName', editForm.displayName);
      formData.append('bio', editForm.bio);
      if (editForm.avatar) formData.append('avatar', editForm.avatar);
      await ApiService.updateMe(formData);
      setEditMode(false);
      await fetchProfile();
    } catch (err) {
      setEditError('Failed to update profile.');
    } finally {
      setEditLoading(false);
    }
  };

  // Helper to get full image URL
  const getImageUrl = (url) => {
    if (!url) return undefined;
    if (url.startsWith('/uploads/')) return `http://localhost:5000${url}`;
    return url;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8 px-2 sm:px-0">
      <div className="max-w-2xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">{error}</div>
        ) : profile && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100 relative"
          >
            <div className="flex flex-col items-center">
              <motion.img
                src={getImageUrl(profile.avatarUrl) || '/vite.svg'}
                alt={profile.displayName || profile.username}
                className="w-28 h-28 rounded-full object-cover border-4 border-blue-200 mb-4 shadow-md"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
              <div className="text-2xl font-bold text-blue-700 mb-1">{profile.displayName || profile.username}</div>
              <div className="text-gray-500 text-sm mb-2">@{profile.username}</div>
              <div className="text-gray-700 text-center mb-4 max-w-md">{profile.bio}</div>
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-blue-700 transition-all duration-200 shadow"
              >
                Edit Profile
              </button>
            </div>
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-blue-700 mb-4">Your Posts</h3>
              <AnimatePresence>
                {posts.length === 0 ? (
                  <motion.div
                    key="no-posts"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="text-center text-gray-500 mt-4"
                  >
                    You haven't posted anything yet.
                  </motion.div>
                ) : (
                  posts.map((post) => (
                    <motion.div
                      key={post._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 30 }}
                      layout
                      className="bg-gray-50 rounded-lg shadow mb-6 p-5 border border-gray-100"
                    >
                      <div className="flex items-center mb-2">
                        <img
                          src={getImageUrl(profile.avatarUrl) || '/vite.svg'}
                          alt={profile.displayName || profile.username}
                          className="w-8 h-8 rounded-full object-cover border-2 border-blue-200 mr-2"
                        />
                        <div>
                          <div className="font-semibold text-blue-700">{profile.displayName || profile.username}</div>
                          <div className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="mb-2 text-gray-800 text-lg">{post.content}</div>
                      {post.imageUrl && (
                        <motion.img
                          src={getImageUrl(post.imageUrl)}
                          alt="Post"
                          className="w-full rounded-lg mb-2 max-h-80 object-cover border"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        />
                      )}
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="flex items-center text-blue-600 font-semibold text-sm">
                          👍 {post.likes.length}
                        </span>
                        <span className="text-gray-400 text-sm">{post.comments.length} comments</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
            <AnimatePresence>
              {editMode && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
                >
                  <motion.form
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onSubmit={handleEditSubmit}
                    className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative"
                  >
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl font-bold"
                    >
                      ×
                    </button>
                    <h2 className="text-2xl font-bold text-blue-700 mb-4">Edit Profile</h2>
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-1">Display Name</label>
                      <input
                        type="text"
                        name="displayName"
                        value={editForm.displayName}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        required
                        maxLength={30}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-1">Bio</label>
                      <textarea
                        name="bio"
                        value={editForm.bio}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        rows={3}
                        maxLength={200}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-1">Avatar</label>
                      <input
                        type="file"
                        name="avatar"
                        accept="image/*"
                        onChange={handleEditChange}
                        className="w-full"
                      />
                    </div>
                    {editError && <div className="bg-red-100 text-red-700 p-2 rounded mb-2">{editError}</div>}
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200"
                      disabled={editLoading}
                    >
                      {editLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </motion.form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
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

export default Profile; 