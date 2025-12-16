const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get or create user from Clerk
const getOrCreateUser = async (req, res) => {
  try {
    // Get data from body first, fallback to req.user (from headers)
    const { clerkId, email, username, fullName, profilePicture } = req.body || req.user;
    
    if (!clerkId) {
      return res.status(400).json({ error: 'clerkId is required' });
    }
    
    let user = await prisma.user.findUnique({
      where: { clerkId }
    });
    
    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          clerkId,
          email: email || `${clerkId}@example.com`,
          username: username || email?.split('@')[0] || clerkId,
          fullName: fullName || username || email?.split('@')[0] || 'User',
          profilePicture: profilePicture || null
        }
      });
    } else {
      // Update user info if needed
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

// Get user by ID
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

// Update user profile
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
        profilePicture: profilePicture || user.profilePicture
      }
    });
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const { clerkId } = req.user;
    
    const user = await prisma.user.findUnique({
      where: { clerkId },
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
    console.error('Error in getCurrentUser:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getOrCreateUser,
  getUserById,
  updateUser,
  getCurrentUser
};

