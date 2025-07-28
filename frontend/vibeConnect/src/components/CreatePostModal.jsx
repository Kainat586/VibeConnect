import { useState } from 'react';
import ApiService from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const CreatePostModal = ({ open, onClose, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (image) formData.append('image', image);
      await ApiService.createPost(formData);
      setContent('');
      setImage(null);
      onPostCreated && onPostCreated();
      onClose();
    } catch (err) {
      setError('Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
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
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl font-bold"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-blue-700 mb-4">Create Post</h2>
            <div className="mb-4">
              <textarea
                name="content"
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                rows={4}
                placeholder="What's on your mind?"
                required={!image}
                maxLength={500}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">Image (optional)</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full"
              />
            </div>
            {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-2">{error}</div>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200"
              disabled={loading || (!content && !image)}
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreatePostModal; 