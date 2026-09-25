import { Request, Response } from 'express';
import { logsService } from '../services/logs.service';

export const getLogs = async (req: Request, res: Response) => {
  try {
    const { type, limit } = req.query;
    const logs = await logsService.getLogs(
      type as string | undefined,
      limit ? parseInt(limit as string) : undefined
    );
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch logs',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getLogStats = async (req: Request, res: Response) => {
  try {
    const stats = await logsService.getLogStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch log stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createLog = async (req: Request, res: Response) => {
  try {
    const { type, message, user, details } = req.body;
    
    if (!type || !message || !user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    const log = await logsService.createLog({ type, message, user, details });
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create log',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
