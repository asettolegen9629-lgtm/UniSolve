const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupAdminUser() {
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
        reports: {
          include: {
            images: true,
            comments: true,
            likes: true,
          },
        },
        comments: {
          include: {
            likes: true,
            replies: true,
          },
        },
        reportLikes: true,
        commentLikes: true,
        notifications: true,
      },
    });
    if (!user) {
      console.log(`No user found with email ${email}.`);
      return;
    }
    console.log(`\nCurrent user snapshot:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.fullName}`);
    console.log(`   Username: @${user.username}`);
    console.log(`   Admin: ${user.isAdmin ? 'YES' : 'NO'}`);
    console.log(`   Reports: ${user.reports.length}`);
    console.log(`   Comments: ${user.comments.length}`);
    console.log(`   Report likes: ${user.reportLikes.length}`);
    console.log(`   Comment likes: ${user.commentLikes.length}`);
    console.log(`   Notifications: ${user.notifications.length}`);
    let totalDeleted = 0;
    console.log(`\nStarting full cleanup...`);
    const deletedNotifications = await prisma.notification.deleteMany({
      where: { userId: user.id },
    });
    totalDeleted += deletedNotifications.count;
    console.log(`   Notifications deleted: ${deletedNotifications.count}`);
    const deletedCommentLikes = await prisma.commentLike.deleteMany({
      where: { userId: user.id },
    });
    totalDeleted += deletedCommentLikes.count;
    console.log(`   Comment likes deleted: ${deletedCommentLikes.count}`);
    const deletedReportLikes = await prisma.reportLike.deleteMany({
      where: { userId: user.id },
    });
    totalDeleted += deletedReportLikes.count;
    console.log(`   Report likes deleted: ${deletedReportLikes.count}`);
    const userComments = await prisma.comment.findMany({
      where: { userId: user.id },
      select: { id: true },
    });
    for (const comment of userComments) {
      await prisma.comment.deleteMany({
        where: { parentCommentId: comment.id },
      });
    }
    const deletedComments = await prisma.comment.deleteMany({
      where: { userId: user.id },
    });
    totalDeleted += deletedComments.count;
    console.log(`   Comments deleted: ${deletedComments.count}`);
    const deletedReports = await prisma.report.deleteMany({
      where: { userId: user.id },
    });
    totalDeleted += deletedReports.count;
    console.log(`   Reports deleted: ${deletedReports.count}`);
    if (!user.isAdmin) {
      await prisma.user.update({
        where: { email },
        data: { isAdmin: true },
      });
      console.log(`   User promoted to admin`);
    }
    await prisma.user.update({
      where: { email },
      data: {
        profilePicture: null,
      },
    });
    console.log(`   Profile picture cleared`);
    console.log(`\nCleanup complete.`);
    console.log(`\nSummary:`);
    console.log(`   Email: ${email}`);
    console.log(`   Role: ADMIN only`);
    console.log(`   Rows removed: ${totalDeleted}`);
    console.log(`   Reports / comments / likes / notifications: 0`);
    console.log(`\nThis account is ready for admin-panel-only use.`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}
cleanupAdminUser();
