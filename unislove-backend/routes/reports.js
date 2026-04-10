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
  getPendingReports,
  getAllReportsForAdmin,
  getAdminStatistics,
  deleteReport
} = require('../controllers/reportsController');
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
limits: { fileSize: 10 * 1024 * 1024 },
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
router.get('/', getAllReports);
router.get('/admin/all', authenticateUser, isAdmin, getAllReportsForAdmin);
router.get('/admin/pending', authenticateUser, isAdmin, getPendingReports);
router.get('/admin/statistics', authenticateUser, isAdmin, getAdminStatistics);
router.get('/:id', getReportById);
router.post('/', upload.array('images', 10), createReport);
router.use(authenticateUser);
router.get('/user/me', getReportsByUser);
router.put('/:id/user-rating', rateReportByUser);
router.put('/:id/status', isAdmin, updateReportStatus);
router.put('/:id/rate', isAdmin, rateReport);
router.put('/:id/approve', isAdmin, approveReport);
router.delete('/:id', isAdmin, deleteReport);
module.exports = router;
//