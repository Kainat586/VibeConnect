import Message from '../models/Message.js';
import User from '../models/User.js';

// Send a message
export async function sendMessage(req, res, next) {
  try {
    const { recipient, content } = req.body;
    if (!recipient || !content) {
      return res.status(400).json({ message: 'Recipient and content required', status: 400 });
    }
    const message = await Message.create({
      sender: req.user.id,
      recipient,
      content,
    });
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
}

// Get messages between current user and another user
export async function getMessages(req, res, next) {
  try {
    const otherUserId = req.params.userId;
    const userId = req.user.id;
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: otherUserId },
        { sender: otherUserId, recipient: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'username displayName avatarUrl')
      .populate('recipient', 'username displayName avatarUrl');
    res.json(messages);
  } catch (err) {
    next(err);
  }
}

// Get recent conversations for current user
export async function getConversations(req, res, next) {
  try {
    const userId = req.user.id;
    // Find all messages involving the user
    const messages = await Message.find({
      $or: [
        { sender: userId },
        { recipient: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'username displayName avatarUrl')
      .populate('recipient', 'username displayName avatarUrl');
    // Group by other user
    const convMap = {};
    messages.forEach((msg) => {
      const other = msg.sender._id.equals(userId) ? msg.recipient : msg.sender;
      if (!convMap[other._id]) {
        convMap[other._id] = { user: other, lastMessage: msg };
      }
    });
    res.json(Object.values(convMap));
  } catch (err) {
    next(err);
  }
} 