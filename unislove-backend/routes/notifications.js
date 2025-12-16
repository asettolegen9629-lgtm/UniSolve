const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
} = require('../controllers/notificationsController');

// All routes require authentication
router.use(authenticateUser);

// Get notifications
router.get('/', getNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark notification as read
router.put('/:id/read', markAsRead);

// Mark all as read
router.put('/read-all', markAllAsRead);

module.exports = router;

