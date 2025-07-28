import User from '../models/User.js';

/**
 * @desc Send friend request
 * @route POST /api/friends/:id/request
 */
export async function sendRequest(req, res, next) {
  try {
    const toUser = await User.findById(req.params.id);
    const fromUser = await User.findById(req.user.id);
    if (!toUser || !fromUser) return res.status(404).json({ message: 'User not found', status: 404 });
    if (toUser.friends.includes(fromUser._id) || toUser.friendRequests.received.includes(fromUser._id)) {
      return res.status(400).json({ message: 'Already friends or request pending', status: 400 });
    }
    toUser.friendRequests.received.push(fromUser._id);
    fromUser.friendRequests.sent.push(toUser._id);
    await toUser.save();
    await fromUser.save();
    res.json({ message: 'Friend request sent' });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc Accept friend request
 * @route POST /api/friends/:id/accept
 */
export async function acceptRequest(req, res, next) {
  try {
    const fromUser = await User.findById(req.params.id);
    const toUser = await User.findById(req.user.id);
    if (!fromUser || !toUser) return res.status(404).json({ message: 'User not found', status: 404 });
    if (!toUser.friendRequests.received.includes(fromUser._id)) {
      return res.status(400).json({ message: 'No request to accept', status: 400 });
    }
    toUser.friends.push(fromUser._id);
    fromUser.friends.push(toUser._id);
    toUser.friendRequests.received = toUser.friendRequests.received.filter(id => !id.equals(fromUser._id));
    fromUser.friendRequests.sent = fromUser.friendRequests.sent.filter(id => !id.equals(toUser._id));
    await toUser.save();
    await fromUser.save();
    res.json({ message: 'Friend request accepted' });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc Reject friend request
 * @route POST /api/friends/:id/reject
 */
export async function rejectRequest(req, res, next) {
  try {
    const fromUser = await User.findById(req.params.id);
    const toUser = await User.findById(req.user.id);
    if (!fromUser || !toUser) return res.status(404).json({ message: 'User not found', status: 404 });
    if (!toUser.friendRequests.received.includes(fromUser._id)) {
      return res.status(400).json({ message: 'No request to reject', status: 400 });
    }
    toUser.friendRequests.received = toUser.friendRequests.received.filter(id => !id.equals(fromUser._id));
    fromUser.friendRequests.sent = fromUser.friendRequests.sent.filter(id => !id.equals(toUser._id));
    await toUser.save();
    await fromUser.save();
    res.json({ message: 'Friend request rejected' });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc Unfriend a user
 * @route DELETE /api/friends/:id/unfriend
 */
export async function unfriend(req, res, next) {
  try {
    const otherUser = await User.findById(req.params.id);
    const user = await User.findById(req.user.id);
    if (!otherUser || !user) return res.status(404).json({ message: 'User not found', status: 404 });
    user.friends = user.friends.filter(id => !id.equals(otherUser._id));
    otherUser.friends = otherUser.friends.filter(id => !id.equals(user._id));
    await user.save();
    await otherUser.save();
    res.json({ message: 'Unfriended' });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc Get all users that are not friends and can be sent friend requests
 * @route GET /api/friends/suggestions
 */
export async function getSuggestions(req, res, next) {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) return res.status(404).json({ message: 'User not found', status: 404 });

    // Get all user IDs to exclude (current user, friends, sent requests, received requests)
    const excludeIds = [
      currentUser._id,
      ...currentUser.friends,
      ...currentUser.friendRequests.sent,
      ...currentUser.friendRequests.received
    ];

    // Find all users not in the exclude list
    const suggestions = await User.find(
      { _id: { $nin: excludeIds } },
      { username: 1, displayName: 1, avatarUrl: 1, bio: 1 }
    ).limit(20); // Limit to 20 suggestions

    res.json({ suggestions });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc Get all friends of the current user
 * @route GET /api/friends
 */
export async function getFriends(req, res, next) {
  try {
    const user = await User.findById(req.user.id)
      .populate('friends', 'username displayName avatarUrl bio')
      .select('friends');
    
    if (!user) return res.status(404).json({ message: 'User not found', status: 404 });

    res.json({ friends: user.friends });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc Get all friend requests received by the current user
 * @route GET /api/friends/requests/received
 */
export async function getReceivedRequests(req, res, next) {
  try {
    const user = await User.findById(req.user.id)
      .populate('friendRequests.received', 'username displayName avatarUrl bio')
      .select('friendRequests.received');
    
    if (!user) return res.status(404).json({ message: 'User not found', status: 404 });

    res.json({ requests: user.friendRequests.received });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc Get all friend requests sent by the current user
 * @route GET /api/friends/requests/sent
 */
export async function getSentRequests(req, res, next) {
  try {
    const user = await User.findById(req.user.id)
      .populate('friendRequests.sent', 'username displayName avatarUrl bio')
      .select('friendRequests.sent');
    
    if (!user) return res.status(404).json({ message: 'User not found', status: 404 });

    res.json({ requests: user.friendRequests.sent });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc Cancel a sent friend request
 * @route DELETE /api/friends/:id/cancel
 */
export async function cancelRequest(req, res, next) {
  try {
    const toUser = await User.findById(req.params.id);
    const fromUser = await User.findById(req.user.id);
    
    if (!toUser || !fromUser) return res.status(404).json({ message: 'User not found', status: 404 });
    
    if (!fromUser.friendRequests.sent.includes(toUser._id)) {
      return res.status(400).json({ message: 'No request to cancel', status: 400 });
    }

    fromUser.friendRequests.sent = fromUser.friendRequests.sent.filter(id => !id.equals(toUser._id));
    toUser.friendRequests.received = toUser.friendRequests.received.filter(id => !id.equals(fromUser._id));
    
    await fromUser.save();
    await toUser.save();
    
    res.json({ message: 'Friend request cancelled' });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc Get friend status between current user and another user
 * @route GET /api/friends/:id/status
 */
export async function getFriendStatus(req, res, next) {
  try {
    const currentUser = await User.findById(req.user.id);
    const otherUser = await User.findById(req.params.id);
    
    if (!currentUser || !otherUser) {
      return res.status(404).json({ message: 'User not found', status: 404 });
    }

    let status = 'none'; // none, friends, sent, received

    if (currentUser.friends.includes(otherUser._id)) {
      status = 'friends';
    } else if (currentUser.friendRequests.sent.includes(otherUser._id)) {
      status = 'sent';
    } else if (currentUser.friendRequests.received.includes(otherUser._id)) {
      status = 'received';
    }

    res.json({ status });
  } catch (err) {
    next(err);
  }
} 