const prisma = require('../prismaClient');
const getOrCreateUser = async (req, res) => {
  try {
    const { clerkId, email, username, fullName, profilePicture } = req.body;
    if (!clerkId || !email) {
      return res.status(400).json({ error: 'clerkId and email are required' });
    }
    let user = await prisma.user.findUnique({
      where: { clerkId }
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId,
          email,
          username: username || email.split('@')[0],
          fullName: fullName || username || email.split('@')[0],
          profilePicture: profilePicture || null
        }
      });
    } else {
      user = await prisma.user.update({
        where: { clerkId },
        data: {
          email: email || user.email,
          username: username || user.username,
          fullName: fullName || user.fullName,
          profilePicture: profilePicture || user.profilePicture
        }
      });
    }
    res.json(user);
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    res.status(500).json({ error: error.message });
  }
};
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        reports: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ error: error.message });
  }
};
const updateUser = async (req, res) => {
  try {
    const { clerkId } = req.user;
    const { email, username, fullName, profilePicture } = req.body;
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const updatedUser = await prisma.user.update({
      where: { clerkId },
      data: {
        email: email || user.email,
        username: username || user.username,
        fullName: fullName || user.fullName,
        profilePicture: profilePicture !== undefined ? profilePicture : user.profilePicture
      }
    });
    res.json(updatedUser);
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(500).json({ error: error.message });
  }
};
const getCurrentUser = async (req, res) => {
  try {
    const { clerkId } = req.user;
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        username: true,
        fullName: true,
        profilePicture: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        reports: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            description: true,
            category: true,
            status: true,
            createdAt: true
          }
        }
      }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('getCurrentUser - Returning user with isAdmin:', user.isAdmin);
    res.json(user);
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    res.status(500).json({ error: error.message });
  }
};
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            reports: true,
            comments: true,
            reportLikes: true,
            commentLikes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ error: error.message });
  }
};
const makeUserAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body;
    const user = await prisma.user.findUnique({
      where: { id }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isAdmin: isAdmin === true }
    });
    res.json(updatedUser);
  } catch (error) {
    console.error('Error in makeUserAdmin:', error);
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  getOrCreateUser,
  getUserById,
  updateUser,
  getCurrentUser,
  getAllUsers,
  makeUserAdmin
};