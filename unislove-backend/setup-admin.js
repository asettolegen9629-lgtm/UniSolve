const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function setupAdmin() {
  try {
    const email = 'asettolegen9629@gmail.com';
    console.log(`\n🔍 Ищу пользователя с email: ${email}`);
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        reports: true,
        comments: true,
        reportLikes: true,
        commentLikes: true,
        notifications: true
      }
    });
    if (!user) {
      console.log(`❌ Пользователь с email ${email} не найден в базе данных.`);
      console.log(`   Пользователь должен сначала войти через Clerk, чтобы создать запись в базе.`);
      return;
    }
    console.log(`\n✅ Пользователь найден:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Имя: ${user.fullName}`);
    console.log(`   Username: @${user.username}`);
    console.log(`   Текущий статус админа: ${user.isAdmin ? 'ДА ✅' : 'НЕТ ❌'}`);
    console.log(`   Репортов: ${user.reports.length}`);
    console.log(`   Комментариев: ${user.comments.length}`);
    console.log(`   Лайков: ${user.reportLikes.length + user.commentLikes.length}`);
    console.log(`   Уведомлений: ${user.notifications.length}`);
    if (!user.isAdmin) {
      console.log(`\n🔧 Делаю пользователя админом...`);
      await prisma.user.update({
        where: { email },
        data: { isAdmin: true }
      });
      console.log(`✅ Пользователь теперь админ!`);
    } else {
      console.log(`\n✅ Пользователь уже является админом.`);
    }
    console.log(`\n🗑️  Удаляю данные пользователя...`);
    const deletedNotifications = await prisma.notification.deleteMany({
      where: { userId: user.id }
    });
    console.log(`   Удалено уведомлений: ${deletedNotifications.count}`);
    const deletedCommentLikes = await prisma.commentLike.deleteMany({
      where: { userId: user.id }
    });
    console.log(`   Удалено лайков на комментарии: ${deletedCommentLikes.count}`);
    const deletedReportLikes = await prisma.reportLike.deleteMany({
      where: { userId: user.id }
    });
    console.log(`   Удалено лайков на репорты: ${deletedReportLikes.count}`);
    const deletedComments = await prisma.comment.deleteMany({
      where: { userId: user.id }
    });
    console.log(`   Удалено комментариев: ${deletedComments.count}`);
    const deletedReports = await prisma.report.deleteMany({
      where: { userId: user.id }
    });
    console.log(`   Удалено репортов: ${deletedReports.count}`);
    console.log(`\n✅ Все данные пользователя удалены!`);
    console.log(`\n📊 Итоговый статус:`);
    console.log(`   Email: ${email}`);
    console.log(`   Статус: АДМИН ✅`);
    console.log(`   Данные: Очищены ✅`);
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}
setupAdmin();
