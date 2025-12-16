const authenticateUser = async (req, res, next) => {
  try {
    const clerkUserId = req.headers['x-clerk-user-id'];
    const clerkEmail = req.headers['x-clerk-email'];
    const clerkUsername = req.headers['x-clerk-username'];
    const clerkFullName = req.headers['x-clerk-full-name'];
    
    if (!clerkUserId) {
      return res.status(401).json({ error: 'User ID not provided' });
    }
    
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

const isAdmin = async (req, res, next) => {
  try {
    const prisma = require('../prismaClient');
    
    console.log('isAdmin check - clerkId:', req.user?.clerkId);
    
    const user = await prisma.user.findUnique({
      where: { clerkId: req.user.clerkId }
    });
    
    console.log('isAdmin check - user found:', user ? 'YES' : 'NO');
    console.log('isAdmin check - isAdmin:', user?.isAdmin);
    
    if (!user || !user.isAdmin) {
      console.log('isAdmin check - ACCESS DENIED');
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    console.log('isAdmin check - ACCESS GRANTED');
    req.user.dbUser = user;
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Error checking admin status' });
  }
};

module.exports = { authenticateUser, isAdmin };

