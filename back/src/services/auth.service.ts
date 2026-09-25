import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../database/connection';

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
export const registerUser = async (username: string, password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      role: 'EDITOR'
    }
  });

  return newUser;
};
export const loginUser = async (username: string, password: string) => {
  const user = await prisma.user.findUnique({
  where: {
    username: username
  }
});
  console.log("Login attempt for user:", user);
  if (!user) {
    throw new Error('User not found');
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: '1h',
  });
  return { user, token };
};

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    (req as any).user = user;
    next();
  });
};
