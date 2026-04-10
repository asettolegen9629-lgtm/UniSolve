const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function cleanupAdminUser() {
  try {
    const email = 'asettolegen9629@gmail.com';
    console.log(`\n🔍 Ищу пользователя с email: ${email}`);
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        reports: {
          include: {
            images: true,
            comments: true,
            likes: true
          }
        },
        comments: {
          include: {
            likes: true,
            replies: true
          }
        },
        reportLikes: true,
        commentLikes: true,
        notifications: true
      }
    });
    if (!user) {
      console.log(`❌ Пользователь с email ${email} не найден в базе данных.`);
      return;
    }
    console.log(`\n📊 Текущее состояние пользователя:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Имя: ${user.fullName}`);
    console.log(`   Username: @${user.username}`);
    console.log(`   Статус админа: ${user.isAdmin ? 'ДА ✅' : 'НЕТ ❌'}`);
    console.log(`   Репортов: ${user.reports.length}`);
    console.log(`   Комментариев: ${user.comments.length}`);
    console.log(`   Лайков на репорты: ${user.reportLikes.length}`);
    console.log(`   Лайков на комментарии: ${user.commentLikes.length}`);
    console.log(`   Уведомлений: ${user.notifications.length}`);
    let totalDeleted = 0;
    console.log(`\n🗑️  Начинаю полную очистку данных...`);
    const deletedNotifications = await prisma.notification.deleteMany({
      where: { userId: user.id }
    });
    totalDeleted += deletedNotifications.count;
    console.log(`   ✅ Удалено уведомлений: ${deletedNotifications.count}`);
    const deletedCommentLikes = await prisma.commentLike.deleteMany({
      where: { userId: user.id }
    });
    totalDeleted += deletedCommentLikes.count;
    console.log(`   ✅ Удалено лайков на комментарии: ${deletedCommentLikes.count}`);
    const deletedReportLikes = await prisma.reportLike.deleteMany({
      where: { userId: user.id }
    });
    totalDeleted += deletedReportLikes.count;
    console.log(`   ✅ Удалено лайков на репорты: ${deletedReportLikes.count}`);
    const userComments = await prisma.comment.findMany({
      where: { userId: user.id },
      select: { id: true }
    });
    for (const comment of userComments) {
      await prisma.comment.deleteMany({
        where: { parentCommentId: comment.id }
      });
    }
    const deletedComments = await prisma.comment.deleteMany({
      where: { userId: user.id }
    });
    totalDeleted += deletedComments.count;
    console.log(`   ✅ Удалено комментариев: ${deletedComments.count}`);
    const deletedReports = await prisma.report.deleteMany({
      where: { userId: user.id }
    });
    totalDeleted += deletedReports.count;
    console.log(`   ✅ Удалено репортов: ${deletedReports.count}`);
    if (!user.isAdmin) {
      await prisma.user.update({
        where: { email },
        data: { isAdmin: true }
      });
      console.log(`   ✅ Пользователь назначен админом`);
    }
    await prisma.user.update({
      where: { email },
      data: { 
        profilePicture: null,
      }
    });
    console.log(`   ✅ Профиль очищен`);
    console.log(`\n✅ Полная очистка завершена!`);
    console.log(`\n📊 Итоговый статус:`);
    console.log(`   Email: ${email}`);
    console.log(`   Статус: ТОЛЬКО АДМИН ✅`);
    console.log(`   Удалено записей: ${totalDeleted}`);
    console.log(`   Репортов: 0`);
    console.log(`   Комментариев: 0`);
    console.log(`   Лайков: 0`);
    console.log(`   Уведомлений: 0`);
    console.log(`\n⚠️  Пользователь теперь может использовать ТОЛЬКО админ-панель!`);
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}
cleanupAdminUser();
//
