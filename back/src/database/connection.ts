import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export const connectToDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('Connected to PostgreSQL successfully.');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};