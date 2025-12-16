const prisma = require('../prismaClient');
const createComment = async (req, res) => {
  try {
    const { clerkId } = req.user;
    const { reportId } = req.params;
    const { content, parentCommentId } = req.body;
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.isAdmin) {
      return res.status(403).json({ 
        error: 'Admins cannot create comments through the regular interface. Please use the admin panel.' 
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
      return res.status(403).json({ error: 'This report is pending approval. You cannot comment on it yet.' });
    }
    let parentComment = null;
    if (parentCommentId) {
      parentComment = await prisma.comment.findUnique({
        where: { id: parentCommentId },
        include: { user: true }
      });
      if (!parentComment) {
        return res.status(404).json({ error: 'Parent comment not found' });
      }
    }
    const comment = await prisma.comment.create({
      data: {
        content,
        userId: user.id,
        reportId: report.id,
        parentCommentId: parentCommentId || null
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
        likes: {
          include: {
            user: {
              select: {
                id: true
              }
            }
          }
        },
        parentComment: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true
              }
            }
          }
        }
      }
    });
    if (parentCommentId && parentComment) {
      if (parentComment.userId !== user.id) {
        await prisma.notification.create({
          data: {
            type: 'comment_replied',
            message: `${user.fullName || user.username} replied to your comment`,
            userId: parentComment.userId,
            reportId: report.id,
            commentId: comment.id
          }
        });
      }
    } else {
      if (report.userId !== user.id) {
        await prisma.notification.create({
          data: {
            type: 'report_commented',
            message: `${user.fullName || user.username} commented on your report`,
            userId: report.userId,
            reportId: report.id,
            commentId: comment.id
          }
        });
      }
    }
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error in createComment:', error);
    res.status(500).json({ error: error.message });
  }
};
const getCommentsByReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const allComments = await prisma.comment.findMany({
      where: { reportId },
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
        },
        parentComment: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true
              }
            }
          }
        },
        replies: {
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
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    const topLevelComments = allComments.filter(c => !c.parentCommentId);
    res.json(topLevelComments);
  } catch (error) {
    console.error('Error in getCommentsByReport:', error);
    res.status(500).json({ error: error.message });
  }
};
const deleteComment = async (req, res) => {
  try {
    const { clerkId } = req.user;
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const comment = await prisma.comment.findUnique({
      where: { id }
    });
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    if (comment.userId !== user.id) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }
    await prisma.comment.delete({
      where: { id }
    });
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error in deleteComment:', error);
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  createComment,
  getCommentsByReport,
  deleteComment
};