const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  getOrCreateUser,
  getUserById,
  updateUser,
  getCurrentUser
} = require('../controllers/usersController');

// All routes require authentication
router.use(authenticateUser);

// Get or create user (called on login)
router.post('/sync', getOrCreateUser);

// Get current user
router.get('/me', getCurrentUser);

// Get user by ID
router.get('/:id', getUserById);

// Update user profile
router.put('/me', updateUser);

module.exports = router;

