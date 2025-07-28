import { Router } from 'express';
import { 
  sendRequest, 
  acceptRequest, 
  rejectRequest, 
  unfriend, 
  getSuggestions,
  getFriends,
  getReceivedRequests,
  getSentRequests,
  cancelRequest,
  getFriendStatus
} from '../controllers/friendController.js';
import auth from '../middleware/auth.js';

const router = Router();

// Get all friends
router.get('/', auth, getFriends);

// Get friend suggestions (users that can be sent friend requests)
router.get('/suggestions', auth, getSuggestions);

// Get received friend requests
router.get('/requests/received', auth, getReceivedRequests);

// Get sent friend requests
router.get('/requests/sent', auth, getSentRequests);

// Get friend status with a specific user
router.get('/:id/status', auth, getFriendStatus);

// Send friend request
router.post('/:id/request', auth, sendRequest);

// Accept friend request
router.post('/:id/accept', auth, acceptRequest);

// Reject friend request
router.post('/:id/reject', auth, rejectRequest);

// Cancel sent friend request
router.delete('/:id/cancel', auth, cancelRequest);

// Unfriend a user
router.delete('/:id/unfriend', auth, unfriend);

export default router; 