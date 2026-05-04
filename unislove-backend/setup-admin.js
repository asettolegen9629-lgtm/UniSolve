const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupAdmin() {
  try {
    const email = process.env.SETUP_ADMIN_EMAIL;
    if (!email || !String(email).trim()) {
      console.log('Set SETUP_ADMIN_EMAIL in the environment (see .env.example).');
      return;
    }
    console.log(`\nLooking up user with email: ${email}`);
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        reports: true,
        comments: true,
        reportLikes: true,
        commentLikes: true,
        notifications: true,
      },
    });
    if (!user) {
      console.log(`No user found with email ${email}.`);
      console.log('Sign in via Clerk once so a database row exists.');
      return;
    }
    console.log(`\nUser found:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.fullName}`);
    console.log(`   Username: @${user.username}`);
    console.log(`   Admin flag: ${user.isAdmin ? 'YES' : 'NO'}`);
    console.log(`   Reports: ${user.reports.length}`);
    console.log(`   Comments: ${user.comments.length}`);
    console.log(`   Likes: ${user.reportLikes.length + user.commentLikes.length}`);
    console.log(`   Notifications: ${user.notifications.length}`);
    if (!user.isAdmin) {
      console.log(`\nGranting admin...`);
      await prisma.user.update({
        where: { email },
        data: { isAdmin: true },
      });
      console.log(`User is now an admin.`);
    } else {
      console.log(`\nUser is already an admin.`);
    }
    console.log(`\nDeleting this user's content...`);
    const deletedNotifications = await prisma.notification.deleteMany({
      where: { userId: user.id },
    });
    console.log(`   Notifications deleted: ${deletedNotifications.count}`);
    const deletedCommentLikes = await prisma.commentLike.deleteMany({
      where: { userId: user.id },
    });
    console.log(`   Comment likes deleted: ${deletedCommentLikes.count}`);
    const deletedReportLikes = await prisma.reportLike.deleteMany({
      where: { userId: user.id },
    });
    console.log(`   Report likes deleted: ${deletedReportLikes.count}`);
    const deletedComments = await prisma.comment.deleteMany({
      where: { userId: user.id },
    });
    console.log(`   Comments deleted: ${deletedComments.count}`);
    const deletedReports = await prisma.report.deleteMany({
      where: { userId: user.id },
    });
    console.log(`   Reports deleted: ${deletedReports.count}`);
    console.log(`\nUser content cleared.`);
    console.log(`\nSummary:`);
    console.log(`   Email: ${email}`);
    console.log(`   Role: ADMIN`);
    console.log(`   Content: cleared`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}
setupAdmin();
