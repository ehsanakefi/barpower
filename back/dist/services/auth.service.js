"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const connection_1 = require("../database/connection");
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
// export const registerUser = async (username: string, password: string) => {
//   const hashedPassword = await bcrypt.hash(password, 10);
//   const newUser = await prisma.user.create({
//     username,
//     password: hashedPassword,
//     role: 'user'
//   });
//   return newUser;
// };
const registerUser = async (username, password) => {
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const newUser = await connection_1.prisma.user.create({
        data: {
            username,
            password: hashedPassword,
            role: 'EDITOR'
        }
    });
    return newUser;
};
exports.registerUser = registerUser;
const loginUser = async (username, password) => {
    const user = await connection_1.prisma.user.findUnique({
        where: {
            username: username
        }
    });
    console.log("Login attempt for user:", user);
    if (!user) {
        throw new Error('User not found');
    }
    const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid password');
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, JWT_SECRET, {
        expiresIn: '1h',
    });
    return { user, token };
};
exports.loginUser = loginUser;
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token)
        return res.sendStatus(401);
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
        if (err)
            return res.sendStatus(403);
        req.user = user;
        next();
    });
};
exports.authenticateToken = authenticateToken;
