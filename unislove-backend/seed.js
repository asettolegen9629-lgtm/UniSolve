const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
//
async function seed() {
  try {
    console.log('🌱 Добавление тестовых данных...');

    const existingReports = await prisma.report.count();
    if (existingReports > 0) {
      console.log('✅ Тестовые данные уже существуют, пропускаем...');
      return;
    }

    const testUser = await prisma.user.upsert({
      where: { email: 'demo@unisolve.com' },
      update: {},
      create: {
        clerkId: 'demo_user_12345',
        email: 'demo@unisolve.com',
        username: 'demo_student',
        fullName: 'Demo Student',
        isAdmin: false,
      },
    });

    const testAdmin = await prisma.user.upsert({
      where: { email: 'admin@unisolve.com' },
      update: {},
      create: {
        clerkId: 'demo_admin_12345',
        email: 'admin@unisolve.com',
        username: 'demo_admin',
        fullName: 'Demo Admin',
        isAdmin: true,
      },
    });

    const categories = [
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

    const sampleReports = [
      {
        description: 'Broken lights in Block D corridor. The lights have been flickering for several days and need immediate repair.',
        category: 'Lighting',
        status: 'done',
        isApproved: true,
        isVerified: true,
        adminRating: 5,
        userRating: 4,
      },
      {
        description: 'WiFi connection is very slow in the library. Students are having trouble accessing online resources.',
        category: 'WiFi/Internet',
        status: 'in-progress',
        isApproved: true,
        isVerified: true,
        adminRating: 4,
      },
      {
        description: 'Tables in the cafeteria are dirty and need cleaning. Food residue from previous meals is still visible.',
        category: 'Cleaning/Maintenance',
        status: 'done',
        isApproved: true,
        isVerified: true,
        adminRating: 5,
        userRating: 5,
      },
      {
        description: 'Air conditioning is not working in Room 301. The room is too hot for classes.',
        category: 'Heating/Cooling',
        status: 'in-progress',
        isApproved: true,
        isVerified: true,
        adminRating: 3,
      },
      {
        description: 'Water leak in the second floor bathroom. Water is dripping from the ceiling.',
        category: 'Water/Plumbing',
        status: 'done',
        isApproved: true,
        isVerified: true,
        adminRating: 5,
        userRating: 5,
      },
      {
        description: 'Broken chair in Lecture Hall A. One of the chairs has a broken leg and is unsafe to use.',
        category: 'Furniture',
        status: 'done',
        isApproved: true,
        isVerified: true,
        adminRating: 4,
        userRating: 4,
      },
      {
        description: 'Security camera not working near the main entrance. This is a safety concern.',
        category: 'Safety/Security',
        status: 'in-progress',
        isApproved: true,
        isVerified: true,
        adminRating: 5,
      },
      {
        description: 'Projector screen is not displaying properly in Room 205. Colors are distorted.',
        category: 'Technical Issues',
        status: 'done',
        isApproved: true,
        isVerified: true,
        adminRating: 4,
        userRating: 4,
      },
      {
        description: 'Parking lot lights are not working. It is very dark at night and difficult to see.',
        category: 'Parking',
        status: 'in-progress',
        isApproved: true,
        isVerified: true,
        adminRating: 3,
      },
      {
        description: 'Food quality in cafeteria has decreased. Many students are complaining about the meals.',
        category: 'Cafeteria/Food',
        status: 'done',
        isApproved: true,
        isVerified: true,
        adminRating: 4,
        userRating: 3,
      },
    ];

    for (const reportData of sampleReports) {
      const report = await prisma.report.create({
        data: {
          description: reportData.description,
          category: reportData.category,
          status: reportData.status,
          isApproved: reportData.isApproved,
          isVerified: reportData.isVerified,
          adminRating: reportData.adminRating,
          userRating: reportData.userRating,
          userId: testUser.id,
        },
      });

      if (reportData.status === 'done' && reportData.userRating) {
        await prisma.feedback.create({
          data: {
            message: `Thank you for resolving the issue: "${reportData.description.substring(0, 50)}..."`,
            type: 'problem_solved',
            userId: testUser.id,
            reportId: report.id,
            isRead: false,
          },
        });
      }
    }

    console.log(`✅ Добавлено ${sampleReports.length} тестовых постов`);
    console.log('✅ Тестовый пользователь создан: demo@unisolve.com');
    console.log('✅ Тестовый админ создан: admin@unisolve.com');
  } catch (error) {
    console.error('❌ Ошибка при добавлении тестовых данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();

