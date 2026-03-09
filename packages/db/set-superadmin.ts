
import { PrismaClient } from './generated/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = 'Orbis@8214@@!!';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const superAdminEmail = 'owner@agency.com';
  const username = 'superadmin';
  const fullName = 'Super Admin';

  const user = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      username,
      fullName,
      passwordHash: hash,
      role: 'super_admin' as any,
    },
    create: {
      email: superAdminEmail,
      username,
      fullName,
      passwordHash: hash,
      role: 'super_admin' as any,
      status: 'ACTIVE' as any,
    },
  });

  console.log('Super Admin updated:', user.email, 'Username:', user.username);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
