import User from '../models/User.js';
import { uploadAvatar } from '../utils/upload.js';
import bcrypt from 'bcryptjs';

/**
 * @desc Get current user profile
 * @route GET /api/users/me
 */
export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found', status: 404 });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

/**
 * @desc Update current user profile
 * @route PUT /api/users/me
 */
export async function updateMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found', status: 404 });

    // Only update fields if new data is provided
    user.displayName = req.body.displayName !== undefined ? req.body.displayName : user.displayName;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    if (req.file) {
      user.avatarUrl = `/uploads/${req.file.filename}`;
    }
    await user.save();
    const updatedUser = await User.findById(req.user.id).select('-passwordHash');
    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
}

/**
 * @desc Change current user password
 * @route PUT /api/users/me/password
 */
export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password required', status: 400 });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found', status: 404 });
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect', status: 400 });
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc Get public user profile
 * @route GET /api/users/:id
 */
export async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found', status: 404 });
    res.json(user);
  } catch (err) {
    next(err);
  }
} 