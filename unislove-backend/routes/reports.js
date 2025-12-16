const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticateUser, isAdmin } = require('../middleware/auth');
const {
  createReport,
  getAllReports,
  getReportById,
  getReportsByUser,
  updateReportStatus,
  rateReport,
  rateReportByUser,
  approveReport,
  getPendingReports
} = require('../controllers/reportsController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get all reports (public)
router.get('/', getAllReports);

// Get report by ID (public)
router.get('/:id', getReportById);

// Create report
router.post('/', upload.array('images', 10), createReport);

// All routes below require authentication
router.use(authenticateUser);

// Get current user's reports
router.get('/user/me', getReportsByUser);

// User rates their own report (must be authenticated and own the report)
router.put('/:id/user-rating', rateReportByUser);

// Admin routes
router.get('/admin/pending', isAdmin, getPendingReports); // Get pending reports
router.put('/:id/status', isAdmin, updateReportStatus);
router.put('/:id/rate', isAdmin, rateReport);
router.put('/:id/approve', isAdmin, approveReport); // Approve or reject report

module.exports = router;

