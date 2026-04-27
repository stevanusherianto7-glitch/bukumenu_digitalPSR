
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seed user starting...');

    const email = 'admin@pawonsalam.com';
    const password = 'password123';
    const passwordHash = await bcrypt.hash(password, 10);

    // Upsert user: Create if not exists, update if exists
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            passwordHash, // Reset password to known one
            role: Role.SUPER_ADMIN,
        },
        create: {
            email,
            passwordHash,
            name: 'Super Admin',
            role: Role.SUPER_ADMIN,
        },
    });

    console.log('✅ User seeded successfully:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${user.role}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
