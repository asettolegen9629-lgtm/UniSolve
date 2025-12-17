const express = require('express');
const router = express.Router();
const { authenticateUser, isAdmin } = require('../middleware/auth');
const {
  createFeedback,
  getAllFeedbacksForAdmin,
  getFeedbackStatistics,
  getFeedbacksByReport,
  markFeedbackAsRead,
} = require('../controllers/feedbackController');
router.post('/', authenticateUser, createFeedback);
router.get('/report/:reportId', authenticateUser, getFeedbacksByReport);
router.get('/admin/all', authenticateUser, isAdmin, getAllFeedbacksForAdmin);
router.get('/admin/statistics', authenticateUser, isAdmin, getFeedbackStatistics);
router.put('/admin/:id/read', authenticateUser, isAdmin, markFeedbackAsRead);
