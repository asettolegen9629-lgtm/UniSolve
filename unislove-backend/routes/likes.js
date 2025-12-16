const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  toggleReportLike,
  toggleCommentLike,
  getReportLikes,
  getCommentLikes
} = require('../controllers/likesController');

// Get likes (public)
router.get('/report/:reportId', getReportLikes);
router.get('/comment/:commentId', getCommentLikes);

// All routes below require authentication
router.use(authenticateUser);

// Toggle likes
router.post('/report/:reportId', toggleReportLike);
router.post('/comment/:commentId', toggleCommentLike);

module.exports = router;

