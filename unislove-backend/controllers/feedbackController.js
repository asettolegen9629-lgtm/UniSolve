const prisma = require('../prismaClient');
const { ensureUserRecord } = require('../utils/ensureUser');
const createFeedback = async (req, res) => {
  try {
    const clerkId = req.user?.clerkId || req.headers['x-clerk-user-id'];
    if (!clerkId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const { message, type, reportId } = req.body;
    if (!message || !type) {
      return res.status(400).json({ error: 'Message and type are required' });
    }
    const validTypes = ['problem_solved', 'still_have_question', 'help_again'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid feedback type' });
    }
    const user = await ensureUserRecord(req);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.isAdmin) {
      return res.status(403).json({ 
        error: 'Admins cannot create feedback' 
      });
    }
    const feedback = await prisma.feedback.create({
      data: {
        message,
        type,
        userId: user.id,
        reportId: reportId || null,
      },
      include: {
        report: {
          select: {
            id: true,
            description: true,
            category: true,
          }
        }
      }
    });
    res.json(feedback);
  } catch (error) {
    console.error('Error in createFeedback:', error);
    res.status(500).json({ error: error.message });
  }
};
const getAllFeedbacksForAdmin = async (req, res) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        report: {
          select: {
            id: true,
            description: true,
            category: true,
            status: true,
          }
        }
      }
    });
    const anonymousFeedbacks = feedbacks.map(feedback => ({
      id: feedback.id,
      message: feedback.message,
      type: feedback.type,
      reportId: feedback.reportId,
      report: feedback.report,
      isRead: feedback.isRead,
      createdAt: feedback.createdAt,
    }));
    res.json(anonymousFeedbacks);
  } catch (error) {
    console.error('Error in getAllFeedbacksForAdmin:', error);
    res.status(500).json({ error: error.message });
  }
};
const getFeedbackStatistics = async (req, res) => {
  try {
    const [problemSolved, stillHaveQuestion, helpAgain, total] = await Promise.all([
      prisma.feedback.count({ where: { type: 'problem_solved' } }),
      prisma.feedback.count({ where: { type: 'still_have_question' } }),
      prisma.feedback.count({ where: { type: 'help_again' } }),
      prisma.feedback.count(),
    ]);
    res.json({
      problemSolved,
      stillHaveQuestion,
      helpAgain,
      total,
    });
  } catch (error) {
    console.error('Error in getFeedbackStatistics:', error);
    res.status(500).json({ error: error.message });
  }
};
const getFeedbacksByReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const clerkId = req.user?.clerkId || req.headers['x-clerk-user-id'];
    if (!clerkId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const user = await ensureUserRecord(req);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const feedbacks = await prisma.feedback.findMany({
      where: {
        reportId,
userId: user.id,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(feedbacks);
  } catch (error) {
    console.error('Error in getFeedbacksByReport:', error);
    res.status(500).json({ error: error.message });
  }
};
const markFeedbackAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await prisma.feedback.update({
      where: { id },
      data: { isRead: true },
    });
    res.json(feedback);
  } catch (error) {
    console.error('Error in markFeedbackAsRead:', error);
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  createFeedback,
  getAllFeedbacksForAdmin,
  getFeedbackStatistics,
  getFeedbacksByReport,
  markFeedbackAsRead,
}