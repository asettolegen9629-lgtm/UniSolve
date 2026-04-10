const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  createComment,
  getCommentsByReport,
  deleteComment
} = require('../controllers/commentsController');
router.get('/report/:reportId', getCommentsByReport);
router.use(authenticateUser);
router.post('/report/:reportId', createComment);
router.delete('/:id', deleteComment);
module.exports = router;
//make a function 