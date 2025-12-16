// Authentication middleware for Clerk integration
// This middleware extracts user info from Clerk custom headers

const authenticateUser = async (req, res, next) => {
  try {
    // Extract user info from custom Clerk headers
    const clerkUserId = req.headers['x-clerk-user-id'];
    const clerkEmail = req.headers['x-clerk-email'];
    const clerkUsername = req.headers['x-clerk-username'];
    const clerkFullName = req.headers['x-clerk-full-name'];
    
    if (!clerkUserId) {
      return res.status(401).json({ error: 'User ID not provided' });
    }
    
    // Attach user info to request
    req.user = {
      clerkId: clerkUserId,
      email: clerkEmail,
      username: clerkUsername,
      fullName: clerkFullName
    };
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const user = await prisma.user.findUnique({
      where: { clerkId: req.user.clerkId }
    });
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.user.dbUser = user;
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Error checking admin status' });
  }
};

module.exports = { authenticateUser, isAdmin };

