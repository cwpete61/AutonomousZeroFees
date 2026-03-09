import { PrismaClient, UserRole, UserStatus } from '../../generated/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const superAdminPassword = 'Orbis@8214@@!!';
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(superAdminPassword, saltRounds);

  const superAdmin = await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: {
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      fullName: 'Super Admin',
      status: UserStatus.UNBLOCKED,
    },
    create: {
      email: 'admin@autonomous-web.agency',
      username: 'superadmin',
      passwordHash,
      fullName: 'Super Admin',
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.UNBLOCKED,
    },
  });

  console.log('✅ Super Admin created/updated:', superAdmin.username);
  console.log('🚀 Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
