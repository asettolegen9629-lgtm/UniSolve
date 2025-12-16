const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all notifications for current user
const getNotifications = async (req, res) => {
  try {
    const { clerkId } = req.user;
    
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to 50 most recent
      include: {
        report: {
          select: {
            id: true,
            description: true,
            category: true,
            status: true,
            isApproved: true,
            isVerified: true,
            createdAt: true,
            images: {
              select: {
                id: true,
                url: true
              }
            }
          }
        },
        comment: {
          select: {
            id: true,
            content: true
          }
        }
      }
    });
    
    res.json(notifications);
  } catch (error) {
    console.error('Error in getNotifications:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { clerkId } = req.user;
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const notification = await prisma.notification.findUnique({
      where: { id }
    });
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    if (notification.userId !== user.id) {
      return res.status(403).json({ error: 'You can only mark your own notifications as read' });
    }
    
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
    
    res.json(updatedNotification);
  } catch (error) {
    console.error('Error in markAsRead:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const { clerkId } = req.user;
    
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false
      },
      data: {
        isRead: true
      }
    });
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    const { clerkId } = req.user;
    
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const count = await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false
      }
    });
    
    res.json({ count });
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
};

