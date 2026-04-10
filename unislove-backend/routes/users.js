const express = require('express');
const router = express.Router();
const { authenticateUser, isAdmin } = require('../middleware/auth');
const {
  getOrCreateUser,
  getUserById,
  updateUser,
  getCurrentUser,
  getAllUsers,
  makeUserAdmin
} = require('../controllers/usersController');
router.use(authenticateUser);
router.post('/sync', getOrCreateUser);
router.get('/me', getCurrentUser);
router.get('/admin/all', isAdmin, getAllUsers);
router.put('/admin/:id/make-admin', isAdmin, makeUserAdmin);
router.get('/:id', getUserById);
router.put('/me', updateUser);
module.exports = router;
//