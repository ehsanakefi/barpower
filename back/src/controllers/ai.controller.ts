import { Request, Response } from 'express';
import { aiService } from '../services/ai.service';

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { message, conversationId } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message is required' 
      });
    }
    
    const response = await aiService.processMessage(message, conversationId);
    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process message',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getConversationHistory = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const history = await aiService.getConversationHistory(String(conversationId));
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch conversation history',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
