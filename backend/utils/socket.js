import { Server } from 'socket.io';
import Message from '../models/Message.js';

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    // Join user room
    socket.on('join', (userId) => {
      socket.join(userId);
    });

    // New post
    socket.on('newPost', (data) => {
      io.to(data.userIds).emit('postCreated', data.post);
    });

    // New like
    socket.on('newLike', (data) => {
      io.to(data.userIds).emit('postLiked', data);
    });

    // New comment
    socket.on('newComment', (data) => {
      io.to(data.userIds).emit('postCommented', data);
    });

    // Friend request
    socket.on('friendRequest', (data) => {
      io.to(data.userId).emit('incomingFriendRequest', data);
    });

    // Friend accepted
    socket.on('friendAccepted', (data) => {
      io.to(data.userId).emit('friendRequestAccepted', data);
    });

    // Chat: sendMessage event
    socket.on('sendMessage', async (data) => {
      const { sender, recipient, content } = data;
      if (!sender || !recipient || !content) return;
      const message = await Message.create({ sender, recipient, content });
      const populated = await Message.findById(message._id)
        .populate('sender', 'username displayName avatarUrl')
        .populate('recipient', 'username displayName avatarUrl');
      io.to(sender).emit('message', populated);
      io.to(recipient).emit('message', populated);
    });
  });
}

export function getIO() {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
} 