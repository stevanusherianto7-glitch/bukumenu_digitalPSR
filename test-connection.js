// Quick connection test script
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
  
  try {
    // Test 1: Simple connect
    await prisma.$connect();
    console.log('✅ Connection successful!');
    
    // Test 2: Query database
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Database version:', result[0].version);
    
    // Test 3: Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('✅ Existing tables:', tables.map(t => t.table_name));
    
    await prisma.$disconnect();
    console.log('✅ Disconnected successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();



