const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
//make a function 
async function checkReports() {
  try {
    console.log('\n🔍 Checking reports in database...\n');
    
    const allReports = await prisma.report.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true
          }
        },
        images: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`Total reports: ${allReports.length}`);
    console.log(`Pending (not approved): ${allReports.filter(r => !r.isApproved).length}`);
    console.log(`Approved: ${allReports.filter(r => r.isApproved).length}`);
    
    if (allReports.length > 0) {
      console.log('\n📋 Recent reports:');
      allReports.slice(0, 5).forEach((report, index) => {
        console.log(`\n${index + 1}. Report ID: ${report.id}`);
        console.log(`   Description: ${report.description?.substring(0, 50)}...`);
        console.log(`   User: ${report.user?.fullName} (@${report.user?.username})`);
        console.log(`   Email: ${report.user?.email}`);
        console.log(`   Status: ${report.status}`);
        console.log(`   Approved: ${report.isApproved ? 'YES ✅' : 'NO ❌ (PENDING)'}`);
        console.log(`   Created: ${report.createdAt}`);
        console.log(`   Images: ${report.images.length}`);
      });
    } else {
      console.log('\n⚠️  No reports found in database!');
      console.log('   Make sure users are creating reports through the frontend.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkReports();

