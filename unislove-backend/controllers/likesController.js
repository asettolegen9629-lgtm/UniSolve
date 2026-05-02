const prisma = require('../prismaClient');
const { ensureUserRecord } = require('../utils/ensureUser');
const toggleReportLike = async (req, res) => {
  try {
    const { reportId } = req.params;
    const user = await ensureUserRecord(req);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.isAdmin) {
      return res.status(403).json({ 
        error: 'Admins cannot like reports through the regular interface.' 
      });
    }
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { user: true }
    });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    if (!report.isApproved) {
      return res.status(403).json({ error: 'This report is pending approval. You cannot like it yet.' });
    }
    const existingLike = await prisma.reportLike.findUnique({
      where: {
        userId_reportId: {
          userId: user.id,
          reportId: report.id
        }
      }
    });
    if (existingLike) {
      await prisma.reportLike.delete({
        where: {
          userId_reportId: {
            userId: user.id,
            reportId: report.id
          }
        }
      });
      res.json({ liked: false, message: 'Report unliked' });
    } else {
      await prisma.reportLike.create({
        data: {
          userId: user.id,
          reportId: report.id
        }
      });
      if (report.userId !== user.id) {
        await prisma.notification.create({
          data: {
            type: 'report_liked',
            message: `${user.fullName || user.username} liked your report`,
            userId: report.userId,
            reportId: report.id
          }
        });
      }
      res.json({ liked: true, message: 'Report liked' });
    }
  } catch (error) {
    console.error('Error in toggleReportLike:', error);
    res.status(500).json({ error: error.message });
  }
};
const toggleCommentLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    const user = await ensureUserRecord(req);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.isAdmin) {
      return res.status(403).json({ 
        error: 'Admins cannot like comments through the regular interface.' 
      });
    }
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { user: true }
    });
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: user.id,
          commentId: comment.id
        }
      }
    });
    if (existingLike) {
      await prisma.commentLike.delete({
        where: {
          userId_commentId: {
            userId: user.id,
            commentId: comment.id
          }
        }
      });
      res.json({ liked: false, message: 'Comment unliked' });
    } else {
      await prisma.commentLike.create({
        data: {
          userId: user.id,
          commentId: comment.id
        }
      });
      if (comment.userId !== user.id) {
        await prisma.notification.create({
          data: {
            type: 'comment_liked',
            message: `${user.fullName || user.username} liked your comment`,
            userId: comment.userId,
            commentId: comment.id,
            reportId: comment.reportId
          }
        });
      }
      res.json({ liked: true, message: 'Comment liked' });
    }
  } catch (error) {
    console.error('Error in toggleCommentLike:', error);
    res.status(500).json({ error: error.message });
  }
};
const getReportLikes = async (req, res) => {
  try {
    const { reportId } = req.params;
    const likes = await prisma.reportLike.findMany({
      where: { reportId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        }
      }
    });
    res.json(likes);
  } catch (error) {
    console.error('Error in getReportLikes:', error);
    res.status(500).json({ error: error.message });
  }
};
const getCommentLikes = async (req, res) => {
  try {
    const { commentId } = req.params;
    const likes = await prisma.commentLike.findMany({
      where: { commentId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        }
      }
    });
    res.json(likes);
  } catch (error) {
    console.error('Error in getCommentLikes:', error);
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  toggleReportLike,
  toggleCommentLike,
  getReportLikes,
  getCommentLikes
};