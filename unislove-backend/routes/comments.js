const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  createComment,
  getCommentsByReport,
  deleteComment
} = require('../controllers/commentsController');

// Get comments for a report (public)
router.get('/report/:reportId', getCommentsByReport);

// All routes below require authentication
router.use(authenticateUser);

// Create comment
router.post('/report/:reportId', createComment);

// Delete comment
router.delete('/:id', deleteComment);

module.exports = router;

