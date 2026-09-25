import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/auth.service';

export const register = async (req: Request, res: Response) => {
  try {
    const user = await registerUser(req.body.username, req.body.password);
    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await loginUser(req.body.username, req.body.password);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(401).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};
