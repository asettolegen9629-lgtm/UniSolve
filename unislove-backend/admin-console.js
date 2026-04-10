#!/usr/bin/env node

/**
 * UniSolve Admin Console
 * Terminal-based admin interface for managing reports, users, and system
 */

// Load environment variables
require('dotenv').config();
//
// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Error: DATABASE_URL not found!');
  console.log('\nPlease create a .env file in the unislove-backend directory with:');
  console.log('DATABASE_URL="postgresql://username:password@localhost:5432/unislove_db?schema=public"');
  console.log('PORT=3000\n');
  console.log('See SETUP_ENV.md for more details.\n');
  process.exit(1);
}

const readline = require('readline');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function printHeader() {
  console.clear();
  console.log(colorize('╔═══════════════════════════════════════════════════════╗', 'cyan'));
  console.log(colorize('║', 'cyan') + colorize('           UNISOLVE ADMIN CONSOLE', 'bright') + colorize('                  ║', 'cyan'));
  console.log(colorize('╚═══════════════════════════════════════════════════════╝', 'cyan'));
  console.log('');
}

function printMenu() {
  console.log(colorize('Main Menu:', 'bright'));
  console.log('1. View all reports (includes ALL: approved + pending)');
  console.log('2. View report by ID');
  console.log('3. View pending reports only (need approval)');
  console.log('4. Approve/Reject report');
  console.log('5. Verify report (mark as verified)');
  console.log('6. Update report status');
  console.log('7. Rate report (1-5 stars)');
  console.log('8. View all users');
  console.log('9. Make user admin');
  console.log('10. View statistics');
  console.log('11. Delete report');
  console.log('0. Exit');
  console.log('');
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// 1. View all reports
async function viewAllReports() {
  try {
    console.log(colorize('\n⏳ Loading all reports...', 'yellow'));
    
    // Get ALL reports without any filters
    const reports = await prisma.report.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true
          }
        },
        images: true,
        likes: true,
        comments: true
      },
      // No where clause - get ALL reports
      orderBy: { createdAt: 'desc' }
    });

    const pendingCount = reports.filter(r => !r.isApproved).length;
    const approvedCount = reports.filter(r => r.isApproved).length;
    
    console.clear();
    console.log(colorize(`\n📋 ALL REPORTS (No Filters Applied)`, 'bright'));
    console.log(colorize(`═══════════════════════════════════════════════════════`, 'cyan'));
    console.log(colorize(`Total Reports: ${reports.length}`, 'bright'));
    console.log(`   ${colorize(`✓ Approved: ${approvedCount}`, 'green')} | ${colorize(`⏳ Pending: ${pendingCount}`, 'yellow')}`);
    console.log(colorize(`═══════════════════════════════════════════════════════`, 'cyan'));
    
    if (reports.length === 0) {
      console.log(colorize('No reports found.', 'yellow'));
    } else {
      // Predefined categories list
      const predefinedCategories = [
        'Technical Issues',
        'WiFi/Internet',
        'Cleaning/Maintenance',
        'Lighting',
        'Furniture',
        'Safety/Security',
        'Heating/Cooling',
        'Water/Plumbing',
        'Cafeteria/Food',
        'Parking',
        'Other'
      ];
      
      // Show pending reports first, then approved
      // Within each group, show oldest first (so oldest pending are seen first)
      const sortedReports = [...reports].sort((a, b) => {
        if (a.isApproved !== b.isApproved) {
          return a.isApproved ? 1 : -1; // Pending first
        }
        return new Date(a.createdAt) - new Date(b.createdAt); // Oldest first (newest last)
      });
      
      if (pendingCount > 0) {
        console.log(colorize(`\n⏳ PENDING REPORTS (Need Approval) - ${pendingCount}`, 'yellow'));
        console.log('─'.repeat(80));
      }
      
      sortedReports.forEach((report, index) => {
        const category = report.category || 'Uncategorized';
        const isPredefinedCategory = predefinedCategories.includes(category);
        const categoryDisplay = isPredefinedCategory 
          ? colorize(`[${category}]`, 'green')
          : colorize(`[${category}]`, 'yellow');
        
        // Check if report is new (created in last 24 hours)
        const isNew = new Date() - new Date(report.createdAt) < 24 * 60 * 60 * 1000;
        const newBadge = isNew ? colorize(' 🆕 NEW', 'bright') : '';
        
        // Add separator between pending and approved
        if (index > 0 && report.isApproved && !sortedReports[index - 1].isApproved) {
          console.log(colorize(`\n✓ APPROVED REPORTS - ${approvedCount}`, 'green'));
          console.log('─'.repeat(80));
        }
        
        console.log(colorize(`\n${index + 1}. Report ID: ${report.id}`, 'cyan') + newBadge);
        console.log(`   Description: ${report.description || 'No description'}`);
        console.log(`   Category: ${categoryDisplay} ${!isPredefinedCategory ? colorize('(Custom)', 'yellow') : ''}`);
        console.log(`   Approved: ${report.isApproved ? colorize('✓ Yes', 'green') : colorize('✗ No (Pending)', 'yellow')}`);
        console.log(`   Status: ${colorize(report.status || 'in-progress', report.status === 'done' ? 'green' : 'yellow')}`);
        console.log(`   Verified: ${report.isVerified ? colorize('✓ Yes', 'green') : colorize('✗ No', 'red')}`);
        console.log(`   Admin Rating: ${report.adminRating ? '⭐'.repeat(report.adminRating) : 'Not rated'}`);
        console.log(`   User Rating: ${report.userRating ? '⭐'.repeat(report.userRating) : 'Not rated'}`);
        console.log(`   Created: ${colorize(new Date(report.createdAt).toLocaleString(), 'blue')}`);
        const userName = report.user?.fullName || 'Unknown';
        const userUsername = report.user?.username || 'unknown';
        console.log(`   User: ${userName} (@${userUsername})`);
        console.log(`   Images: ${report.images?.length || 0}`);
        console.log(`   Likes: ${report.likes?.length || 0}`);
        console.log(`   Comments: ${report.comments?.length || 0}`);
      });
    }
    
    await question('\nPress Enter to continue...');
  } catch (error) {
    console.error(colorize('Error:', 'red'), error.message);
    await question('\nPress Enter to continue...');
  }
}

// 2. View report by ID
async function viewReportById() {
  try {
    const id = await question('Enter Report ID: ');
    
    if (!id || id.trim() === '') {
      console.log(colorize('Report ID cannot be empty!', 'red'));
      await question('\nPress Enter to continue...');
      return;
    }
    
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true
          }
        },
        images: true,
        likes: {
          include: {
            user: {
              select: {
                username: true,
                fullName: true
              }
            }
          }
        },
        comments: {
          include: {
            user: {
              select: {
                username: true,
                fullName: true
              }
            },
            likes: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!report) {
      console.log(colorize('Report not found!', 'red'));
      await question('\nPress Enter to continue...');
      return;
    }

    // Predefined categories list
    const predefinedCategories = [
      'Technical Issues',
      'WiFi/Internet',
      'Cleaning/Maintenance',
      'Lighting',
      'Furniture',
      'Safety/Security',
      'Heating/Cooling',
      'Water/Plumbing',
      'Cafeteria/Food',
      'Parking',
      'Other'
    ];
    
    const category = report.category || 'Uncategorized';
    const isPredefinedCategory = predefinedCategories.includes(category);
    const categoryDisplay = isPredefinedCategory 
      ? colorize(`[${category}]`, 'green')
      : colorize(`[${category}]`, 'yellow');
    
    console.log(colorize('\n📋 Report Details:', 'bright'));
    console.log('─'.repeat(80));
    console.log(`ID: ${report.id}`);
    console.log(`Description: ${report.description}`);
    console.log(`Category: ${categoryDisplay} ${!isPredefinedCategory ? colorize('(Custom)', 'yellow') : ''}`);
    console.log(`Status: ${colorize(report.status, report.status === 'done' ? 'green' : 'yellow')}`);
    console.log(`Verified: ${report.isVerified ? colorize('✓ Yes', 'green') : colorize('✗ No', 'red')}`);
    console.log(`Admin Rating: ${report.adminRating ? '⭐'.repeat(report.adminRating) : 'Not rated'}`);
    console.log(`Created: ${new Date(report.createdAt).toLocaleString()}`);
    console.log(`Updated: ${new Date(report.updatedAt).toLocaleString()}`);
    const userName = report.user?.fullName || 'Unknown';
    const userUsername = report.user?.username || 'unknown';
    const userEmail = report.user?.email || 'No email';
    console.log(`\nUser: ${userName} (@${userUsername}) - ${userEmail}`);
    console.log(`\nImages (${report.images?.length || 0}):`);
    if (report.images && report.images.length > 0) {
      report.images.forEach((img, i) => {
        console.log(`  ${i + 1}. ${img.url}`);
      });
    } else {
      console.log('  No images.');
    }
    console.log(`\nLikes (${report.likes.length}):`);
    if (report.likes.length > 0) {
      report.likes.forEach((like, i) => {
        const userName = like.user?.fullName || 'Unknown';
        const userUsername = like.user?.username || 'unknown';
        console.log(`  ${i + 1}. ${userName} (@${userUsername})`);
      });
    } else {
      console.log('  No likes yet.');
    }
    console.log(`\nComments (${report.comments.length}):`);
    if (report.comments.length > 0) {
      report.comments.forEach((comment, i) => {
        const userName = comment.user?.fullName || 'Unknown';
        const userUsername = comment.user?.username || 'unknown';
        console.log(`  ${i + 1}. ${userName} (@${userUsername}): ${comment.content}`);
        console.log(`     Likes: ${comment.likes.length} | Created: ${new Date(comment.createdAt).toLocaleString()}`);
      });
    } else {
      console.log('  No comments yet.');
    }
    
    await question('\nPress Enter to continue...');
  } catch (error) {
    console.error(colorize('Error:', 'red'), error.message);
    await question('\nPress Enter to continue...');
  }
}

// 3. View pending reports (need approval)
async function viewPendingReports() {
  try {
    console.log(colorize('\n⏳ Loading pending reports...', 'yellow'));
    
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
            email: true
          }
        },
        images: true,
        likes: true,
        comments: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.clear();
    console.log(colorize(`\n⏳ Pending Reports (Awaiting Approval): ${reports.length}`, 'yellow'));
    console.log('─'.repeat(80));
    
    if (reports.length === 0) {
      console.log(colorize('\n✓ No pending reports. All reports are approved!', 'green'));
    } else {
      // Predefined categories list
      const predefinedCategories = [
        'Technical Issues',
        'WiFi/Internet',
        'Cleaning/Maintenance',
        'Lighting',
        'Furniture',
        'Safety/Security',
        'Heating/Cooling',
        'Water/Plumbing',
        'Cafeteria/Food',
        'Parking',
        'Other'
      ];
      
      reports.forEach((report, index) => {
        const category = report.category || 'Uncategorized';
        const isPredefinedCategory = predefinedCategories.includes(category);
        const categoryDisplay = isPredefinedCategory 
          ? colorize(`[${category}]`, 'green')
          : colorize(`[${category}]`, 'yellow');
        
        console.log(colorize(`\n${index + 1}. Report ID: ${report.id}`, 'cyan'));
        console.log(`   Description: ${report.description || 'No description'}`);
        console.log(`   Category: ${categoryDisplay} ${!isPredefinedCategory ? colorize('(Custom)', 'yellow') : ''}`);
        console.log(`   Status: ${colorize(report.status || 'in-progress', report.status === 'done' ? 'green' : 'yellow')}`);
        console.log(`   Created: ${colorize(new Date(report.createdAt).toLocaleString(), 'blue')}`);
        const userName = report.user?.fullName || 'Unknown';
        const userUsername = report.user?.username || 'unknown';
        console.log(`   User: ${userName} (@${userUsername})`);
        console.log(`   Images: ${report.images?.length || 0}`);
        console.log(colorize('   ⚠️  This report is waiting for approval!', 'yellow'));
      });
    }
    
    await question('\nPress Enter to continue...');
  } catch (error) {
    console.error(colorize('\nError:', 'red'), error.message);
    console.error(error.stack);
    await question('\nPress Enter to continue...');
  }
}

// 4. Approve or reject report
async function approveOrRejectReport() {
  try {
    const id = await question('Enter Report ID: ');
    
    if (!id || id.trim() === '') {
      console.log(colorize('Report ID cannot be empty!', 'red'));
      await question('\nPress Enter to continue...');
      return;
    }
    
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            fullName: true,
            username: true
          }
        },
        images: true
      }
    });

    if (!report) {
      console.log(colorize('Report not found!', 'red'));
      await question('\nPress Enter to continue...');
      return;
    }
    
    // Predefined categories list
    const predefinedCategories = [
      'Technical Issues',
      'WiFi/Internet',
      'Cleaning/Maintenance',
      'Lighting',
      'Furniture',
      'Safety/Security',
      'Heating/Cooling',
      'Water/Plumbing',
      'Cafeteria/Food',
      'Parking',
      'Other'
    ];
    
    const category = report.category || 'Uncategorized';
    const isPredefinedCategory = predefinedCategories.includes(category);
    const categoryDisplay = isPredefinedCategory 
      ? colorize(`[${category}]`, 'green')
      : colorize(`[${category}]`, 'yellow');
    
    console.log(colorize('\n📋 Report Details:', 'bright'));
    console.log('─'.repeat(80));
    console.log(`ID: ${report.id}`);
    console.log(`Description: ${report.description}`);
    console.log(`Category: ${categoryDisplay} ${!isPredefinedCategory ? colorize('(Custom)', 'yellow') : ''}`);
    console.log(`User: ${report.user.fullName} (@${report.user.username})`);
    console.log(`Images: ${report.images.length}`);
    console.log(`Current Status: ${report.isApproved ? colorize('Approved', 'green') : colorize('Pending', 'yellow')}`);
    
    const action = await question('\nApprove or Reject? (approve/reject): ');
    const isApproved = action.toLowerCase() === 'approve' || action.toLowerCase() === 'a';
    
    if (!isApproved && action.toLowerCase() !== 'reject' && action.toLowerCase() !== 'r') {
      console.log(colorize('Invalid action! Use: approve or reject', 'red'));
      await question('\nPress Enter to continue...');
      return;
    }
    
    let rejectionReason = null;
    if (!isApproved) {
      rejectionReason = await question('Enter rejection reason (optional): ');
    }
    
    const updatedReport = await prisma.report.update({
      where: { id },
      data: { isApproved }
    });

    // Create notification
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

    console.log(colorize(`\n✓ Report ${isApproved ? 'approved' : 'rejected'} successfully!`, 'green'));
    console.log(`Report ID: ${updatedReport.id}`);
    console.log(`Status: ${isApproved ? colorize('Approved - Now visible to all users', 'green') : colorize('Rejected - Not visible to users', 'red')}`);
    if (rejectionReason) {
      console.log(`Rejection reason: ${rejectionReason}`);
    }
    
    await question('\nPress Enter to continue...');
  } catch (error) {
    console.error(colorize('Error:', 'red'), error.message);
    if (error.code === 'P2025') {
      console.log(colorize('Report not found!', 'red'));
    }
    await question('\nPress Enter to continue...');
  }
}

// 5. Verify report
async function verifyReport() {
  try {
    const id = await question('Enter Report ID to verify: ');
    
    if (!id || id.trim() === '') {
      console.log(colorize('Report ID cannot be empty!', 'red'));
      await question('\nPress Enter to continue...');
      return;
    }
    
    // Check if report exists
    const existingReport = await prisma.report.findUnique({
      where: { id }
    });
    
    if (!existingReport) {
      console.log(colorize('Report not found!', 'red'));
      await question('\nPress Enter to continue...');
      return;
    }
    
    const verify = await question('Verify? (yes/no): ');
    const isVerified = verify.toLowerCase() === 'yes' || verify.toLowerCase() === 'y';
    
    const report = await prisma.report.update({
      where: { id },
      data: { isVerified },
      include: {
        user: {
          select: {
            fullName: true,
            username: true
          }
        }
      }
    });

    console.log(colorize(`\n✓ Report ${isVerified ? 'verified' : 'unverified'} successfully!`, 'green'));
    console.log(`Report ID: ${report.id}`);
    console.log(`Description: ${report.description}`);
    console.log(`User: ${report.user.fullName} (@${report.user.username})`);
    console.log(`Status: ${report.isVerified ? colorize('Verified', 'green') : colorize('Not Verified', 'red')}`);
    
    await question('\nPress Enter to continue...');
  } catch (error) {
    console.error(colorize('Error:', 'red'), error.message);
    if (error.code === 'P2025') {
      console.log(colorize('Report not found!', 'red'));
    }
    await question('\nPress Enter to continue...');
  }
}

// 6. Update report status
async function updateReportStatus() {
  try {
    const id = await question('Enter Report ID: ');
    
    if (!id || id.trim() === '') {
      console.log(colorize('Report ID cannot be empty!', 'red'));
      await question('\nPress Enter to continue...');
      return;
    }
    
    // Check if report exists
    const existingReport = await prisma.report.findUnique({
      where: { id },
      include: { user: true }
    });
    
    if (!existingReport) {
      console.log(colorize('Report not found!', 'red'));
      await question('\nPress Enter to continue...');
      return;
    }
    
    console.log('Status options: in-progress, done');
    const status = await question('Enter new status: ');
    
    if (!status || status.trim() === '') {
      console.log(colorize('Status cannot be empty!', 'red'));
      await question('\nPress Enter to continue...');
      return;
    }
    
    if (!['in-progress', 'done'].includes(status.trim())) {
      console.log(colorize('Invalid status! Use: in-progress or done', 'red'));
      await question('\nPress Enter to continue...');
      return;
    }
    
    const trimmedStatus = status.trim();
    
    // Only update if status changed
    if (existingReport.status === trimmedStatus) {
      console.log(colorize(`Report is already "${trimmedStatus}"!`, 'yellow'));
      await question('\nPress Enter to continue...');
      return;
    }
    
    const report = await prisma.report.update({
      where: { id },
      data: { status: trimmedStatus },
      include: {
        user: {
          select: {
            fullName: true,
            username: true
          }
        }
      }
    });

    // Create notification only if status changed
    await prisma.notification.create({
      data: {
        type: 'status_changed',
        message: `Your report status has been changed to "${trimmedStatus}"`,
        userId: report.userId,
        reportId: report.id
      }
    });

    console.log(colorize(`\n✓ Report status updated to "${trimmedStatus}"!`, 'green'));
    console.log(`Report ID: ${report.id}`);
    console.log(`Description: ${report.description}`);
    console.log(`User: ${report.user.fullName} (@${report.user.username})`);
    console.log(`Previous status: ${existingReport.status}`);
    console.log(`New status: ${colorize(trimmedStatus, trimmedStatus === 'done' ? 'green' : 'yellow')}`);
    
    await question('\nPress Enter to continue...');
  } catch (error) {
    console.error(colorize('Error:', 'red'), error.message);
    if (error.code === 'P2025') {
      console.log(colorize('Report not found!', 'red'));
    }
    await question('\nPress Enter to continue...');
  }
}

// 7. Rate report
async function rateReport() {
  try {
    const id = await question('Enter Report ID: ');
    
    if (!id || id.trim() === '') {
      console.log(colorize('Report ID cannot be empty!', 'red'));
      await question('\nPress Enter to continue...');
      return;
    }
    
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            fullName: true,
            username: true
          }
        }
      }
    });

    if (!report) {
      console.log(colorize('Report not found!', 'red'));
      await question('\nPress Enter to continue...');
      return;
    }
    
    const ratingInput = await question('Enter rating (1-5 stars): ');
    const rating = parseInt(ratingInput);
    
    if (isNaN(rating) || rating < 1 || rating > 5) {
      console.log(colorize('Invalid rating! Must be a number between 1 and 5', 'red'));
      await question('\nPress Enter to continue...');
      return;
    }
    
    const updatedReport = await prisma.report.update({
      where: { id },
      data: { adminRating: rating },
      include: {
        user: {
          select: {
            fullName: true,
            username: true
          }
        }
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        type: 'report_rated',
        message: `Your report has been rated ${rating} stars by admin`,
        userId: report.userId,
        reportId: report.id
      }
    });

    console.log(colorize(`\n✓ Report rated ${rating} stars!`, 'green'));
    console.log(`Report ID: ${updatedReport.id}`);
    console.log(`Description: ${updatedReport.description}`);
    console.log(`User: ${updatedReport.user.fullName} (@${updatedReport.user.username})`);
    console.log(`Rating: ${'⭐'.repeat(rating)}`);
    if (report.adminRating) {
      console.log(`Previous rating: ${'⭐'.repeat(report.adminRating)}`);
    }
    
    await question('\nPress Enter to continue...');
  } catch (error) {
    console.error(colorize('Error:', 'red'), error.message);
    if (error.code === 'P2025') {
      console.log(colorize('Report not found!', 'red'));
    }
    await question('\nPress Enter to continue...');
  }
}

// 8. View all users
async function viewAllUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        reports: true,
        _count: {
          select: {
            reports: true,
            comments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(colorize(`\n👥 Total Users: ${users.length}`, 'bright'));
    console.log('─'.repeat(80));
    
    users.forEach((user, index) => {
      console.log(colorize(`\n${index + 1}. User ID: ${user.id}`, 'cyan'));
      console.log(`   Name: ${user.fullName}`);
      console.log(`   Username: @${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Admin: ${user.isAdmin ? colorize('✓ Yes', 'green') : colorize('✗ No', 'red')}`);
      console.log(`   Reports: ${user._count.reports}`);
      console.log(`   Comments: ${user._count.comments}`);
      console.log(`   Created: ${new Date(user.createdAt).toLocaleString()}`);
    });
    
    await question('\nPress Enter to continue...');
  } catch (error) {
    console.error(colorize('Error:', 'red'), error.message);
    await question('\nPress Enter to continue...');
  }
}

// 9. Make user admin
async function makeUserAdmin() {
  try {
    const email = await question('Enter user email: ');
    
    if (!email || email.trim() === '') {
      console.log(colorize('Email cannot be empty!', 'red'));
      await question('\nPress Enter to continue...');
      return;
    }
    
    const user = await prisma.user.findUnique({
      where: { email: email.trim() }
    });

    if (!user) {
      console.log(colorize('User not found!', 'red'));
      await question('\nPress Enter to continue...');
      return;
    }
    
    if (user.isAdmin) {
      console.log(colorize('User is already an admin!', 'yellow'));
      console.log(`User: ${user.fullName} (@${user.username})`);
      console.log(`Email: ${user.email}`);
      await question('\nPress Enter to continue...');
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { email: email.trim() },
      data: { isAdmin: true }
    });

    console.log(colorize(`\n✓ User is now an admin!`, 'green'));
    console.log(`User: ${updatedUser.fullName} (@${updatedUser.username})`);
    console.log(`Email: ${updatedUser.email}`);
    console.log(`User ID: ${updatedUser.id}`);
    
    await question('\nPress Enter to continue...');
  } catch (error) {
    console.error(colorize('Error:', 'red'), error.message);
    if (error.code === 'P2025') {
      console.log(colorize('User not found!', 'red'));
    }
    await question('\nPress Enter to continue...');
  }
}

// 10. View statistics
async function viewStatistics() {
  try {
    const [
      totalUsers,
      totalReports,
      totalComments,
      reportLikes,
      commentLikes,
      verifiedReports,
      doneReports,
      inProgressReports,
      ratedReports,
      userRatedReports,
      adminUsers,
      approvedReports,
      pendingReports
    ] = await Promise.all([
      prisma.user.count(),
      prisma.report.count(),
      prisma.comment.count(),
      prisma.reportLike.count(),
      prisma.commentLike.count(),
      prisma.report.count({ where: { isVerified: true } }),
      prisma.report.count({ where: { status: 'done' } }),
      prisma.report.count({ where: { status: 'in-progress' } }),
      prisma.report.count({ where: { adminRating: { not: null } } }),
      prisma.report.count({ where: { userRating: { not: null } } }),
      prisma.user.count({ where: { isAdmin: true } }),
      prisma.report.count({ where: { isApproved: true } }),
      prisma.report.count({ where: { isApproved: false } })
    ]);

    const totalLikes = reportLikes + commentLikes;

    console.log(colorize('\n📊 Statistics', 'bright'));
    console.log('─'.repeat(80));
    console.log(`Total Users: ${colorize(totalUsers, 'cyan')}`);
    console.log(`  - Admins: ${colorize(adminUsers, 'green')}`);
    console.log(`  - Regular Users: ${colorize(totalUsers - adminUsers, 'cyan')}`);
    console.log(`Total Reports: ${colorize(totalReports, 'cyan')}`);
    console.log(`  - Approved: ${colorize(approvedReports, 'green')}`);
    console.log(`  - Pending Approval: ${colorize(pendingReports, 'yellow')}`);
    console.log(`  - Verified: ${colorize(verifiedReports, 'green')}`);
    console.log(`  - Done: ${colorize(doneReports, 'green')}`);
    console.log(`  - In Progress: ${colorize(inProgressReports, 'yellow')}`);
    console.log(`  - Admin Rated: ${colorize(ratedReports, 'cyan')}`);
    console.log(`  - User Rated: ${colorize(userRatedReports, 'cyan')}`);
    console.log(`Total Comments: ${colorize(totalComments, 'cyan')}`);
    console.log(`Total Likes: ${colorize(totalLikes, 'cyan')}`);
    console.log(`  - Report Likes: ${colorize(reportLikes, 'cyan')}`);
    console.log(`  - Comment Likes: ${colorize(commentLikes, 'cyan')}`);
    
    if (totalReports > 0) {
      const verifiedPercentage = ((verifiedReports / totalReports) * 100).toFixed(1);
      const donePercentage = ((doneReports / totalReports) * 100).toFixed(1);
      console.log(`\nPercentages:`);
      console.log(`  - Verified: ${colorize(verifiedPercentage + '%', 'green')}`);
      console.log(`  - Done: ${colorize(donePercentage + '%', 'green')}`);
    }
    
    await question('\nPress Enter to continue...');
  } catch (error) {
    console.error(colorize('Error:', 'red'), error.message);
    await question('\nPress Enter to continue...');
  }
}

// 11. Delete report
async function deleteReport() {
  try {
    const id = await question('Enter Report ID to delete: ');
    
    if (!id || id.trim() === '') {
      console.log(colorize('Report ID cannot be empty!', 'red'));
      await question('\nPress Enter to continue...');
      return;
    }
    
    // Check if report exists
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            fullName: true,
            username: true
          }
        },
        images: true,
        comments: true,
        likes: true
      }
    });
    
    if (!report) {
      console.log(colorize('Report not found!', 'red'));
      await question('\nPress Enter to continue...');
      return;
    }
    
    // Show report details before deletion
    console.log(colorize('\n⚠️  Report to be deleted:', 'yellow'));
    console.log(`ID: ${report.id}`);
    console.log(`Description: ${report.description}`);
    console.log(`User: ${report.user.fullName} (@${report.user.username})`);
    console.log(`Images: ${report.images.length}`);
    console.log(`Comments: ${report.comments.length}`);
    console.log(`Likes: ${report.likes.length}`);
    
    const confirm = await question(colorize('\nAre you sure? This will delete the report and all related data (yes/no): ', 'red'));
    
    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      console.log(colorize('Deletion cancelled.', 'yellow'));
      await question('\nPress Enter to continue...');
      return;
    }
    
    await prisma.report.delete({
      where: { id }
    });

    console.log(colorize(`\n✓ Report deleted successfully!`, 'green'));
    console.log(`Report ID: ${id}`);
    console.log(`Deleted ${report.images.length} images, ${report.comments.length} comments, and ${report.likes.length} likes.`);
    
    await question('\nPress Enter to continue...');
  } catch (error) {
    console.error(colorize('Error:', 'red'), error.message);
    if (error.code === 'P2025') {
      console.log(colorize('Report not found!', 'red'));
    }
    await question('\nPress Enter to continue...');
  }
}

// Main loop
async function main() {
  printHeader();
  printMenu();

  while (true) {
    const choice = await question(colorize('Select an option: ', 'bright'));

    switch (choice) {
      case '1':
        await viewAllReports();
        printHeader();
        printMenu();
        break;
      case '2':
        await viewReportById();
        printHeader();
        printMenu();
        break;
      case '3':
        await viewPendingReports();
        printHeader();
        printMenu();
        break;
      case '4':
        await approveOrRejectReport();
        printHeader();
        printMenu();
        break;
      case '5':
        await verifyReport();
        printHeader();
        printMenu();
        break;
      case '6':
        await updateReportStatus();
        printHeader();
        printMenu();
        break;
      case '7':
        await rateReport();
        printHeader();
        printMenu();
        break;
      case '8':
        await viewAllUsers();
        printHeader();
        printMenu();
        break;
      case '9':
        await makeUserAdmin();
        printHeader();
        printMenu();
        break;
      case '10':
        await viewStatistics();
        printHeader();
        printMenu();
        break;
      case '11':
        await deleteReport();
        printHeader();
        printMenu();
        break;
      case '0':
        console.log(colorize('\n👋 Goodbye!', 'cyan'));
        rl.close();
        await prisma.$disconnect();
        process.exit(0);
      default:
        console.log(colorize('\nInvalid option!', 'red'));
        await question('Press Enter to continue...');
        printHeader();
        printMenu();
    }
  }
}

// Handle errors and cleanup
process.on('SIGINT', async () => {
  console.log(colorize('\n\n👋 Goodbye!', 'cyan'));
  rl.close();
  await prisma.$disconnect();
  process.exit(0);
});

// Start the console
main().catch(async (error) => {
  console.error(colorize('Fatal error:', 'red'), error);
  rl.close();
  await prisma.$disconnect();
  process.exit(1);
});

