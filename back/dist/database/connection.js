"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = exports.prisma = void 0;
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
const connectToDatabase = async () => {
    try {
        await exports.prisma.$connect();
        console.log('Connected to PostgreSQL successfully.');
    }
    catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};
exports.connectToDatabase = connectToDatabase;
