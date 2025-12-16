const prisma = require('../prismaClient');
const getAdminNotifications = async (req, res) => {
  try {
    const admins = await prisma.user.findMany({
      where: { isAdmin: true },
      select: { id: true }
    });
    if (admins.length === 0) {
      return res.json([]);
    }
    const adminIds = admins.map(a => a.id);
    const notifications = await prisma.notification.findMany({
      where: {
        userId: { in: adminIds },
type: 'new_report'
      },
      include: {
        report: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                profilePicture: true
              }
            },
            images: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    const feedbacks = await prisma.feedback.findMany({
      where: {
isRead: false
      },
      include: {
        report: {
          select: {
            id: true,
            description: true,
            category: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    const feedbackNotifications = feedbacks.map(feedback => ({
      id: `feedback_${feedback.id}`,
      type: 'feedback_received',
      message: `New feedback: ${feedback.type === 'problem_solved' ? 'Problem solved' : feedback.type === 'still_have_question' ? 'I still have question' : 'Help me again, please'}`,
      isRead: feedback.isRead,
      createdAt: feedback.createdAt,
      report: feedback.report,
      feedback: {
        id: feedback.id,
        message: feedback.message,
        type: feedback.type
      }
    }));
    const allNotifications = [...notifications, ...feedbackNotifications].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.json(allNotifications);
  } catch (error) {
    console.error('Error in getAdminNotifications:', error);
    res.status(500).json({ error: error.message });
  }
};
const markAdminNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (id.startsWith('feedback_')) {
      const feedbackId = id.replace('feedback_', '');
      const feedback = await prisma.feedback.update({
        where: { id: feedbackId },
        data: { isRead: true }
      });
      return res.json({ success: true, feedback });
    }
    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
    res.json(notification);
  } catch (error) {
    console.error('Error in markAdminNotificationAsRead:', error);
    res.status(500).json({ error: error.message });
  }
};
const getAdminUnreadCount = async (req, res) => {
  try {
    const admins = await prisma.user.findMany({
      where: { isAdmin: true },
      select: { id: true }
    });
    if (admins.length === 0) {
      return res.json({ count: 0 });
    }
    const adminIds = admins.map(a => a.id);
    const notificationCount = await prisma.notification.count({
      where: {
        userId: { in: adminIds },
        type: 'new_report',
        isRead: false
      }
    });
    const feedbackCount = await prisma.feedback.count({
      where: {
        isRead: false
      }
    });
    const totalCount = notificationCount + feedbackCount;
    res.json({ count: totalCount });
  } catch (error) {
    console.error('Error in getAdminUnreadCount:', error);
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  getAdminNotifications,
  markAdminNotificationAsRead,
  getAdminUnreadCount,
};