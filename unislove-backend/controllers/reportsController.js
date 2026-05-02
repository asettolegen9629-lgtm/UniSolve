const prisma = require('../prismaClient');
const { ensureUserRecord } = require('../utils/ensureUser');
const createReport = async (req, res) => {
  try {
    const clerkId = req.user?.clerkId || req.headers['x-clerk-user-id'] || 'guest_default';
    const { description, category } = req.body;
    const files = req.files || [];
    let user = await prisma.user.findUnique({ where: { clerkId } });
    if (user && user.isAdmin) {
      return res.status(403).json({ 
        error: 'Admins cannot create reports through the regular interface. Please use the admin panel.' 
      });
    }
    if (!user) {
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
    const report = await prisma.report.create({
      data: {
        description,
        category,
        userId: user.id,
        isApproved: false,
        images: {
          create: files.map(file => ({
            url: `/uploads/${file.filename}`
          }))
        }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profilePicture: true,
            email: true
          }
        },
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
    console.log(`New report created: ID=${report.id}, User=${user.fullName}, isApproved=${report.isApproved}`);
    await prisma.notification.create({
      data: {
        type: 'report_pending',
        message: 'Your report has been submitted and is waiting for admin approval.',
        userId: user.id,
        reportId: report.id
      }
    });
    const admins = await prisma.user.findMany({
      where: { isAdmin: true },
      select: { id: true }
    });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          type: 'new_report',
          message: `New report from ${user.fullName || user.username}: "${report.description.substring(0, 50)}${report.description.length > 50 ? '...' : ''}" - Category: ${report.category}`,
          userId: admin.id,
          reportId: report.id
        }
      });
    }
    res.status(201).json(report);
  } catch (error) {
    console.error('Error in createReport:', error);
    res.status(500).json({ error: error.message });
  }
};
const getAllReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: {
isApproved: true
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
    if (!report.isApproved) {
      return res.status(403).json({ error: 'This report is pending approval and is not yet visible' });
    }
    res.json(report);
  } catch (error) {
    console.error('Error in getReportById:', error);
    res.status(500).json({ error: error.message });
  }
};
const getReportsByUser = async (req, res) => {
  try {
    const user = await ensureUserRecord(req);
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
    if (status && status !== report.status) {
      const statusMessages = {
        'in-progress': 'Your report is now being worked on. We are actively addressing your issue.',
        'done': 'Great news! Your report has been resolved and marked as done.'
      };
      await prisma.notification.create({
        data: {
          type: 'status_changed',
          message: statusMessages[status] || `Your report status has been changed to "${status}"`,
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
const rateReport = async (req, res) => {
  try {
    const { id } = req.params;
const { rating } = req.body;
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
const rateReportByUser = async (req, res) => {
  try {
    const { id } = req.params;
const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    const user = await ensureUserRecord(req);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const report = await prisma.report.findUnique({
      where: { id },
      include: { user: true }
    });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    if (report.userId !== user.id) {
      return res.status(403).json({ error: 'You can only rate your own reports' });
    }
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
const getAllReportsForAdmin = async (req, res) => {
  try {
    console.log('getAllReportsForAdmin called');
    const reports = await prisma.report.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profilePicture: true,
            email: true
          }
        },
        images: true,
        likes: true,
        comments: true
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`getAllReportsForAdmin: Found ${reports.length} reports`);
    console.log(`Pending: ${reports.filter(r => !r.isApproved).length}, Approved: ${reports.filter(r => r.isApproved).length}`);
    res.json(reports);
  } catch (error) {
    console.error('Error in getAllReportsForAdmin:', error);
    res.status(500).json({ error: error.message });
  }
};
const getAdminStatistics = async (req, res) => {
  try {
    const [
      totalReports,
      pendingReports,
      approvedReports,
      inProgressReports,
      doneReports,
      verifiedReports,
      totalUsers,
      totalComments,
      totalLikes,
      reportsByCategory
    ] = await Promise.all([
      prisma.report.count(),
      prisma.report.count({ where: { isApproved: false } }),
      prisma.report.count({ where: { isApproved: true } }),
      prisma.report.count({ where: { isApproved: true, status: 'in-progress' } }),
      prisma.report.count({ where: { isApproved: true, status: 'done' } }),
      prisma.report.count({ where: { isVerified: true } }),
      prisma.user.count(),
      prisma.comment.count(),
      prisma.reportLike.count(),
      prisma.report.groupBy({
        by: ['category'],
        _count: {
          category: true
        }
      })
    ]);
    res.json({
      reports: {
        total: totalReports,
        pending: pendingReports,
        approved: approvedReports,
        inProgress: inProgressReports,
        done: doneReports,
        verified: verifiedReports
      },
      users: {
        total: totalUsers
      },
      engagement: {
        comments: totalComments,
        likes: totalLikes
      },
      byCategory: reportsByCategory.map(item => ({
        category: item.category || 'Uncategorized',
        count: item._count.category
      }))
    });
  } catch (error) {
    console.error('Error in getAdminStatistics:', error);
    res.status(500).json({ error: error.message });
  }
};
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        images: true,
        comments: true,
        likes: true
      }
    });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    await prisma.report.delete({
      where: { id }
    });
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error in deleteReport:', error);
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
  getPendingReports,
  getAllReportsForAdmin,
  getAdminStatistics,
  deleteReport
};