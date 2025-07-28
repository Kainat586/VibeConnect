import { Router } from 'express';
import { getFeed, createPost, updatePost, deletePost, toggleLike, addComment, deleteComment, getPostsByUser } from '../controllers/postController.js';
import auth from '../middleware/auth.js';
import { uploadImage } from '../utils/upload.js';

const router = Router();

router.get('/feed', auth, getFeed);
router.post('/', auth, uploadImage, createPost);
router.put('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);
router.post('/:id/like', auth, toggleLike);
router.post('/:id/comments', auth, addComment);
router.delete('/:id/comments/:cid', auth, deleteComment);
router.get('/user/:id', getPostsByUser);

export default router; 