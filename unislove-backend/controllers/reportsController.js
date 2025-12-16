const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new report
const createReport = async (req, res) => {
  try {
    // Get clerkId from req.user (if authenticated) or from headers (if not)
    const clerkId = req.user?.clerkId || req.headers['x-clerk-user-id'] || 'guest_default';
    const { description, category } = req.body;
    const files = req.files || [];
    
    // Get or create user (auto-provision if not synced yet or guest)
    let user = await prisma.user.findUnique({ where: { clerkId } });

    if (!user) {
      // Get user data from req.user or headers
      const email = req.user?.email || req.headers['x-clerk-email'];
      const username = req.user?.username || req.headers['x-clerk-username'];
      const fullName = req.user?.fullName || req.headers['x-clerk-full-name'];
      const profilePicture = req.user?.profilePicture || null;

      const safeEmail = email || 'guest@example.com';
      const safeUsername = username || (safeEmail.includes('@') ? safeEmail.split('@')[0] : `user_${clerkId.slice(0, 6)}`);
      const safeFullName = fullName || safeUsername;

      user = await prisma.user.create({
        data: {
          clerkId,
          email: safeEmail,
          username: safeUsername,
          fullName: safeFullName,
          profilePicture: profilePicture || null,
        }
      });
    }
    
    // Create report (not approved by default - needs admin moderation)
    const report = await prisma.report.create({
      data: {
        description,
        category,
        userId: user.id,
        isApproved: false, // New reports need admin approval
        images: {
          create: files.map(file => ({
            url: `/uploads/${file.filename}`
          }))
        }
      },
      include: {
        user: true,
        images: true,
        likes: true,
        comments: {
          include: {
            user: true,
            likes: true
          }
        }
      }
    });
    
    // Create notification for user that report is pending
    await prisma.notification.create({
      data: {
        type: 'report_pending',
        message: 'Your report has been submitted and is waiting for admin approval.',
        userId: user.id,
        reportId: report.id
      }
    });
    
    res.status(201).json(report);
  } catch (error) {
    console.error('Error in createReport:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all reports (only approved reports are visible to users)
const getAllReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: {
        isApproved: true // Only show approved reports
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profilePicture: true
          }
        },
        images: true,
        likes: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                profilePicture: true
              }
            },
            likes: {
              include: {
                user: {
                  select: {
                    id: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(reports);
  } catch (error) {
    console.error('Error in getAllReports:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get report by ID (only approved reports are visible to public)
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profilePicture: true
          }
        },
        images: true,
        likes: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                profilePicture: true
              }
            },
            likes: {
              include: {
                user: {
                  select: {
                    id: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    // Check if report is approved (only approved reports are visible to public)
    // Admins can see all reports, but regular users can only see approved ones
    // We'll check this in the route middleware if needed, but for now we'll filter here
    if (!report.isApproved) {
      return res.status(403).json({ error: 'This report is pending approval and is not yet visible' });
    }
    
    res.json(report);
  } catch (error) {
    console.error('Error in getReportById:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get reports by user
const getReportsByUser = async (req, res) => {
  try {
    const { clerkId } = req.user;
    
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const reports = await prisma.report.findMany({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profilePicture: true
          }
        },
        images: true,
        likes: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                profilePicture: true
              }
            },
            likes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(reports);
  } catch (error) {
    console.error('Error in getReportsByUser:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update report status (Admin only)
const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isVerified } = req.body;
    
    const report = await prisma.report.findUnique({
      where: { id },
      include: { user: true }
    });
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        status: status || report.status,
        isVerified: isVerified !== undefined ? isVerified : report.isVerified
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profilePicture: true
          }
        },
        images: true,
        likes: true,
        comments: true
      }
    });
    
    // Create notification for status change
    if (status && status !== report.status) {
      await prisma.notification.create({
        data: {
          type: 'status_changed',
          message: `Your report status has been changed to "${status}"`,
          userId: report.userId,
          reportId: report.id
        }
      });
    }
    
    res.json(updatedReport);
  } catch (error) {
    console.error('Error in updateReportStatus:', error);
    res.status(500).json({ error: error.message });
  }
};

// Rate report (Admin only)
const rateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body; // 1-5 stars
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    const report = await prisma.report.findUnique({
      where: { id },
      include: { user: true }
    });
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    const updatedReport = await prisma.report.update({
      where: { id },
      data: { adminRating: rating },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profilePicture: true
          }
        },
        images: true,
        likes: true,
        comments: true
      }
    });
    
    // Create notification for rating
    await prisma.notification.create({
      data: {
        type: 'report_rated',
        message: `Your report has been rated ${rating} stars by admin`,
        userId: report.userId,
        reportId: report.id
      }
    });
    
    res.json(updatedReport);
  } catch (error) {
    console.error('Error in rateReport:', error);
    res.status(500).json({ error: error.message });
  }
};

// Rate report by user (Student rates their own report)
const rateReportByUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body; // 1-5 stars
    const { clerkId } = req.user;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get report
    const report = await prisma.report.findUnique({
      where: { id },
      include: { user: true }
    });
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    // Check if user owns this report
    if (report.userId !== user.id) {
      return res.status(403).json({ error: 'You can only rate your own reports' });
    }
    
    // Check if report is done
    if (report.status !== 'done') {
      return res.status(400).json({ error: 'You can only rate reports that are marked as done' });
    }
    
    const updatedReport = await prisma.report.update({
      where: { id },
      data: { userRating: rating },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profilePicture: true
          }
        },
        images: true,
        likes: true,
        comments: true
      }
    });
    
    res.json(updatedReport);
  } catch (error) {
    console.error('Error in rateReportByUser:', error);
    res.status(500).json({ error: error.message });
  }
};

// Approve or reject report (Admin only)
const approveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved, rejectionReason } = req.body;
    
    const report = await prisma.report.findUnique({
      where: { id },
      include: { user: true }
    });
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    const updatedReport = await prisma.report.update({
      where: { id },
      data: { isApproved: isApproved === true },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profilePicture: true
          }
        },
        images: true,
        likes: true,
        comments: true
      }
    });
    
    // Create notification for user
    await prisma.notification.create({
      data: {
        type: isApproved ? 'report_approved' : 'report_rejected',
        message: isApproved 
          ? 'Your report has been approved and is now visible to everyone!'
          : (rejectionReason || 'Your report has been rejected by admin.'),
        userId: report.userId,
        reportId: report.id
      }
    });
    
    res.json(updatedReport);
  } catch (error) {
    console.error('Error in approveReport:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get pending reports (Admin only - reports waiting for approval)
const getPendingReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: {
        isApproved: false
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profilePicture: true
          }
        },
        images: true,
        likes: true,
        comments: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(reports);
  } catch (error) {
    console.error('Error in getPendingReports:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createReport,
  getAllReports,
  getReportById,
  getReportsByUser,
  updateReportStatus,
  rateReport,
  rateReportByUser,
  approveReport,
  getPendingReports
};

