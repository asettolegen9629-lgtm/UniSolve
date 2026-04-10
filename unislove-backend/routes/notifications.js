const express = require('express');
const router = express.Router();
const { authenticateUser, isAdmin } = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
} = require('../controllers/notificationsController');
const {
  getAdminNotifications,
  markAdminNotificationAsRead,
  getAdminUnreadCount
} = require('../controllers/adminNotificationsController');
router.use(authenticateUser);
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.get('/admin/all', isAdmin, getAdminNotifications);
router.get('/admin/unread-count', isAdmin, getAdminUnreadCount);
router.put('/admin/:id/read', isAdmin, markAdminNotificationAsRead);
module.exports = router;
//