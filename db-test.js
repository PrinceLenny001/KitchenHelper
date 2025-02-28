import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Test the connection
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    console.log('Database connection successful:', result);
    
    // Try to get users table info
    try {
      const users = await prisma.user.findMany();
      console.log('Users table exists, count:', users.length);
    } catch (error) {
      console.log('Users table may not exist yet:', error.message);
    }
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 