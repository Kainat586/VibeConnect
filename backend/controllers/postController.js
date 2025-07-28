import Post from '../models/Post.js';
import User from '../models/User.js';

/**
 * @desc Get feed (posts by user and friends)
 * @route GET /api/posts/feed
 */
export async function getFeed(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    const ids = [user._id, ...user.friends];
    const posts = await Post.find({ author: { $in: ids } })
      .sort({ createdAt: -1 })
      .populate('author', 'username displayName avatarUrl')
      .populate('comments.author', 'username displayName avatarUrl');
    res.json(posts);
  } catch (err) {
    next(err);
  }
}

/**
 * @desc Create new post
 * @route POST /api/posts/
 */
export async function createPost(req, res, next) {
  try {
    if (!req.body.content && !req.file) {
      return res.status(400).json({ message: 'Content or image required', status: 400 });
    }
    const post = await Post.create({
      author: req.user.id,
      content: req.body.content,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
    });
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
}

/**
 * @desc Update own post
 * @route PUT /api/posts/:id
 */
export async function updatePost(req, res, next) {
  try {
    const post = await Post.findOne({ _id: req.params.id, author: req.user.id });
    if (!post) return res.status(404).json({ message: 'Post not found', status: 404 });
    if (req.body.content) post.content = req.body.content;
    await post.save();
    res.json(post);
  } catch (err) {
    next(err);
  }
}

/**
 * @desc Delete own post
 * @route DELETE /api/posts/:id
 */
export async function deletePost(req, res, next) {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, author: req.user.id });
    if (!post) return res.status(404).json({ message: 'Post not found', status: 404 });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc Toggle like on post
 * @route POST /api/posts/:id/like
 */
export async function toggleLike(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found', status: 404 });
    const idx = post.likes.indexOf(req.user.id);
    if (idx === -1) {
      post.likes.push(req.user.id);
    } else {
      post.likes.splice(idx, 1);
    }
    await post.save();
    res.json(post);
  } catch (err) {
    next(err);
  }
}

/**
 * @desc Add comment to post
 * @route POST /api/posts/:id/comments
 */
export async function addComment(req, res, next) {
  try {
    if (!req.body.text) return res.status(400).json({ message: 'Text required', status: 400 });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found', status: 404 });
    const comment = {
      author: req.user.id,
      text: req.body.text,
      createdAt: new Date(),
    };
    post.comments.push(comment);
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
}

/**
 * @desc Delete own comment
 * @route DELETE /api/posts/:id/comments/:cid
 */
export async function deleteComment(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found', status: 404 });
    const comment = post.comments.id(req.params.cid);
    if (!comment) return res.status(404).json({ message: 'Comment not found', status: 404 });
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized', status: 403 });
    }
    comment.remove();
    await post.save();
    res.json(post);
  } catch (err) {
    next(err);
  }
}

/**
 * @desc Get all posts by a specific user
 * @route GET /api/posts/user/:id
 */
export async function getPostsByUser(req, res, next) {
  try {
    const posts = await Post.find({ author: req.params.id })
      .sort({ createdAt: -1 })
      .populate('author', 'username displayName avatarUrl')
      .populate('comments.author', 'username displayName avatarUrl');
    res.json(posts);
  } catch (err) {
    next(err);
  }
} 